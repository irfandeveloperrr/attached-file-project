import { createFileRoute } from "@tanstack/react-router";
import { PageScaffold } from "@/components/PageScaffold";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Lucky MeeSeva" },
      { name: "description", content: "Notifications for the Lucky MeeSeva office management system." },
      { property: "og:title", content: "Notifications — Lucky MeeSeva" },
      { property: "og:description", content: "Notifications for the Lucky MeeSeva office management system." },
    ],
  }),
  component: () => <PageScaffold navKey="notifications" />,
});
