import { createFileRoute } from "@tanstack/react-router";
import { PageScaffold } from "@/components/PageScaffold";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Business Settings — Lucky MeeSeva" },
      { name: "description", content: "Business Settings for the Lucky MeeSeva office management system." },
      { property: "og:title", content: "Business Settings — Lucky MeeSeva" },
      { property: "og:description", content: "Business Settings for the Lucky MeeSeva office management system." },
    ],
  }),
  component: () => <PageScaffold navKey="settings" />,
});
