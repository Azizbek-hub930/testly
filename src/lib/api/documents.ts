import { SOURCES_BUCKET } from "@/lib/buckets";
import { extractDocumentText } from "@/rpc/documents";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { DocumentRow } from "@/lib/supabase/types";

export { SOURCES_BUCKET };

/**
 * Source documents.
 *
 * Files live in a private bucket under `sources/<user-id>/<document-id>.pdf`.
 * Storage policies key off that first path segment, so a user physically cannot
 * read or write another user's folder — the row in `documents` is only the
 * index.
 */

/**
 * `extracted_text` is deliberately excluded: it can run to 200,000 characters
 * and no list or picker needs it. Only the generation pipeline reads it, and
 * that happens server-side.
 */
const DOCUMENT_COLUMNS =
  "id, user_id, file_name, file_size, file_type, storage_path, status, error_message, created_at, updated_at";

export type DocumentSummary = Omit<DocumentRow, "extracted_text">;

export async function listDocuments(): Promise<DocumentSummary[]> {
  const { data, error } = await getSupabaseClient()
    .from("documents")
    .select(DOCUMENT_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getDocument(id: string): Promise<DocumentSummary | null> {
  const { data, error } = await getSupabaseClient()
    .from("documents")
    .select(DOCUMENT_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/** Which stage of the upload the user is looking at. */
export type UploadPhase = "uploading" | "extracting";

export interface UploadOptions {
  file: File;
  userId: string;
  /** Needed so the server can verify the caller before it reads the file. */
  accessToken: string;
  onProgress?: ((percent: number) => void) | undefined;
  onPhase?: ((phase: UploadPhase) => void) | undefined;
  signal?: AbortSignal | undefined;
}

/**
 * Upload, then index.
 *
 * `uploading` → `processing` (text extraction) → `ready`, which is exactly what
 * the `documents.status` values were defined for. If extraction is unavailable
 * because the server has no service-role key, the document is still marked
 * ready — the file is perfectly good, it just hasn't been indexed.
 */
export async function uploadDocument({
  file,
  userId,
  accessToken,
  onProgress,
  onPhase,
  signal,
}: UploadOptions): Promise<DocumentSummary> {
  const supabase = getSupabaseClient();
  const documentId = crypto.randomUUID();
  const storagePath = `${userId}/${documentId}.pdf`;

  // The row is created first so a failed upload leaves a visible `failed`
  // record rather than an orphaned file or nothing at all.
  const { error: insertError } = await supabase.from("documents").insert({
    id: documentId,
    user_id: userId,
    file_name: file.name,
    file_size: file.size,
    file_type: file.type || "application/pdf",
    storage_path: storagePath,
    status: "uploading",
  });

  if (insertError) throw insertError;

  onPhase?.("uploading");

  try {
    await putFile({ supabasePath: storagePath, file, onProgress, signal });
  } catch (error) {
    await supabase
      .from("documents")
      .update({ status: "failed", error_message: "Upload failed." })
      .eq("id", documentId);
    throw error;
  }

  onPhase?.("extracting");

  try {
    const outcome = await extractDocumentText({ data: { accessToken, documentId } });

    // The server sets the final status itself, except when it couldn't run at
    // all — then the file stays usable, just unindexed.
    if (!outcome.ok && outcome.code === "not-configured") {
      await supabase
        .from("documents")
        .update({ status: "ready", error_message: null })
        .eq("id", documentId);
    }
  } catch (error) {
    // A transport failure must not lose a file that uploaded fine.
    console.error("[testly:extraction]", error);
    await supabase
      .from("documents")
      .update({ status: "ready", error_message: "Text couldn't be indexed." })
      .eq("id", documentId);
  }

  const { data, error } = await supabase
    .from("documents")
    .select(DOCUMENT_COLUMNS)
    .eq("id", documentId)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDocument(document: DocumentSummary): Promise<void> {
  const supabase = getSupabaseClient();

  // Storage first: a leftover row is recoverable, a leftover file is not
  // reachable through the UI at all.
  const { error: storageError } = await supabase.storage
    .from(SOURCES_BUCKET)
    .remove([document.storage_path]);

  if (storageError) throw storageError;

  const { error } = await supabase.from("documents").delete().eq("id", document.id);
  if (error) throw error;
}

/** Short-lived link so a user can re-download their own source. */
export async function createDownloadUrl(document: DocumentSummary): Promise<string> {
  const { data, error } = await getSupabaseClient()
    .storage.from(SOURCES_BUCKET)
    .createSignedUrl(document.storage_path, 60);

  if (error) throw error;
  return data.signedUrl;
}

// ---------------------------------------------------------------------------

interface PutFileOptions {
  supabasePath: string;
  file: File;
  onProgress?: ((percent: number) => void) | undefined;
  signal?: AbortSignal | undefined;
}

/**
 * Uploads through a signed upload URL with XMLHttpRequest, because `fetch` —
 * and therefore supabase-js — cannot report upload progress.
 *
 * The request mirrors what storage-js's own `uploadToSignedUrl` sends: PUT to
 * the signed URL, a multipart body with `cacheControl` and the file under an
 * empty field name, and an `x-upsert` header. If the endpoint rejects the shape
 * of the request (404/405), we fall back to the supported client upload rather
 * than failing the whole upload — the user loses the progress bar, not the file.
 */
async function putFile({ supabasePath, file, onProgress, signal }: PutFileOptions): Promise<void> {
  const supabase = getSupabaseClient();

  const { data: signed, error: signError } = await supabase.storage
    .from(SOURCES_BUCKET)
    .createSignedUploadUrl(supabasePath);

  if (signError || !signed) {
    await plainUpload(supabasePath, file, onProgress);
    return;
  }

  try {
    await xhrUpload(signed.signedUrl, file, onProgress, signal);
  } catch (error) {
    const status = (error as { status?: number }).status;
    if (status === 404 || status === 405) {
      await plainUpload(supabasePath, file, onProgress);
      return;
    }
    throw error;
  }
}

async function plainUpload(
  supabasePath: string,
  file: File,
  onProgress?: ((percent: number) => void) | undefined,
): Promise<void> {
  const { error } = await getSupabaseClient()
    .storage.from(SOURCES_BUCKET)
    .upload(supabasePath, file, {
      contentType: file.type || "application/pdf",
      upsert: false,
    });

  if (error) throw error;
  onProgress?.(100);
}

function xhrUpload(
  signedUrl: string,
  file: File,
  onProgress?: ((percent: number) => void) | undefined,
  signal?: AbortSignal | undefined,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const body = new FormData();
    body.append("cacheControl", "3600");
    body.append("", file);

    xhr.open("PUT", signedUrl, true);
    xhr.setRequestHeader("x-upsert", "false");

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress?.(Math.min(99, Math.round((event.loaded / event.total) * 100)));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
        return;
      }
      reject(parseStorageError(xhr.responseText, xhr.status));
    };

    xhr.onerror = () => reject(new Error("Failed to fetch"));
    xhr.onabort = () => reject(new DOMException("Upload cancelled", "AbortError"));

    signal?.addEventListener("abort", () => xhr.abort(), { once: true });
    xhr.send(body);
  });
}

function parseStorageError(body: string, status: number): Error & { status: number } {
  let message = "That upload didn't finish.";
  try {
    const parsed: unknown = JSON.parse(body);
    if (parsed && typeof parsed === "object" && "message" in parsed) {
      const value = (parsed as { message: unknown }).message;
      if (typeof value === "string" && value.length > 0) message = value;
    }
  } catch {
    // Non-JSON body — keep the default message.
  }

  return Object.assign(new Error(message), { status });
}
