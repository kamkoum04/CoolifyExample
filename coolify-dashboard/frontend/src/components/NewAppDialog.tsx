import { useState } from "react";
import { X, Zap, FileCode, Layers, Globe, Database, Rocket } from "lucide-react";
import { Dialog, Input, Select, Spinner, ErrorAlert } from "@/components/ui/shared";
import { useServers, useCreateApplication, useFindOrCreateProject } from "@/hooks/use-coolify";
import type { DeployTemplate } from "@/types/coolify";

// ---------- Pre-configured deployment templates ----------

const REPO_URL = "https://github.com/kamkoum04/CoolifyExample";

const DEPLOY_TEMPLATES: DeployTemplate[] = [
  {
    id: "stage1",
    name: "Stage 1 – Static Frontend",
    description: "React + Vite task board (Dockerfile → Nginx)",
    icon: "globe",
    build_pack: "dockerfile",
    base_directory: "/stage1-frontend-only",
    ports_exposes: "80",
    git_branch: "main",
    dockerfile_location: "/Dockerfile",
    is_static: false,
  },
  {
    id: "stage2",
    name: "Stage 2 – Frontend + Backend",
    description: "Docker Compose: Nginx frontend + Express API",
    icon: "layers",
    build_pack: "dockercompose",
    base_directory: "/stage2-frontend-backend",
    ports_exposes: "80",
    git_branch: "main",
    docker_compose_location: "/docker-compose.yaml",
  },
  {
    id: "stage3",
    name: "Stage 3 – Fullstack + Database",
    description: "Docker Compose: Frontend + Express/Prisma + PostgreSQL",
    icon: "database",
    build_pack: "dockercompose",
    base_directory: "/stage3-fullstack-database",
    ports_exposes: "80",
    git_branch: "main",
    docker_compose_location: "/docker-compose.yaml",
  },
  {
    id: "wordpress",
    name: "WordPress Advanced",
    description: "Docker Compose: WP + MariaDB + Redis + phpMyAdmin",
    icon: "filecode",
    build_pack: "dockercompose",
    base_directory: "/wordpress-advanced",
    ports_exposes: "80",
    git_branch: "main",
    docker_compose_location: "/docker-compose.yaml",
  },
];

function TemplateIcon({ icon }: { icon: string }) {
  const cls = "h-5 w-5";
  switch (icon) {
    case "globe":
      return <Globe className={cls} />;
    case "layers":
      return <Layers className={cls} />;
    case "database":
      return <Database className={cls} />;
    case "filecode":
      return <FileCode className={cls} />;
    default:
      return <Zap className={cls} />;
  }
}

// ---------- Component ----------

interface NewAppDialogProps {
  open: boolean;
  onClose: () => void;
  currentUser: string;
}

type Mode = "template" | "custom";

const defaultForm = {
  name: "",
  domain: "",
  git_repository: "",
  git_branch: "main",
  build_pack: "nixpacks" as "nixpacks" | "static" | "dockerfile" | "dockercompose",
  ports_exposes: "3000",
  is_static: false,
  instant_deploy: true,
  base_directory: "",
  dockerfile_location: "",
  docker_compose_location: "",
};

