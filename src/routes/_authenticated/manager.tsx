import { createFileRoute } from "@tanstack/react-router";
import { PageScaffold } from "@/components/PageScaffold";

export const Route = createFileRoute("/_authenticated/manager")({
  head: () => ({
    meta: [
      { title: "Manager Dashboard — Lucky MeeSeva" },
      { name: "description", content: "Manager Dashboard for the Lucky MeeSeva office management system." },
      { property: "og:title", content: "Manager Dashboard — Lucky MeeSeva" },
      { property: "og:description", content: "Manager Dashboard for the Lucky MeeSeva office management system." },
    ],
  }),
  component: () => <PageScaffold navKey="manager" />,
});
