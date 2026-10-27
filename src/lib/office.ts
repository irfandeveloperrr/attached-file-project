import { useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type AppStatus = Database["public"]["Enums"]["application_status"];

export const STATUSES: { value: AppStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "documents_required", label: "Documents Required" },
  { value: "ready_for_submission", label: "Ready for Submission" },
  { value: "in_progress", label: "In Progress" },
  { value: "submitted", label: "Submitted" },
  { value: "awaiting_external", label: "Awaiting External Response" },
  { value: "completed", label: "Completed (office work)" },
  { value: "rejected", label: "Rejected" },
  { value: "returned", label: "Returned for Correction" },
  { value: "cancelled", label: "Cancelled" },
];
export const statusLabel = (s: string) => STATUSES.find((x) => x.value === s)?.label ?? s;

export const DOC_CATEGORIES = ["Identity proof", "Address proof", "Income certificate", "Caste certificate", "Photo", "Application form", "Other"];
export const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
export const MAX_BYTES = 10 * 1024 * 1024;

const authRoute = getRouteApi("/_authenticated");
export const useMe = () => authRoute.useRouteContext().me;
export const isLead = (role: string) => role === "admin" || role === "manager";

/** Team members visible to the current user (leads see everyone, staff see themselves). */
export function useTeam() {
  return useQuery({
    queryKey: ["team"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id, full_name").order("full_name");
      if (error) throw error;
      return data;
    },
  });
}

export const field = "mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";
export const btn = "inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60";
export const btnGhost = "inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium hover:bg-muted";

export function downloadCsv(name: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv" }));
  a.download = name;
  a.click();
}

export const normPhone = (p: string) => p.replace(/\D/g, "").slice(-10);
