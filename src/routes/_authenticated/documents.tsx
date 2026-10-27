import { createFileRoute } from "@tanstack/react-router";
import { PageScaffold } from "@/components/PageScaffold";

export const Route = createFileRoute("/_authenticated/documents")({
  head: () => ({
    meta: [
      { title: "Document Center — Lucky MeeSeva" },
      { name: "description", content: "Document Center for the Lucky MeeSeva office management system." },
      { property: "og:title", content: "Document Center — Lucky MeeSeva" },
      { property: "og:description", content: "Document Center for the Lucky MeeSeva office management system." },
    ],
  }),
  component: () => <PageScaffold navKey="documents" />,
});
