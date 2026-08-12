import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { SOURCES_BUCKET } from "@/lib/buckets";
import { UnauthorizedError, requireUser } from "@/server/auth.server";
import { MIN_USEFUL_CHARS, extractPdfText } from "@/server/pdf.server";
import { getServiceClient, ServiceRoleUnavailableError } from "@/server/supabase.server";

/**
 * Extracts the text of an uploaded PDF and stores it against the document.
 *
 * Server-side because it reads a private storage object with the service-role
 * key and writes `documents.extracted_text`, a column no client may write.
 * Ownership is re-checked against the caller's verified user id.
 */

const inputSchema = z.object({
  accessToken: z.string().min(10),
  documentId: z.string().uuid(),
});

export type ExtractionOutcome =
  | { ok: true; characters: number; pages: number; truncated: boolean }
  | { ok: false; code: "not-configured" | "not-found" | "no-text" | "failed"; message: string };

export const extractDocumentText = createServerFn({ method: "POST" })
  .validator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<ExtractionOutcome> => {
    let documentId: string | null = null;

    try {
      const user = await requireUser(data.accessToken);
      const supabase = getServiceClient();

      const { data: document, error: loadError } = await supabase
        .from("documents")
        .select("id, user_id, storage_path")
        .eq("id", data.documentId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (loadError) throw loadError;
      if (!document) {
        return { ok: false, code: "not-found", message: "We couldn't find that document." };
      }

      documentId = document.id;

      await supabase
        .from("documents")
        .update({ status: "processing", error_message: null })
        .eq("id", document.id);

      const { data: file, error: downloadError } = await supabase.storage
        .from(SOURCES_BUCKET)
        .download(document.storage_path);

      if (downloadError || !file) throw downloadError ?? new Error("Storage download failed");

      const result = await extractPdfText(new Uint8Array(await file.arrayBuffer()));

      if (result.text.length < MIN_USEFUL_CHARS) {
        const message =
          "No selectable text found. This PDF looks like a scan — try a text-based PDF.";
        await supabase
          .from("documents")
          .update({ status: "failed", error_message: message })
          .eq("id", document.id);
        return { ok: false, code: "no-text", message };
      }

      await supabase
        .from("documents")
        .update({
          status: "ready",
          extracted_text: result.text,
          error_message: result.truncated
            ? "Long document — only the first 200,000 characters were indexed."
            : null,
        })
        .eq("id", document.id);

      return {
        ok: true,
        characters: result.text.length,
        pages: result.pages,
        truncated: result.truncated,
      };
    } catch (error) {
      console.error("[testly:extraction]", error);

      if (error instanceof UnauthorizedError) {
        return { ok: false, code: "failed", message: error.message };
      }
      if (error instanceof ServiceRoleUnavailableError) {
        // The file is uploaded and fine; only indexing is unavailable. The
        // caller marks the document ready so it stays usable.
        return {
          ok: false,
          code: "not-configured",
          message: "Text extraction isn't configured on the server (missing service-role key).",
        };
      }

      const message = "We couldn't read the text in that PDF.";
      if (documentId) {
        try {
          await getServiceClient()
            .from("documents")
            .update({ status: "failed", error_message: message })
            .eq("id", documentId);
        } catch (updateError) {
          console.error("[testly:extraction] could not mark document failed", updateError);
        }
      }

      return { ok: false, code: "failed", message };
    }
  });
