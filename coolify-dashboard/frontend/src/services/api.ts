import type {
  Application,
  AppLogs,
  CreateAppPayload,
  Deployment,
  DeploymentsResponse,
  HealthResponse,
  Project,
  Server,
  Service,
  Environment,
} from "@/types/coolify";

const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    let message: string;
    try {
      const json = JSON.parse(body);
      message = json.error || json.message || body;
    } catch {
      message = body;
    }
    throw new Error(message);
  }
  return res.json();
}

// Health
export const getHealth = () => request<HealthResponse>("/health");

// Servers
export const getServers = () => request<Server[]>("/servers");

// Projects
export const getProjects = () => request<Project[]>("/projects");
export const getProject = (uuid: string) =>
  request<Project>(`/projects/${uuid}`);
export const createProject = (name: string, description?: string) =>
  request<{ uuid: string }>("/projects", {
    method: "POST",
    body: JSON.stringify({ name, description }),
  });
export const deleteProject = (uuid: string) =>
  request<{ message: string }>(`/projects/${uuid}`, { method: "DELETE" });

// Project Environments
export const getProjectEnvironments = (projectUuid: string) =>
  request<Environment[]>(`/projects/${projectUuid}/environments`);
export const getEnvironment = (projectUuid: string, envNameOrUuid: string) =>
  request<Environment>(`/projects/${projectUuid}/${envNameOrUuid}`);

// Applications
export const getApplications = () => request<Application[]>("/applications");
export const getApplication = (uuid: string) =>
  request<Application>(`/applications/${uuid}`);
export const createPublicApp = (payload: CreateAppPayload) =>
  request<{ uuid: string }>("/applications/public", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const updateApplication = (
  uuid: string,
  data: Partial<Application>
) =>
  request<{ uuid: string }>(`/applications/${uuid}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
export const deleteApplication = (uuid: string) =>
  request<{ message: string }>(`/applications/${uuid}`, { method: "DELETE" });

// Application Actions
export const startApplication = (uuid: string) =>
  request<{ message: string; deployment_uuid?: string }>(
    `/applications/${uuid}/start`
  );
export const stopApplication = (uuid: string) =>
  request<{ message: string }>(`/applications/${uuid}/stop`);
export const restartApplication = (uuid: string) =>
  request<{ message: string; deployment_uuid?: string }>(
    `/applications/${uuid}/restart`
  );

// Application Logs
export const getApplicationLogs = (uuid: string, lines = 100) =>
  request<AppLogs>(`/applications/${uuid}/logs?lines=${lines}`);

// Deployments
export const getDeployments = () => request<Deployment[]>("/deployments");
export const getDeployment = (uuid: string) =>
  request<Deployment>(`/deployments/${uuid}`);
export const getAppDeployments = async (
  appUuid: string,
  skip = 0,
  take = 50
): Promise<Deployment[]> => {
  const response = await request<DeploymentsResponse | Deployment[]>(
    `/deployments/applications/${appUuid}?skip=${skip}&take=${take}`
  );
  // Coolify API returns { count, deployments: [...] }
  if (response && typeof response === "object" && "deployments" in response) {
    return (response as DeploymentsResponse).deployments;
  }
  // Fallback if it's already a flat array
  return response as Deployment[];
};
export const deployByUuid = (uuid: string, force = false) =>
  request<{ deployments: { message: string; resource_uuid: string; deployment_uuid: string }[] }>(
    `/deploy?uuid=${uuid}&force=${force}`
  );

// Helper: find or create project by name (user-based)
export async function findOrCreateProject(
  name: string
): Promise<Project> {
  const projects = await getProjects();
  const normalizedName = name.toLowerCase().trim();
  const existing = projects.find(
    (p) => p.name.toLowerCase().trim() === normalizedName
  );
  if (existing) return existing;

  const result = await createProject(name, `Project for user ${name}`);
  // Fetch the full project after creation
  return getProject(result.uuid);
}

// Helper: get applications for a specific project
export async function getProjectApplications(
  projectUuid: string
): Promise<Application[]> {
  try {
    const env = await getEnvironment(projectUuid, "production");
    return env.applications || [];
  } catch {
    // If production env doesn't exist, try listing environments and getting the first one
    try {
      const envs = await getProjectEnvironments(projectUuid);
      if (envs.length > 0) {
        const envDetail = await getEnvironment(
          projectUuid,
          envs[0].uuid || envs[0].name
        );
        return envDetail.applications || [];
      }
    } catch {
      // ignore
    }
    return [];
  }
}

// Services (Docker Compose)
export const getServices = () => request<Service[]>("/services");
export const getService = (uuid: string) =>
  request<Service>(`/services/${uuid}`);
export const createService = (payload: {
  type?: string;
  docker_compose_raw?: string;
  project_uuid: string;
  server_uuid: string;
  environment_name?: string;
  name?: string;
  description?: string;
  instant_deploy?: boolean;
}) =>
  request<{ uuid: string }>("/services", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const deleteService = (uuid: string) =>
  request<{ message: string }>(`/services/${uuid}`, { method: "DELETE" });
export const startService = (uuid: string) =>
  request<{ message: string }>(`/services/${uuid}/start`);
export const stopService = (uuid: string) =>
  request<{ message: string }>(`/services/${uuid}/stop`);
export const restartService = (uuid: string) =>
  request<{ message: string }>(`/services/${uuid}/restart`);
