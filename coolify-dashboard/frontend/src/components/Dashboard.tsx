import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Package, FolderOpen, AlertCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { AppCard } from "@/components/AppCard";
import { NewAppDialog } from "@/components/NewAppDialog";
import { LogsDialog } from "@/components/LogsDialog";
import { DeploymentLogsDialog } from "@/components/DeploymentLogsDialog";
import {
  Spinner,
  EmptyState,
  ErrorAlert,
} from "@/components/ui/shared";
import {
  useFindOrCreateProject,
  useProjectApplications,
} from "@/hooks/use-coolify";

// Static user name for now – case-insensitive matching
const CURRENT_USER = "hamza";

export function Dashboard() {
  const queryClient = useQueryClient();
  const [showNewApp, setShowNewApp] = useState(false);
  const [logsTarget, setLogsTarget] = useState<{
    uuid: string;
    name: string;
  } | null>(null);
  const [deployLogsTarget, setDeployLogsTarget] = useState<{
    uuid: string;
    name: string;
  } | null>(null);

  // 1. Find or create the project for the current user
  const {
    data: project,
    isLoading: projectLoading,
    error: projectError,
  } = useFindOrCreateProject(CURRENT_USER);

  // 2. List applications belonging to that project
  const {
    data: apps,
    isLoading: appsLoading,
    error: appsError,
  } = useProjectApplications(project?.uuid);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["project-by-name"] });
    queryClient.invalidateQueries({ queryKey: ["project-applications"] });
    queryClient.invalidateQueries({ queryKey: ["applications"] });
    queryClient.invalidateQueries({ queryKey: ["health"] });
  };

  const isLoading = projectLoading || appsLoading;
  const error = projectError || appsError;

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        currentUser={CURRENT_USER}
        onRefresh={handleRefresh}
        onNewApp={() => setShowNewApp(true)}
      />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Info Banner */}
        {project && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3">
            <FolderOpen className="h-5 w-5 text-coolify-400" />
            <div>
              <p className="text-sm font-medium text-white">
                Project: {project.name}
              </p>
              <p className="text-xs text-gray-500">
                UUID: {project.uuid}
                {project.description && ` • ${project.description}`}
              </p>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-20 gap-3">
            <Spinner className="h-6 w-6" />
            <span className="text-gray-400">
              {projectLoading
                ? `Looking up project for "${CURRENT_USER}"...`
                : "Loading applications..."}
            </span>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="max-w-md mx-auto mt-10">
            <ErrorAlert
              message={(error as Error).message}
              onRetry={handleRefresh}
            />
            <div className="mt-4 rounded-lg border border-amber-800/50 bg-amber-500/10 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-amber-300">
                  <p className="font-medium mb-1">Troubleshooting:</p>
                  <ul className="list-disc list-inside space-y-1 text-amber-400/80">
                    <li>Check that the backend is running on port 3001</li>
                    <li>Verify COOLIFY_API_URL and COOLIFY_API_TOKEN in backend/.env</li>
                    <li>Ensure your Coolify instance API is enabled</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Applications Grid */}
        {!isLoading && !error && apps && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-gray-400">
                {apps.length} application{apps.length !== 1 ? "s" : ""}
              </h2>
            </div>

            {apps.length === 0 ? (
              <EmptyState
                icon={<Package className="h-12 w-12" />}
                title="No applications yet"
                description={`Deploy your first application to the "${CURRENT_USER}" project.`}
                action={
                  <button
                    onClick={() => setShowNewApp(true)}
                    className="btn-primary"
                  >
                    + New Application
                  </button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {apps.map((app) => (
                  <AppCard
                    key={app.uuid}
                    app={app}
                    onViewLogs={(uuid) =>
                      setLogsTarget({ uuid, name: app.name || app.uuid })
                    }
                    onViewDeployments={(uuid) =>
                      setDeployLogsTarget({ uuid, name: app.name || app.uuid })
                    }
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-4">
        <p className="text-center text-xs text-gray-600">
          Coolify Deployment Dashboard • Student Edition
        </p>
      </footer>

      {/* Dialogs */}
      <NewAppDialog
        open={showNewApp}
        onClose={() => setShowNewApp(false)}
        currentUser={CURRENT_USER}
      />

      {logsTarget && (
        <LogsDialog
          open={!!logsTarget}
          onClose={() => setLogsTarget(null)}
          appUuid={logsTarget.uuid}
          appName={logsTarget.name}
        />
      )}

      {deployLogsTarget && (
        <DeploymentLogsDialog
          open={!!deployLogsTarget}
          onClose={() => setDeployLogsTarget(null)}
          appUuid={deployLogsTarget.uuid}
          appName={deployLogsTarget.name}
        />
      )}
    </div>
  );
}
