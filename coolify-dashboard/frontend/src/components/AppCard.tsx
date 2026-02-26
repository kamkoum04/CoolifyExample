import { useState } from "react";
import {
  ExternalLink,
  Play,
  Square,
  RotateCw,
  Trash2,
  ScrollText,
  GitBranch,
  Clock,
  MoreVertical,
  Rocket,
  FileText,
} from "lucide-react";
import type { Application } from "@/types/coolify";
import { getStatusColor, getStatusLabel, formatDate } from "@/lib/utils";
import {
  useStartApplication,
  useStopApplication,
  useRestartApplication,
  useDeleteApplication,
  useDeploy,
} from "@/hooks/use-coolify";
import { Tooltip } from "@/components/ui/shared";

interface AppCardProps {
  app: Application;
  onViewLogs: (uuid: string) => void;
  onViewDeployments: (uuid: string) => void;
}

export function AppCard({ app, onViewLogs, onViewDeployments }: AppCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const startApp = useStartApplication();
  const stopApp = useStopApplication();
  const restartApp = useRestartApplication();
  const deleteApp = useDeleteApplication();
  const deploy = useDeploy();

  const isRunning = app.status?.toLowerCase().includes("running");
  const isBusy =
    startApp.isPending ||
    stopApp.isPending ||
    restartApp.isPending ||
    deleteApp.isPending ||
    deploy.isPending;

  const handleDelete = () => {
    if (confirmDelete) {
      deleteApp.mutate(app.uuid);
      setConfirmDelete(false);
      setShowActions(false);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const domain =
    app.fqdn || app.domains;
  const domainUrl = domain
    ? domain.split(",")[0].trim()
    : null;

  return (
    <div className="card p-5 hover:border-gray-700 transition-colors group relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-coolify-600/20 border border-coolify-600/30">
            <Rocket className="h-5 w-5 text-coolify-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">
              {app.name || "Unnamed App"}
            </h3>
            {app.description && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                {app.description}
              </p>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <span className={getStatusColor(app.status)}>
          {getStatusLabel(app.status)}
        </span>
      </div>

      {/* Info */}
      <div className="space-y-2 mb-4">
        {domainUrl && (
          <a
            href={domainUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-coolify-400 hover:text-coolify-300 truncate"
          >
            <ExternalLink className="h-3 w-3 flex-shrink-0" />
            {domainUrl.replace(/^https?:\/\//, "")}
          </a>
        )}

        {app.git_repository && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <GitBranch className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">
              {app.git_repository}
              {app.git_branch && ` (${app.git_branch})`}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Clock className="h-3 w-3 flex-shrink-0" />
          Updated {formatDate(app.updated_at)}
        </div>

        {app.build_pack && (
          <div className="text-xs text-gray-600">
            Build: {app.build_pack}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-2 border-t border-gray-800 pt-3">
        {/* Primary actions row */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewLogs(app.uuid)}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-xs font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            disabled={isBusy}
          >
            <ScrollText className="h-3.5 w-3.5" />
            Runtime Logs
          </button>

          <button
            onClick={() => onViewDeployments(app.uuid)}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-blue-600/20 border border-blue-600/30 px-3 py-2 text-xs font-medium text-blue-400 hover:bg-blue-600/30 hover:text-blue-300 transition-colors"
            disabled={isBusy}
          >
            <FileText className="h-3.5 w-3.5" />
            Deploy Logs
          </button>
        </div>

        {/* Control actions row */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => deploy.mutate({ uuid: app.uuid })}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-coolify-600/20 border border-coolify-600/30 px-3 py-2 text-xs font-medium text-coolify-400 hover:bg-coolify-600/30 hover:text-coolify-300 transition-colors"
            disabled={isBusy}
          >
            <Rocket className="h-3.5 w-3.5" />
            Deploy
          </button>

          {isRunning ? (
            <>
              <button
                onClick={() => restartApp.mutate(app.uuid)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-amber-600/20 border border-amber-600/30 px-3 py-2 text-xs font-medium text-amber-400 hover:bg-amber-600/30 hover:text-amber-300 transition-colors"
                disabled={isBusy}
              >
                <RotateCw className="h-3.5 w-3.5" />
                Restart
              </button>
              <button
                onClick={() => stopApp.mutate(app.uuid)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-red-600/20 border border-red-600/30 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-600/30 hover:text-red-300 transition-colors"
                disabled={isBusy}
              >
                <Square className="h-3.5 w-3.5" />
                Stop
              </button>
            </>
          ) : (
            <button
              onClick={() => startApp.mutate(app.uuid)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600/20 border border-emerald-600/30 px-3 py-2 text-xs font-medium text-emerald-400 hover:bg-emerald-600/30 hover:text-emerald-300 transition-colors"
              disabled={isBusy}
            >
              <Play className="h-3.5 w-3.5" />
              Start
            </button>
          )}
        </div>

        {/* Danger zone */}
        <div className="relative flex justify-end">
          <button
            onClick={() => setShowActions(!showActions)}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <MoreVertical className="h-3.5 w-3.5" />
            More
          </button>
          {showActions && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => {
                  setShowActions(false);
                  setConfirmDelete(false);
                }}
              />
              <div className="absolute right-0 bottom-full mb-1 z-20 w-48 rounded-lg border border-gray-700 bg-gray-800 py-1 shadow-xl">
                <button
                  onClick={handleDelete}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-gray-700"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {confirmDelete ? "Click again to confirm" : "Delete Application"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
