import Link from "next/link";
import { notFound } from "next/navigation";
import { getSermon } from "@/lib/queries/sermons";
import { PageHeader } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, Pencil } from "lucide-react";
import { FacebookSermonEmbed } from "@/components/sermons/facebook-sermon-embed";
import { DeleteSermonButton } from "@/components/sermons/delete-sermon-button";

export const dynamic = "force-dynamic";

export default async function SermonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sermon = await getSermon(id);

  if (!sermon) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title={sermon.title}
        description={sermon.speaker ?? "Sermon"}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href={`/dashboard/sermons/${id}/edit`}>
                <Pencil className="h-4 w-4" />
                Edit
              </Link>
            </Button>
            <DeleteSermonButton sermonId={id} sermonTitle={sermon.title} />
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Sermon Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm">
          {sermon.description && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">Description</p>
              <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{sermon.description}</p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Speaker</p>
              <p className="mt-1">{sermon.speaker ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Status</p>
              <Badge variant={sermon.status === "published" ? "default" : "secondary"} className="mt-1 capitalize">{sermon.status}</Badge>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Published Date</p>
              <p className="mt-1 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                {sermon.published_date
                  ? new Date(sermon.published_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "—"}
              </p>
            </div>
          </div>

          {sermon.scripture_references && sermon.scripture_references.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">Scripture References</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {sermon.scripture_references.map((ref) => (
                  <Badge key={ref} variant="secondary">{ref}</Badge>
                ))}
              </div>
            </div>
          )}

          {sermon.categories && sermon.categories.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">Categories</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {sermon.categories.map((cat) => (
                  <Badge key={cat} variant="outline">{cat}</Badge>
                ))}
              </div>
            </div>
          )}

          {sermon.tags && sermon.tags.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">Tags</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {sermon.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          )}

          {(sermon.audio_url || sermon.video_url || sermon.youtube_url || sermon.pdf_url) && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Resources</p>
              <div className="flex flex-wrap gap-2">
                {sermon.audio_url && (
                  <a href={sermon.audio_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                    Audio
                  </a>
                )}
                {sermon.video_url && (
                  <a href={sermon.video_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                    Video
                  </a>
                )}
                {sermon.youtube_url && (
                  <a href={sermon.youtube_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                    YouTube
                  </a>
                )}
                {sermon.pdf_url && (
                  <a href={sermon.pdf_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                    PDF
                  </a>
                )}
              </div>
            </div>
          )}
          {sermon.facebook_url && (
            <FacebookSermonEmbed url={sermon.facebook_url} title={sermon.title} speaker={sermon.speaker} description={sermon.description} imageUrl={sermon.image_url} />
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        <Button variant="outline" asChild>
          <Link href="/dashboard/sermons">
            <BookOpen className="h-4 w-4" />
            Back to Sermons
          </Link>
        </Button>
      </div>
    </div>
  );
}
