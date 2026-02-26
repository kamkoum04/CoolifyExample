import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/services/api";
import type { CreateAppPayload } from "@/types/coolify";

// Health
export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: api.getHealth,
    retry: 2,
    refetchInterval: 30000,
  });
}

// Servers
export function useServers() {
  return useQuery({
    queryKey: ["servers"],
    queryFn: api.getServers,
  });
}

// Projects
export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: api.getProjects,
  });
}

export function useProject(uuid: string) {
  return useQuery({
    queryKey: ["project", uuid],
    queryFn: () => api.getProject(uuid),
    enabled: !!uuid,
  });
}

export function useFindOrCreateProject(name: string) {
  return useQuery({
    queryKey: ["project-by-name", name.toLowerCase().trim()],
    queryFn: () => api.findOrCreateProject(name),
    enabled: !!name,
    staleTime: 60000,
  });
}

// Project Applications
export function useProjectApplications(projectUuid: string | undefined) {
  return useQuery({
    queryKey: ["project-applications", projectUuid],
    queryFn: () => api.getProjectApplications(projectUuid!),
    enabled: !!projectUuid,
    refetchInterval: 10000,
  });
}

// All applications
export function useApplications() {
  return useQuery({
    queryKey: ["applications"],
    queryFn: api.getApplications,
    refetchInterval: 10000,
  });
}

// Single application
export function useApplication(uuid: string) {
  return useQuery({
    queryKey: ["application", uuid],
    queryFn: () => api.getApplication(uuid),
    enabled: !!uuid,
    refetchInterval: 5000,
  });
}

// Create application
export function useCreateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAppPayload) => api.createPublicApp(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications"] });
      qc.invalidateQueries({ queryKey: ["project-applications"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

// Delete application
export function useDeleteApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => api.deleteApplication(uuid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications"] });
      qc.invalidateQueries({ queryKey: ["project-applications"] });
    },
  });
}

// Start application
export function useStartApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => api.startApplication(uuid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications"] });
      qc.invalidateQueries({ queryKey: ["project-applications"] });
    },
  });
}

// Stop application
export function useStopApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => api.stopApplication(uuid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications"] });
      qc.invalidateQueries({ queryKey: ["project-applications"] });
    },
  });
}

// Restart application
export function useRestartApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => api.restartApplication(uuid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications"] });
      qc.invalidateQueries({ queryKey: ["project-applications"] });
    },
  });
}

// Deploy
export function useDeploy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, force = false }: { uuid: string; force?: boolean }) =>
      api.deployByUuid(uuid, force),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications"] });
      qc.invalidateQueries({ queryKey: ["deployments"] });
    },
  });
}

// Application Logs
export function useApplicationLogs(uuid: string, lines = 100) {
  return useQuery({
    queryKey: ["application-logs", uuid, lines],
    queryFn: () => api.getApplicationLogs(uuid, lines),
    enabled: !!uuid,
    refetchInterval: 5000,
  });
}

// Deployments
export function useDeployments() {
  return useQuery({
    queryKey: ["deployments"],
    queryFn: api.getDeployments,
    refetchInterval: 5000,
  });
}

export function useAppDeployments(appUuid: string) {
  return useQuery({
    queryKey: ["app-deployments", appUuid],
    queryFn: () => api.getAppDeployments(appUuid),
    enabled: !!appUuid,
    refetchInterval: 5000,
  });
}
