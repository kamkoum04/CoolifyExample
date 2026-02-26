// Coolify API Types

export interface Project {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  environments?: Environment[];
  created_at?: string;
  updated_at?: string;
}

export interface Environment {
  id: number;
  uuid: string;
  name: string;
  project_id: number;
  created_at?: string;
  updated_at?: string;
  applications?: Application[];
  postgresqls?: any[];
  redis?: any[];
  mongodbs?: any[];
  mysqls?: any[];
  mariadbs?: any[];
  services?: any[];
}

export interface Application {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  fqdn: string | null;
  status: string;
  git_repository: string | null;
  git_branch: string | null;
  build_pack: string | null;
  ports_exposes: string | null;
  created_at: string;
  updated_at: string;
  environment_id?: number;
  destination_id?: number;
  // Additional fields from Coolify
  domains?: string;
  base_directory?: string | null;
  publish_directory?: string | null;
  install_command?: string | null;
  build_command?: string | null;
  start_command?: string | null;
  is_static?: boolean;
  dockerfile_location?: string | null;
  docker_compose_location?: string | null;
}

export interface Service {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  status: string;
  server_id: number;
  environment_id: number;
  docker_compose_raw: string | null;
  created_at: string;
  updated_at: string;
  domains?: string;
}

export interface DeploymentLogEntry {
  command: string | null;
  output: string;
  type: "stdout" | "stderr";
  timestamp: string;
  hidden: boolean;
  batch?: number;
  order?: number;
}

export interface Deployment {
  id: number;
  application_id: string;
  deployment_uuid: string;
  pull_request_id: number;
  force_rebuild: boolean;
  commit: string;
  status: string;
  is_webhook: boolean;
  is_api: boolean;
  created_at: string;
  updated_at: string;
  finished_at: string | null;
  logs: string; // JSON string of DeploymentLogEntry[]
  application_name: string;
  server_name: string;
  deployment_url: string;
  current_process_id: string | null;
  restart_only: boolean;
  commit_message: string | null;
  only_this_server: boolean;
  rollback: boolean;
  destination_id: string;
  git_type: string | null;
  server_id: number;
}

export interface DeploymentsResponse {
  count: number;
  deployments: Deployment[];
}

export interface Server {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  ip: string;
  user: string;
  port: number;
  proxy_type: string;
  settings?: any;
}

export interface CreateAppPayload {
  project_uuid: string;
  server_uuid: string;
  environment_name: string;
  git_repository: string;
  git_branch: string;
  build_pack: "nixpacks" | "static" | "dockerfile" | "dockercompose";
  ports_exposes: string;
  name?: string;
  description?: string;
  domains?: string;
  instant_deploy?: boolean;
  is_static?: boolean;
  // Monorepo / subfolder fields
  base_directory?: string;
  publish_directory?: string;
  dockerfile_location?: string;
  docker_compose_location?: string;
  docker_compose_domains?: { name: string; domain: string }[];
  // Commands
  install_command?: string;
  build_command?: string;
  start_command?: string;
}

export interface DeployTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  build_pack: "nixpacks" | "static" | "dockerfile" | "dockercompose";
  base_directory: string;
  ports_exposes: string;
  git_branch: string;
  dockerfile_location?: string;
  docker_compose_location?: string;
  is_static?: boolean;
}

export interface AppLogs {
  logs: string;
}

export interface HealthResponse {
  status: string;
  coolifyVersion: string;
}