export function NewAppDialog({ open, onClose, currentUser }: NewAppDialogProps) {
  const [mode, setMode] = useState<Mode>("template");
  const [form, setForm] = useState({ ...defaultForm });
  const [domainAutoSet, setDomainAutoSet] = useState(true);
  const [selectedServer, setSelectedServer] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const { data: servers, isLoading: serversLoading } = useServers();
  const {
    data: project,
    isLoading: projectLoading,
    error: projectError,
  } = useFindOrCreateProject(currentUser);

  const createApp = useCreateApplication();

  // Auto-set domain when name changes
  const handleNameChange = (name: string) => {
    const sanitizedName = name.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    const newForm = { ...form, name };
    if (domainAutoSet) {
      newForm.domain = sanitizedName ? `https://${sanitizedName}.coolify.software` : "";
    }
    setForm(newForm);
  };

  const handleDomainChange = (domain: string) => {
    setDomainAutoSet(false);
    setForm({ ...form, domain });
  };

  // Apply a template to the form
  const applyTemplate = (t: DeployTemplate) => {
    setSelectedTemplate(t.id);
    const sanitizedName = t.id.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    setForm({
      ...defaultForm,
      name: t.id,
      domain: `https://${sanitizedName}.coolify.software`,
      git_repository: REPO_URL,
      git_branch: t.git_branch,
      build_pack: t.build_pack,
      ports_exposes: t.ports_exposes,
      is_static: t.is_static ?? false,
      instant_deploy: true,
      base_directory: t.base_directory,
      dockerfile_location: t.dockerfile_location ?? "",
      docker_compose_location: t.docker_compose_location ?? "",
    });
    setDomainAutoSet(true);
    setMode("custom"); // Switch to form view with fields pre-filled
  };

  const resetForm = () => {
    setForm({ ...defaultForm });
    setSelectedTemplate(null);
    setDomainAutoSet(true);
    setMode("template");
    createApp.reset();
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !selectedServer) return;

    const payload: Record<string, unknown> = {
      project_uuid: project.uuid,
      server_uuid: selectedServer,
      environment_name: "production",
      git_repository: form.git_repository,
      git_branch: form.git_branch,
      build_pack: form.build_pack,
      ports_exposes: form.ports_exposes,
      name: form.name || undefined,
      instant_deploy: form.instant_deploy,
      is_static: form.is_static || undefined,
    };

    // Add domain if set
    if (form.domain) payload.domains = form.domain;

    // Add optional fields only if they have values
    if (form.base_directory) payload.base_directory = form.base_directory;
    if (form.dockerfile_location) payload.dockerfile_location = form.dockerfile_location;
    if (form.docker_compose_location) payload.docker_compose_location = form.docker_compose_location;

    createApp.mutate(payload as any, {
      onSuccess: () => {
        handleClose();
      },
    });
  };

  const isReady = !serversLoading && !projectLoading && project && servers;
  const isCompose = form.build_pack === "dockercompose";
  const isDockerfile = form.build_pack === "dockerfile";

  return (
    <Dialog open={open} onClose={handleClose} className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">New Application</h2>
          <p className="text-sm text-gray-400">
            {mode === "template"
              ? "Choose a template or create a custom deployment"
              : selectedTemplate
              ? `Deploying from template: ${selectedTemplate}`
              : "Deploy from a public Git repository"}
          </p>
        </div>
        <button onClick={handleClose} className="btn-icon btn-secondary">
          <X className="h-4 w-4" />
        </button>
      </div>

      {projectError && (
        <ErrorAlert
          message={`Failed to find/create project: ${(projectError as Error).message}`}
        />
      )}

      {(serversLoading || projectLoading) && (
        <div className="flex items-center justify-center py-8 gap-2">
          <Spinner />
          <span className="text-sm text-gray-400">
            {projectLoading
              ? `Setting up project for "${currentUser}"...`
              : "Loading servers..."}
          </span>
        </div>
      )}

      {isReady && mode === "template" && (
        <div className="space-y-4">
          {/* Quick Deploy Templates */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              Quick Deploy from Monorepo
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DEPLOY_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => applyTemplate(t)}
                  className="flex items-start gap-3 rounded-lg border border-gray-700 bg-gray-800/50 p-3 text-left hover:border-coolify-500/50 hover:bg-gray-800 transition-colors"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-coolify-600/20 border border-coolify-600/30 text-coolify-400">
                    <TemplateIcon icon={t.icon} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">{t.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {t.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="inline-flex items-center rounded-full bg-gray-700 px-2 py-0.5 text-[10px] font-medium text-gray-300">
                        {t.build_pack}
                      </span>
                      <span className="text-[10px] text-gray-600">
                        {t.base_directory}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-gray-900 px-3 text-gray-500">or</span>
            </div>
          </div>

          {/* Custom deployment button */}
          <button
            onClick={() => setMode("custom")}
            className="w-full rounded-lg border border-dashed border-gray-600 bg-gray-800/30 py-4 text-sm text-gray-400 hover:border-coolify-500/50 hover:text-gray-300 transition-colors"
          >
            + Custom Deployment (manual configuration)
          </button>
        </div>
      )}

      {isReady && mode === "custom" && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Back button */}
          <button
            type="button"
            onClick={resetForm}
            className="text-xs text-gray-500 hover:text-gray-300 mb-2"
          >
            ← Back to templates
          </button>

          {/* Project info */}
          <div className="rounded-lg bg-gray-800/50 border border-gray-700/50 p-3">
            <p className="text-xs text-gray-400">
              Project:{" "}
              <span className="text-coolify-400 font-medium">
                {project.name}
              </span>
              <span className="text-gray-600 ml-2">
                (UUID: {project.uuid})
              </span>
            </p>
          </div>

          <Input
            label="Application Name"
            placeholder="my-awesome-app"
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
          />

          {/* Auto-generated domain field */}
          <div>
            <label className="label flex items-center justify-between">
              <span>Domain</span>
              {!domainAutoSet && (
                <button
                  type="button"
                  onClick={() => {
                    setDomainAutoSet(true);
                    const sanitizedName = form.name.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
                    setForm({ ...form, domain: sanitizedName ? `https://${sanitizedName}.coolify.software` : "" });
                  }}
                  className="text-[10px] text-coolify-400 hover:text-coolify-300 font-normal"
                >
                  Reset to auto
                </button>
              )}
            </label>
            <div className="relative">
              <input
                className="input pr-16"
                placeholder="https://app1.coolify.software"
                value={form.domain}
                onChange={(e) => handleDomainChange(e.target.value)}
              />
              {domainAutoSet && form.domain && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-coolify-400 bg-coolify-600/20 border border-coolify-600/30 rounded px-1.5 py-0.5">
                  auto
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-500 mt-1">
              Auto-generated from app name. You can modify it manually.
            </p>
          </div>

          <Select
            label="Server"
            value={selectedServer}
            onChange={(e) => setSelectedServer(e.target.value)}
            required
          >
            <option value="">Select a server...</option>
            {servers?.map((s) => (
              <option key={s.uuid} value={s.uuid}>
                {s.name} ({s.ip})
              </option>
            ))}
          </Select>

          <Input
            label="Git Repository URL"
            placeholder="https://github.com/user/repo"
            value={form.git_repository}
            onChange={(e) =>
              setForm({ ...form, git_repository: e.target.value })
            }
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Branch"
              placeholder="main"
              value={form.git_branch}
              onChange={(e) =>
                setForm({ ...form, git_branch: e.target.value })
              }
            />

            <Select
              label="Build Pack"
              value={form.build_pack}
              onChange={(e) =>
                setForm({
                  ...form,
                  build_pack: e.target.value as any,
                })
              }
            >
              <option value="nixpacks">Nixpacks</option>
              <option value="dockerfile">Dockerfile</option>
              <option value="static">Static</option>
              <option value="dockercompose">Docker Compose</option>
            </Select>
          </div>

          {/* Monorepo / subfolder fields */}
          <Input
            label="Base Directory"
            placeholder="/ (root) or /stage1-frontend-only"
            value={form.base_directory}
            onChange={(e) =>
              setForm({ ...form, base_directory: e.target.value })
            }
          />

          {isDockerfile && (
            <Input
              label="Dockerfile Location"
              placeholder="/Dockerfile"
              value={form.dockerfile_location}
              onChange={(e) =>
                setForm({ ...form, dockerfile_location: e.target.value })
              }
            />
          )}

          {isCompose && (
            <Input
              label="Docker Compose Location"
              placeholder="/docker-compose.yaml"
              value={form.docker_compose_location}
              onChange={(e) =>
                setForm({ ...form, docker_compose_location: e.target.value })
              }
            />
          )}

          <Input
            label="Exposed Ports"
            placeholder="3000"
            value={form.ports_exposes}
            onChange={(e) =>
              setForm({ ...form, ports_exposes: e.target.value })
            }
          />

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={form.instant_deploy}
                onChange={(e) =>
                  setForm({ ...form, instant_deploy: e.target.checked })
                }
                className="rounded border-gray-600 bg-gray-700 text-coolify-600 focus:ring-coolify-500"
              />
              Deploy immediately
            </label>

            {!isCompose && (
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_static}
                  onChange={(e) =>
                    setForm({ ...form, is_static: e.target.checked })
                  }
                  className="rounded border-gray-600 bg-gray-700 text-coolify-600 focus:ring-coolify-500"
                />
                Static site
              </label>
            )}
          </div>

          {/* Template summary */}
          {selectedTemplate && (
            <div className="rounded-lg bg-coolify-600/10 border border-coolify-600/20 p-3">
              <p className="text-xs text-coolify-300 font-medium mb-1">
                Template Configuration Applied
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-400">
                <span>Build Pack: <span className="text-gray-300">{form.build_pack}</span></span>
                <span>Base Dir: <span className="text-gray-300">{form.base_directory || "/"}</span></span>
                {form.dockerfile_location && (
                  <span>Dockerfile: <span className="text-gray-300">{form.dockerfile_location}</span></span>
                )}
                {form.docker_compose_location && (
                  <span>Compose: <span className="text-gray-300">{form.docker_compose_location}</span></span>
                )}
              </div>
            </div>
          )}

          {createApp.error && (
            <ErrorAlert message={(createApp.error as Error).message} />
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-gray-600 bg-gray-800 px-5 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-coolify-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-coolify-600/25 hover:bg-coolify-500 hover:shadow-coolify-600/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={createApp.isPending}
            >
              {createApp.isPending ? (
                <>
                  <Spinner className="h-4 w-4" /> Creating...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4" />
                  Create & Deploy
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
