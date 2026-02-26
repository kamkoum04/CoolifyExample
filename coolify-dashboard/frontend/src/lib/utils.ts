import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return "Never";
  return new Date(date).toLocaleString();
}

export function getStatusColor(status: string | undefined): string {
  if (!status) return "badge-stopped";
  const s = status.toLowerCase();
  if (s.includes("running") || s === "online") return "badge-running";
  if (s.includes("deploy") || s.includes("building") || s.includes("queued"))
    return "badge-deploying";
  if (s.includes("error") || s.includes("failed") || s.includes("exited"))
    return "badge-failed";
  return "badge-stopped";
}

export function getStatusLabel(status: string | undefined): string {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
}
