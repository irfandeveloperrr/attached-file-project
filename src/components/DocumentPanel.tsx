import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Eye, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ALLOWED_TYPES, DOC_CATEGORIES, MAX_BYTES, btn, field, isLead, useMe } from "@/lib/office";

/** Upload and list documents. Pass customerId to scope; applicationId optionally links the file. */
export function DocumentPanel({ customerId, applicationId, customers }: { customerId?: string; applicationId?: string; customers?: { id: string; full_name: string; code: string }[] }) {
  const me = useMe();
  const qc = useQueryClient();
  const [cust, setCust] = useState(customerId ?? "");
  const [category, setCategory] = useState(DOC_CATEGORIES[0]);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const key = ["documents", customerId ?? "all", applicationId ?? ""];

  const { data: docs = [] } = useQuery({
    queryKey: key,
    queryFn: async () => {
      let q = supabase.from("documents").select("*, customers(full_name, code)").order("created_at", { ascending: false });
      if (customerId) q = q.eq("customer_id", customerId);
      if (applicationId) q = q.eq("application_id", applicationId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !cust) return void toast.error("Choose a customer and a file.");
    if (!ALLOWED_TYPES.includes(file.type)) return void toast.error("Only PDF, JPG and PNG files are allowed.");
    if (file.size > MAX_BYTES) return void toast.error("File must be 10 MB or smaller.");
    setBusy(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
      const path = `${cust}/${crypto.randomUUID()}.${ext}`;
      const prev = docs.find((d) => d.customer_id === cust && d.category === category && (d.application_id ?? "") === (applicationId ?? ""));
      const up = await supabase.storage.from("documents").upload(path, file, { contentType: file.type });
      if (up.error) throw up.error;
      const { data, error } = await supabase.from("documents").insert({
        customer_id: cust, application_id: applicationId ?? null, category, file_path: path, file_name: file.name,
        mime_type: file.type, size_bytes: file.size, version: (prev?.version ?? 0) + 1, replaces_id: prev?.id ?? null,
      }).select("id").single();
      if (error) throw error;
      await supabase.from("document_access_log").insert({ document_id: data.id, action: "upload" });
      toast.success("Document uploaded");
      setFile(null);
      qc.invalidateQueries({ queryKey: ["documents"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function open(id: string, path: string) {
    const { data, error } = await supabase.storage.from("documents").createSignedUrl(path, 60);
    if (error || !data) return void toast.error("You can't open this document.");
    await supabase.from("document_access_log").insert({ document_id: id, action: "view" });
    window.open(data.signedUrl, "_blank", "noopener");
  }

  async function verify(id: string, verification: "verified" | "rejected") {
    const { error } = await supabase.from("documents").update({ verification }).eq("id", id);
    if (error) return void toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["documents"] });
  }

  const replaced = new Set(docs.map((d) => d.replaces_id).filter(Boolean));

  return (
    <div className="rounded-xl border bg-card p-5 shadow-card">
      <h2 className="font-display font-semibold">Documents</h2>
      <form onSubmit={upload} className="mt-3 flex flex-wrap items-end gap-2">
        {!customerId && (
          <label className="text-sm font-medium">Customer
            <select value={cust} onChange={(e) => setCust(e.target.value)} className={`${field} w-56`}>
              <option value="">Choose…</option>
              {(customers ?? []).map((c) => <option key={c.id} value={c.id}>{c.full_name} ({c.code})</option>)}
            </select>
          </label>
        )}
        <label className="text-sm font-medium">Category
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={`${field} w-48`}>
            {DOC_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-sm" />
        <button className={btn} disabled={busy}><Upload className="h-4 w-4" />{busy ? "Uploading…" : "Upload"}</button>
      </form>
      <p className="mt-1 text-xs text-muted-foreground">PDF, JPG or PNG, up to 10 MB. Files are private and open through short-lived links.</p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground">
            <tr><th className="p-2">File</th>{!customerId && <th className="p-2">Customer</th>}<th className="p-2">Category</th><th className="p-2">Version</th><th className="p-2">Uploaded</th><th className="p-2">Status</th><th className="p-2"></th></tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.id} className={`border-t ${replaced.has(d.id) ? "opacity-50" : ""}`}>
                <td className="p-2">{d.file_name}</td>
                {!customerId && <td className="p-2">{d.customers?.full_name}</td>}
                <td className="p-2">{d.category}</td>
                <td className="p-2">v{d.version}{replaced.has(d.id) && " (replaced)"}</td>
                <td className="p-2">{d.created_at.slice(0, 10)}</td>
                <td className="p-2 capitalize">{d.verification}</td>
                <td className="flex gap-2 p-2">
                  <button onClick={() => open(d.id, d.file_path)} className="text-accent hover:underline" aria-label="View"><Eye className="h-4 w-4" /></button>
                  {isLead(me.role) && d.verification === "pending" && (
                    <>
                      <button onClick={() => verify(d.id, "verified")} className="text-xs text-accent hover:underline">Verify</button>
                      <button onClick={() => verify(d.id, "rejected")} className="text-xs text-destructive hover:underline">Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {!docs.length && <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">No documents yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
