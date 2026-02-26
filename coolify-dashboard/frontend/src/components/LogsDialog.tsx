import { useEffect, useRef } from "react";
import { X, RefreshCw } from "lucide-react";
import { Dialog, Spinner, ErrorAlert } from "@/components/ui/shared";
import { useApplicationLogs } from "@/hooks/use-coolify";

interface LogsDialogProps {
  open: boolean;
  onClose: () => void;
  appUuid: string;
  appName: string;
}

export function LogsDialog({ open, onClose, appUuid, appName }: LogsDialogProps) {
  const { data, isLoading, error, refetch } = useApplicationLogs(
    open ? appUuid : "",
    200
  );
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data?.logs && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [data?.logs]);

  const logLines = data?.logs
    ? data.logs.split("\n").filter((line) => line.trim())
    : [];

  return (
    <Dialog open={open} onClose={onClose} className="max-w-4xl max-h-[80vh] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Logs: {appName}
          </h2>
          <p className="text-xs text-gray-500">
            UUID: {appUuid}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="btn-icon btn-secondary"
            title="Refresh logs"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button onClick={onClose} className="btn-icon btn-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-lg bg-gray-950 border border-gray-800 p-4 font-mono text-xs min-h-[300px]">
        {isLoading && (
          <div className="flex items-center justify-center py-8 gap-2">
            <Spinner />
            <span className="text-gray-400">Loading logs...</span>
          </div>
        )}

        {error && (
          <ErrorAlert
            message={(error as Error).message}
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !error && logLines.length === 0 && (
          <p className="text-gray-500 text-center py-8">No logs available</p>
        )}

        {logLines.map((line, i) => (
          <div
            key={i}
            className="py-0.5 hover:bg-gray-900/50 leading-relaxed text-gray-300 whitespace-pre-wrap break-all"
          >
            <span className="text-gray-600 select-none mr-3">
              {String(i + 1).padStart(4, " ")}
            </span>
            {line}
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </Dialog>
  );
}
