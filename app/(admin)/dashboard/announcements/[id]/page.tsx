import Link from "next/link";
import { notFound } from "next/navigation";
import { getAnnouncement } from "@/lib/queries/announcements";
import { PageHeader } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Pencil } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AnnouncementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const announcement = await getAnnouncement(id);

  if (!announcement) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title={announcement.title}
        description={`${announcement.audience.replace(/_/g, " ")} announcement`}
        actions={
          <Button variant="outline" asChild>
            <Link href={`/dashboard/announcements/${id}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            Announcement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p className="whitespace-pre-wrap">{announcement.content}</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Audience</p>
              <Badge variant="secondary" className="mt-1">
                {announcement.audience.replace(/_/g, " ")}
              </Badge>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Status</p>
              <Badge variant={announcement.published ? "default" : "secondary"} className="mt-1">
                {announcement.published ? "Published" : "Draft"}
              </Badge>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Publish Date</p>
              <p className="mt-1">
                {new Date(announcement.publish_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            {announcement.expiry_date && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Expiry Date</p>
                <p className="mt-1">
                  {new Date(announcement.expiry_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>

          {(announcement.image_url || announcement.video_url || announcement.document_url) && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Links</p>
              <div className="flex flex-wrap gap-2">
                {announcement.image_url && (
                  <a href={announcement.image_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                    Image
                  </a>
                )}
                {announcement.video_url && (
                  <a href={announcement.video_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                    Video
                  </a>
                )}
                {announcement.document_url && (
                  <a href={announcement.document_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                    Document
                  </a>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        <Button variant="outline" asChild>
          <Link href="/dashboard/announcements">
            <Megaphone className="h-4 w-4" />
            Back to Announcements
          </Link>
        </Button>
      </div>
    </div>
  );
}
