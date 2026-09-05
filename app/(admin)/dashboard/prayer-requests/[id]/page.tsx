import Link from "next/link";
import { notFound } from "next/navigation";
import { getPrayerRequest } from "@/lib/queries/prayer-requests";
import { PageHeader } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HeartPulse, Pencil } from "lucide-react";
import { PRAYER_STATUS_LABELS } from "@/types";

export const dynamic = "force-dynamic";

export default async function PrayerRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const prayerRequest = await getPrayerRequest(id);

  if (!prayerRequest) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title={prayerRequest.requester_name ?? "Anonymous"}
        description={`Prayer request · ${new Date(prayerRequest.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`}
        actions={
          <Button variant="outline" asChild>
            <Link href={`/dashboard/prayer-requests/${id}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="h-4 w-4" />
            Prayer Request
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p className="whitespace-pre-wrap">{prayerRequest.content}</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Privacy</p>
              <Badge variant="secondary" className="mt-1">
                {prayerRequest.privacy.replace(/_/g, " ")}
              </Badge>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Status</p>
              <Badge variant="outline" className="mt-1">
                {PRAYER_STATUS_LABELS[prayerRequest.status] ?? prayerRequest.status}
              </Badge>
            </div>
          </div>

          {prayerRequest.member_id && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">Member ID</p>
              <p className="mt-1 text-muted-foreground">{prayerRequest.member_id}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        <Button variant="outline" asChild>
          <Link href="/dashboard/prayer-requests">
            <HeartPulse className="h-4 w-4" />
            Back to Prayer Requests
          </Link>
        </Button>
      </div>
    </div>
  );
}
