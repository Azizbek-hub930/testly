import { UploadCloud } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState, type DragEvent } from "react";
import { toast } from "sonner";

import { CheckMark } from "@/components/landing/ai-engine";
import { TestlyPulse } from "@/components/site/testly-loader";
import { uploadDocument, type DocumentSummary, type UploadPhase } from "@/lib/api/documents";
import { useAuth } from "@/lib/auth/context";
import { toFriendlyMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { formatBytes, MAX_FILE_BYTES, validateSourceFile } from "@/lib/validation";

type UploadState = "idle" | "uploading" | "extracting" | "done";

/**
 * The real upload. Same dropzone language as the landing preview — dashed
 * paper edge, indigo fill, the check mark drawing itself on completion — but
 * the progress bar is driven by actual bytes on the wire.
 */
export function SourceUploader({
  onUploaded,
}: {
  onUploaded?: (document: DocumentSummary) => void;
}) {
  const { user, session } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const busy = state === "uploading" || state === "extracting";

  const start = async (file: File) => {
    if (busy) return;
    setError(null);

    const check = validateSourceFile(file);
    if (!check.ok) {
      setError(check.message);
      toast.error(check.message);
      return;
    }

    if (!user || !session) {
      setError("Your session expired. Please sign in again.");
      return;
    }

    setFileName(file.name);
    setProgress(0);
    setState("uploading");

    try {
      const document = await uploadDocument({
        file,
        userId: user.id,
        accessToken: session.access_token,
        onProgress: setProgress,
        onPhase: (phase: UploadPhase) =>
          setState(phase === "extracting" ? "extracting" : "uploading"),
      });

      setState("done");

      // Extraction runs server-side and decides the final status, so report what
      // actually happened rather than assuming success.
      if (document.status === "failed") {
        const message = document.error_message ?? "We couldn't read that PDF.";
        setError(message);
        toast.error(message);
      } else if (document.error_message) {
        toast.warning(document.error_message);
      } else {
        toast.success(`${file.name} is ready to use as a source.`);
      }

      onUploaded?.(document);
    } catch (caught) {
      const message = toFriendlyMessage(caught, "upload");
      setError(message);
      toast.error(message);
      setState("idle");
      setProgress(0);
    }
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void start(file);
  };

  return (
    <div>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "rounded-2xl border border-dashed p-5 transition-colors",
          state === "idle" && !dragging && "border-border",
          dragging && "border-indigo/60 bg-indigo/8",
          state !== "idle" && "border-indigo/40 bg-indigo/5",
        )}
      >
        {state === "idle" ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-start text-left"
          >
            <UploadCloud className="h-6 w-6 text-indigo" />
            <p className="mt-4 text-sm font-medium">
              {dragging ? "Drop to upload" : "Drop your source here"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              PDF, up to {formatBytes(MAX_FILE_BYTES)}
            </p>
          </button>
        ) : (
          <div>
            <div className="flex w-full items-center gap-2">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-navy text-[9px] font-semibold text-background">
                PDF
              </span>
              <p className="min-w-0 flex-1 truncate text-sm font-medium">{fileName}</p>
              {state === "done" ? (
                <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-indigo">
                  <CheckMark active /> Ready
                </span>
              ) : state === "extracting" ? (
                <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-indigo">
                  <TestlyPulse /> Reading text
                </span>
              ) : (
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {progress}%
                </span>
              )}
            </div>
            <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-border">
              {state === "extracting" ? (
                // Extraction has no byte count to report, so the bar keeps
                // moving rather than pretending to know a percentage.
                <motion.div
                  className="h-full w-1/3 rounded-full bg-indigo"
                  animate={{ x: ["-100%", "300%"] }}
                  transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
                />
              ) : (
                <motion.div
                  className="h-full rounded-full bg-indigo"
                  animate={{ width: `${state === "done" ? 100 : progress}%` }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </div>
            {state === "done" ? (
              <button
                type="button"
                onClick={() => {
                  setState("idle");
                  setProgress(0);
                  setFileName("");
                }}
                className="mt-4 text-xs font-medium text-indigo hover:underline"
              >
                Upload another
              </button>
            ) : null}
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void start(file);
            event.target.value = "";
          }}
        />
      </div>

      {error ? (
        <p role="alert" className="mt-3 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
