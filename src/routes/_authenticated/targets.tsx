import { createFileRoute } from "@tanstack/react-router";
import { PageScaffold } from "@/components/PageScaffold";

export const Route = createFileRoute("/_authenticated/targets")({
  head: () => ({
    meta: [
      { title: "Targets & Performance — Lucky MeeSeva" },
      { name: "description", content: "Targets & Performance for the Lucky MeeSeva office management system." },
      { property: "og:title", content: "Targets & Performance — Lucky MeeSeva" },
      { property: "og:description", content: "Targets & Performance for the Lucky MeeSeva office management system." },
    ],
  }),
  component: () => <PageScaffold navKey="targets" />,
});
