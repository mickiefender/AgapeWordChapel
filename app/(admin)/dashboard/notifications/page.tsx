import { Bell, CheckCheck, Inbox, Sparkles } from "lucide-react";
import { getNotifications } from "@/lib/queries/notifications";
import { NotificationList } from "@/components/notifications/notification-list";
import { PageHeader, StatCard } from "@/components/ui/stat-card";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const notifications = await getNotifications();
  const unread = notifications.filter((notification) => !notification.read).length;
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Notifications" description="Stay informed about the latest updates that need your attention." />
      <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Unread" value={unread} description="Updates waiting for you" icon={Bell} iconTone="primary" />
        <StatCard title="Read" value={notifications.length - unread} description="Previously reviewed" icon={CheckCheck} iconTone="emerald" />
        <StatCard title="Total updates" value={notifications.length} description="Latest 100 notifications" icon={Inbox} iconTone="violet" />
      </div>
      {unread > 0 && <div className="mb-6 flex items-center gap-3 rounded-xl border border-primary/15 bg-primary/5 p-4 text-sm text-primary"><Sparkles className="h-5 w-5 shrink-0" /><p><strong>{unread} unread update{unread === 1 ? "" : "s"}</strong> need your attention.</p></div>}
      <NotificationList notifications={notifications} />
    </div>
  );
}
