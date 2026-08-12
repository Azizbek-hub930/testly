import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Download, FileText, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Cta } from "@/components/site/cta";
import { Reveal } from "@/components/site/reveal";
import { SourceUploader } from "@/components/workspace/source-uploader";
import {
  EmptyState,
  ErrorState,
  PageHeader,
  PanelCard,
  StatusPill,
  TableSkeleton,
  formatDate,
} from "@/components/workspace/ui";
import {
  createDownloadUrl,
  deleteDocument,
  listDocuments,
  type DocumentSummary,
} from "@/lib/api/documents";
import { useAuth } from "@/lib/auth/context";
import { toFriendlyMessage } from "@/lib/errors";

import { formatBytes } from "@/lib/validation";

export const Route = createFileRoute("/dashboard/sources")({
  component: Sources,
});

function Sources() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);

  const documents = useQuery({
    queryKey: ["documents", user?.id],
    queryFn: listDocuments,
    enabled: Boolean(user?.id),
  });

  const remove = useMutation({
    mutationFn: (document: DocumentSummary) => deleteDocument(document),
    onMutate: (document) => setBusyId(document.id),
    onSuccess: () => {
      toast.success("Source deleted.");
      void queryClient.invalidateQueries({ queryKey: ["documents"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "counts"] });
    },
    onError: (error) => toast.error(toFriendlyMessage(error, "upload")),
    onSettled: () => setBusyId(null),
  });

  const download = async (document: DocumentSummary) => {
    setBusyId(document.id);
    try {
      const url = await createDownloadUrl(document);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(toFriendlyMessage(error, "upload"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Sources"
        title="Source material."
        actions={
          <Cta size="sm" variant="accent" asChild>
            <Link to="/dashboard/assessments/new">
              Create assessment <span aria-hidden>→</span>
            </Link>
          </Cta>
        }
      />

      <Reveal>
        <div className="paper-card p-5 sm:p-6">
          <p className="eyebrow text-muted-foreground">Upload source</p>
          <p className="mt-2 max-w-lg text-sm text-muted-foreground">
            Upload an academic paper or article. Files are private to your account and stay that way
            — they're never shared between users.
          </p>
          <div className="mt-5">
            <SourceUploader
              onUploaded={() => {
                void queryClient.invalidateQueries({ queryKey: ["documents"] });
                void queryClient.invalidateQueries({ queryKey: ["dashboard", "counts"] });
              }}
            />
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.06}>
        <PanelCard title="Your sources">
          {documents.isPending ? (
            <TableSkeleton rows={3} columns={4} />
          ) : documents.isError ? (
            <ErrorState
              message={toFriendlyMessage(documents.error, "upload")}
              onRetry={() => void documents.refetch()}
            />
          ) : (documents.data?.length ?? 0) === 0 ? (
            <EmptyState
              icon={FileText}
              title="No sources yet"
              description="Upload a PDF above and it becomes available as source material for every assessment you generate."
            />
          ) : (
            <ul>
              {documents.data?.map((document) => (
                <li
                  key={document.id}
                  className="flex flex-wrap items-center gap-4 border-b border-hairline px-5 py-4 last:border-0"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-navy text-[9px] font-semibold text-background">
                    PDF
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{document.file_name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatBytes(document.file_size)} · {formatDate(document.created_at)}
                    </p>
                    {document.error_message ? (
                      <p
                        className={
                          "mt-1.5 text-xs " +
                          (document.status === "failed"
                            ? "text-destructive"
                            : "text-muted-foreground")
                        }
                      >
                        {document.error_message}
                      </p>
                    ) : null}
                  </div>
                  <StatusPill status={document.status} />
                  <div className="flex shrink-0 items-center gap-1">
                    <IconButton
                      label="Download"
                      onClick={() => void download(document)}
                      disabled={busyId === document.id}
                    >
                      <Download className="h-4 w-4" />
                    </IconButton>
                    <IconButton
                      label="Delete"
                      destructive
                      onClick={() => {
                        if (
                          window.confirm(
                            `Delete "${document.file_name}"? Assessments already generated from it are kept.`,
                          )
                        ) {
                          remove.mutate(document);
                        }
                      }}
                      disabled={busyId === document.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </PanelCard>
      </Reveal>
    </div>
  );
}

function IconButton({
  label,
  children,
  onClick,
  disabled,
  destructive = false,
}: {
  label: string;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={
        "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors disabled:opacity-50 " +
        (destructive
          ? "hover:border-destructive/40 hover:text-destructive"
          : "hover:border-indigo/40 hover:text-foreground")
      }
    >
      {children}
    </button>
  );
}
