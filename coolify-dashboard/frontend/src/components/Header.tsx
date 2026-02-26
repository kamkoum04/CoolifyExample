import {
  Rocket,
  Activity,
  RefreshCw,
  User,
} from "lucide-react";
import { useHealth } from "@/hooks/use-coolify";

interface HeaderProps {
  currentUser: string;
  onRefresh: () => void;
  onNewApp: () => void;
}

export function Header({ currentUser, onRefresh, onNewApp }: HeaderProps) {
  const { data: health } = useHealth();

  return (
    <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-coolify-600">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">
                Coolify Dashboard
              </h1>
              <div className="flex items-center gap-2">
                {health?.status === "ok" ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-400">
                    <Activity className="h-3 w-3" />
                    Connected {health.coolifyVersion && `(${health.coolifyVersion})`}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-red-400">
                    <Activity className="h-3 w-3" />
                    Disconnected
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm">
              <User className="h-4 w-4 text-coolify-400" />
              <span className="text-gray-300">{currentUser}</span>
            </div>

            <button onClick={onNewApp} className="inline-flex items-center gap-2 rounded-lg bg-coolify-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-coolify-600/25 hover:bg-coolify-500 hover:shadow-coolify-600/40 transition-all">
              + New Application
            </button>

            <button
              onClick={onRefresh}
              className="btn-icon btn-secondary"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
