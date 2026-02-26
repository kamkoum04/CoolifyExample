import { useState, useEffect, useRef } from "react";
import {
  X,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Rocket,
  GitCommit,
  Timer,
  Server,
  Ban,
  Eye,
  EyeOff,
} from "lucide-react";
import { Dialog, Spinner, ErrorAlert } from "@/components/ui/shared";
import { useAppDeployments } from "@/hooks/use-coolify";
import { getDeployment } from "@/services/api";
import type { Deployment, DeploymentLogEntry } from "@/types/coolify";

interface DeploymentLogsDialogProps {
  open: boolean;
  onClose: () => void;
  appUuid: string;
  appName: string;
}

// ---- Helpers ----

function parseDeploymentLogs(logsRaw: string | null | undefined): DeploymentLogEntry[] {
  if (!logsRaw) return [];
  try {
    const parsed = JSON.parse(logsRaw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [{ command: null, output: logsRaw, type: "stdout", timestamp: "", hidden: false }];
  }
}

function formatTimestamp(ts: string | null | undefined): string {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}

function formatDuration(start: string, end: string | null): string {
  if (!end) return "—";
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  const diffSec = Math.floor((endMs - startMs) / 1000);
  if (diffSec < 0) return "—";
  const mins = Math.floor(diffSec / 60);
  const secs = diffSec % 60;
  return `${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ---- Status helpers ----

function getStatusConfig(status: string) {
  const s = (status || "").toLowerCase();
  if (s.includes("finished") || s.includes("success")) {
    return {
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
      label: "Success",
      badgeCls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      barCls: "bg-emerald-500",
    };
  }
  if (s.includes("failed") || s.includes("error")) {
    return {
      icon: <XCircle className="h-4 w-4 text-red-400" />,
      label: "Failed",
      badgeCls: "bg-red-500/20 text-red-400 border-red-500/30",
      barCls: "bg-red-500",
    };
  }
  if (s.includes("cancelled")) {
    return {
      icon: <Ban className="h-4 w-4 text-orange-400" />,
      label: "Cancelled",
      badgeCls: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      barCls: "bg-orange-500",
    };
  }
  if (s.includes("in_progress") || s.includes("building") || s.includes("deploying")) {
    return {
      icon: <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />,
      label: "In Progress",
      badgeCls: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      barCls: "bg-blue-500 animate-pulse",
    };
  }
  if (s.includes("queued")) {
    return {
      icon: <Clock className="h-4 w-4 text-yellow-400" />,
      label: "Queued",
      badgeCls: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      barCls: "bg-yellow-500",
    };
  }
  return {
    icon: <Clock className="h-4 w-4 text-gray-400" />,
    label: status || "Unknown",
    badgeCls: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    barCls: "bg-gray-500",
  };
}

// ---- Log line coloring ----

function getLogLineColor(entry: DeploymentLogEntry): string {
  if (entry.type === "stderr") return "text-red-400";
  const out = entry.output?.toLowerCase() || "";
  if (out.includes("error") || out.includes("failed")) return "text-red-400";
  if (out.includes("warning")) return "text-yellow-400";
  if (
    out.includes("success") ||
    out.includes("done") ||
    out.includes("finished") ||
    out.includes("started") ||
    out.includes("completed")
  )
    return "text-emerald-400";
  if (out.startsWith("---")) return "text-gray-600";
  return "text-gray-300";
}

// ---- Deployment Row ----

function DeploymentRow({ deployment, defaultExpanded }: { deployment: Deployment; defaultExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded || false);
  const [showHidden, setShowHidden] = useState(false);
  const [logs, setLogs] = useState<DeploymentLogEntry[] | null>(null);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const stConfig = getStatusConfig(deployment.status);
  const duration = formatDuration(deployment.created_at, deployment.finished_at || deployment.updated_at);
  const commitShort = deployment.commit ? deployment.commit.substring(0, 7) : "—";

  // Auto-load logs if defaultExpanded
  useEffect(() => {
    if (defaultExpanded && !logs && deployment.logs) {
      const parsed = parseDeploymentLogs(deployment.logs);
      if (parsed.length > 0) setLogs(parsed);
    }
  }, [defaultExpanded, deployment.logs, logs]);

  const handleToggle = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpanded(true);

    if (logs) return; // Already loaded

    // Parse embedded logs
    if (deployment.logs) {
      const parsed = parseDeploymentLogs(deployment.logs);
      if (parsed.length > 0) {
        setLogs(parsed);
        return;
      }
    }

    // Fetch from API if no embedded logs
    setLoadingLogs(true);
    try {
      const detail = await getDeployment(deployment.deployment_uuid);
      setLogs(parseDeploymentLogs(detail.logs));
    } catch (e) {
      setLogs([
        {
          command: null,
          output: `Failed to load logs: ${(e as Error).message}`,
          type: "stderr",
          timestamp: "",
          hidden: false,
        },
      ]);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (expanded && logs && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [expanded, logs]);

  const visibleLogs = logs
    ? showHidden
      ? logs
      : logs.filter((l) => !l.hidden)
    : [];
  const hiddenCount = logs ? logs.filter((l) => l.hidden).length : 0;

  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden">
      {/* Status accent bar */}
      <div className={`h-0.5 ${stConfig.barCls}`} />

      {/* Deployment Header */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center gap-3 px-4 py-3 bg-gray-900/50 hover:bg-gray-800/70 transition-colors text-left"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
        )}

        {stConfig.icon}

        <div className="flex-1 min-w-0">
          {/* Row 1: Status + Commit */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${stConfig.badgeCls}`}
            >
              {stConfig.label}
            </span>

            <span className="flex items-center gap-1 text-xs text-gray-400">
              <GitCommit className="h-3 w-3" />
              {commitShort}
            </span>

            {deployment.commit_message && (
              <span className="text-xs text-gray-500 truncate max-w-[250px]">
                — {deployment.commit_message}
              </span>
            )}
          </div>

          {/* Row 2: Timing info */}
          <div className="flex items-center gap-4 mt-1 flex-wrap">
            <span className="flex items-center gap-1 text-[11px] text-gray-500">
              <Clock className="h-3 w-3" />
              Started: {formatTimestamp(deployment.created_at)}
            </span>

            {deployment.finished_at && (
              <span className="text-[11px] text-gray-500">
                Ended: {formatTimestamp(deployment.finished_at)}
              </span>
            )}

            <span className="flex items-center gap-1 text-[11px] text-gray-500">
              <Timer className="h-3 w-3" />
              Duration: {duration}
            </span>

            {deployment.finished_at && (
              <span className="text-[11px] text-gray-600">
                Finished {timeAgo(deployment.finished_at)}
              </span>
            )}
          </div>
        </div>

        {/* Right side badges */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {deployment.is_api && (
            <span className="text-[10px] text-gray-500 bg-gray-800 border border-gray-700 rounded px-1.5 py-0.5 font-medium">
              API
            </span>
          )}
          {deployment.is_webhook && (
            <span className="text-[10px] text-gray-500 bg-gray-800 border border-gray-700 rounded px-1.5 py-0.5 font-medium">
              Webhook
            </span>
          )}
          {deployment.force_rebuild && (
            <span className="text-[10px] text-amber-500 bg-amber-900/20 border border-amber-800/30 rounded px-1.5 py-0.5 font-medium">
              Force
            </span>
          )}
        </div>
      </button>

      {/* Deployment Logs */}
      {expanded && (
        <div className="border-t border-gray-800">
          {/* Deployment meta bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-gray-900/30 border-b border-gray-800/50">
            <div className="flex items-center gap-3 text-[11px] text-gray-500">
              <span className="flex items-center gap-1">
                <Server className="h-3 w-3" />
                {deployment.server_name || "—"}
              </span>
              <span>
                UUID: {deployment.deployment_uuid?.substring(0, 12)}
              </span>
            </div>

            {hiddenCount > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHidden(!showHidden);
                }}
                className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showHidden ? (
                  <EyeOff className="h-3 w-3" />
                ) : (
                  <Eye className="h-3 w-3" />
                )}
                {showHidden
                  ? "Hide debug logs"
                  : `Show debug logs (${hiddenCount})`}
              </button>
            )}
          </div>

          {/* Log content */}
          <div className="bg-gray-950 p-3 max-h-[500px] overflow-auto">
            {loadingLogs && (
              <div className="flex items-center justify-center py-6 gap-2">
                <Spinner className="h-4 w-4" />
                <span className="text-sm text-gray-400">
                  Loading deployment logs...
                </span>
              </div>
            )}

            {!loadingLogs && visibleLogs.length === 0 && (
              <p className="text-gray-500 text-xs text-center py-4">
                No logs available for this deployment
              </p>
            )}

            {!loadingLogs &&
              visibleLogs.map((entry, i) => (
                <div
                  key={i}
                  className={`py-0.5 font-mono text-xs leading-relaxed whitespace-pre-wrap break-all hover:bg-gray-900/50 flex gap-2 ${
                    entry.hidden ? "opacity-60" : ""
                  }`}
                >
                  {/* Line number */}
                  <span className="text-gray-700 select-none w-8 text-right flex-shrink-0">
                    {i + 1}
                  </span>

                  {/* Timestamp */}
                  {entry.timestamp && (
                    <span className="text-gray-600 select-none flex-shrink-0 w-20 truncate" title={entry.timestamp}>
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  )}

                  {/* Output */}
                  <span className={`flex-1 ${getLogLineColor(entry)}`}>
                    {entry.output}
                  </span>
                </div>
              ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Main Dialog ----

export function DeploymentLogsDialog({
  open,
  onClose,
  appUuid,
  appName,
}: DeploymentLogsDialogProps) {
  const {
    data: deployments,
    isLoading,
    error,
    refetch,
  } = useAppDeployments(open ? appUuid : "");

  // Count by status
  const statusCounts = deployments?.reduce(
    (acc, d) => {
      const s = (d.status || "").toLowerCase();
      if (s.includes("finished") || s.includes("success")) acc.success++;
      else if (s.includes("failed") || s.includes("error")) acc.failed++;
      else if (s.includes("cancelled")) acc.cancelled++;
      else acc.other++;
      return acc;
    },
    { success: 0, failed: 0, cancelled: 0, other: 0 }
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="max-w-5xl max-h-[90vh] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/20 border border-blue-600/30">
            <Rocket className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Deployment History
            </h2>
            <p className="text-xs text-gray-500">
              {appName} &bull; {deployments?.length || 0} deployment
              {(deployments?.length || 0) !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="btn-icon btn-secondary"
            title="Refresh deployments"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button onClick={onClose} className="btn-icon btn-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Status summary bar */}
      {statusCounts && deployments && deployments.length > 0 && (
        <div className="flex items-center gap-4 mb-4 px-1">
          <span className="flex items-center gap-1.5 text-xs text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {statusCounts.success} success
          </span>
          <span className="flex items-center gap-1.5 text-xs text-red-400">
            <XCircle className="h-3.5 w-3.5" />
            {statusCounts.failed} failed
          </span>
          <span className="flex items-center gap-1.5 text-xs text-orange-400">
            <Ban className="h-3.5 w-3.5" />
            {statusCounts.cancelled} cancelled
          </span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto space-y-2 min-h-[200px]">
        {isLoading && (
          <div className="flex items-center justify-center py-12 gap-2">
            <Spinner />
            <span className="text-gray-400">Loading deployments...</span>
          </div>
        )}

        {error && (
          <ErrorAlert
            message={(error as Error).message}
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !error && deployments?.length === 0 && (
          <div className="text-center py-12">
            <Rocket className="h-10 w-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No deployments yet</p>
            <p className="text-gray-600 text-xs mt-1">
              Deploy your application to see deployment logs here
            </p>
          </div>
        )}

        {!isLoading &&
          !error &&
          deployments?.map((dep, idx) => (
            <DeploymentRow
              key={dep.deployment_uuid || dep.id}
              deployment={dep}
              defaultExpanded={idx === 0}
            />
          ))}
      </div>
    </Dialog>
  );
}
