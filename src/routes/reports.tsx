import { createFileRoute } from "@tanstack/react-router";
import { PageScaffold } from "@/components/PageScaffold";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports & Exports — Lucky MeeSeva" },
      { name: "description", content: "Reports & Exports for the Lucky MeeSeva office management system." },
      { property: "og:title", content: "Reports & Exports — Lucky MeeSeva" },
      { property: "og:description", content: "Reports & Exports for the Lucky MeeSeva office management system." },
    ],
  }),
  component: () => <PageScaffold navKey="reports" />,
});
