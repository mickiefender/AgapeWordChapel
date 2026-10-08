import { CheckCircle2, Clock3, MessageSquareText, Send, UsersRound, XCircle } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getSmsHistory } from "@/lib/queries/sms-history";
import type { SmsAudience } from "@/lib/queries/sms-history";
import { getSmsRecipients } from "@/lib/queries/members";
import { BulkSmsComposer } from "@/components/announcements/bulk-sms-composer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, StatCard } from "@/components/ui/stat-card";

export const dynamic = "force-dynamic";

const audienceLabels: Record<SmsAudience, string> = {
  all: "All members",
  active: "Active members",
  workers: "Workers & leaders",
  individual_member: "Individual member",
  manual_number: "Manual number",
};

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const [history, members, params] = await Promise.all([getSmsHistory(), getSmsRecipients(), searchParams]);
  const initialMemberId = typeof params.memberId === "string" ? params.memberId : undefined;
  const initialMessage = typeof params.message === "string" ? params.message : undefined;
  const sent = history.filter((entry) => entry.status === "sent");
  const failed = history.filter((entry) => entry.status === "failed");
  const recipients = sent.reduce((total, entry) => total + entry.recipientCount, 0);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="SMS announcements" description="Send targeted SMS updates to members and review your messaging history." />
      <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Messages sent" value={sent.length} description="Successful SMS campaigns" icon={Send} iconTone="emerald" />
        <StatCard title="Recipients reached" value={recipients} description="Across successful sends" icon={UsersRound} iconTone="primary" />
        <StatCard title="Failed sends" value={failed.length} description="Messages needing attention" icon={XCircle} iconTone="rose" />
        <StatCard title="Campaign history" value={history.length} description="Latest 100 campaigns" icon={Clock3} iconTone="violet" />
      </div>
      <BulkSmsComposer members={members} initialMemberId={initialMemberId} initialMessage={initialMessage} />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MessageSquareText className="h-5 w-5 text-primary" /> SMS history</CardTitle>
          <p className="text-sm text-muted-foreground">Every send is recorded with its audience, recipient count, and provider response.</p>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">No SMS campaigns have been sent yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground"><th className="px-3 py-3">Date</th><th className="px-3 py-3">Message</th><th className="px-3 py-3">Audience</th><th className="px-3 py-3">Recipients</th><th className="px-3 py-3">Status</th></tr></thead>
                <tbody className="divide-y">
                  {history.map((entry) => (
                    <tr key={entry.id} className="hover:bg-muted/40">
                      <td className="whitespace-nowrap px-3 py-4 text-muted-foreground">{new Date(entry.createdAt).toLocaleString("en-GH")}</td>
                      <td className="max-w-sm px-3 py-4"><p className="truncate font-medium">{entry.message}</p>{entry.status === "failed" && entry.providerResponse && <p className="mt-1 truncate text-xs text-destructive">{entry.providerResponse}</p>}</td>
                      <td className="px-3 py-4"><Badge variant="outline">{audienceLabels[entry.audience]}</Badge></td>
                      <td className="px-3 py-4 font-medium">{entry.recipientCount}</td>
                      <td className="px-3 py-4"><Badge variant={entry.status === "sent" ? "success" : "destructive"}>{entry.status === "sent" ? <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> : <XCircle className="mr-1 h-3.5 w-3.5" />}{entry.status === "sent" ? "Sent" : "Failed"}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
