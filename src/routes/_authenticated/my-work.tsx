import { createFileRoute } from "@tanstack/react-router";
import { PageScaffold } from "@/components/PageScaffold";

export const Route = createFileRoute("/_authenticated/my-work")({
  head: () => ({
    meta: [
      { title: "Staff Dashboard — Lucky MeeSeva" },
      { name: "description", content: "Staff Dashboard for the Lucky MeeSeva office management system." },
      { property: "og:title", content: "Staff Dashboard — Lucky MeeSeva" },
      { property: "og:description", content: "Staff Dashboard for the Lucky MeeSeva office management system." },
    ],
  }),
  component: () => <PageScaffold navKey="staff-dashboard" />,
});
