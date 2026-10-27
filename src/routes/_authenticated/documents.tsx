import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageScaffold";
import { DocumentPanel } from "@/components/DocumentPanel";

export const Route = createFileRoute("/_authenticated/documents")({
  head: () => ({
    meta: [
      { title: "Document Center — Lucky MeeSeva" },
      { name: "description", content: "Private, access-logged customer documents for the Lucky MeeSeva office." },
      { property: "og:title", content: "Document Center — Lucky MeeSeva" },
      { property: "og:description", content: "Private, access-logged customer documents." },
    ],
  }),
  component: DocumentsPage,
});

function DocumentsPage() {
  const { data: customers = [] } = useQuery({
    queryKey: ["customers-lite"],
    queryFn: async () => (await supabase.from("customers").select("id, full_name, code").is("archived_at", null).order("full_name")).data ?? [],
  });
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Document Center" description="Private storage — every view and upload is recorded." />
      <DocumentPanel customers={customers} />
    </div>
  );
}
