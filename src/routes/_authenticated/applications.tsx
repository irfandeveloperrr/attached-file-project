import { createFileRoute } from "@tanstack/react-router";
import { PageScaffold } from "@/components/PageScaffold";

export const Route = createFileRoute("/_authenticated/applications")({
  head: () => ({
    meta: [
      { title: "Applications — Lucky MeeSeva" },
      { name: "description", content: "Applications for the Lucky MeeSeva office management system." },
      { property: "og:title", content: "Applications — Lucky MeeSeva" },
      { property: "og:description", content: "Applications for the Lucky MeeSeva office management system." },
    ],
  }),
  component: () => <PageScaffold navKey="applications" />,
});
