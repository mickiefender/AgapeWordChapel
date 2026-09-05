import Link from "next/link";
import { getSermons } from "@/lib/queries/sermons";
import { SermonTable } from "@/components/sermons/sermon-table";
import { PageHeader } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { BookOpen, FileAudio, FileVideo } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";

export const dynamic = "force-dynamic";

export default async function SermonsPage() {
  const sermons = await getSermons();

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Sermons"
        description="Organize teachings, recordings, and resources for your church."
        actions={
          <Button asChild>
            <Link href="/dashboard/sermons/new">
              <Plus className="h-4 w-4" />
              Add Sermon
            </Link>
          </Button>
        }
      />

      <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total sermons" value={sermons.length} description="Messages in your library" icon={BookOpen} iconTone="primary" />
        <StatCard title="Video sermons" value={sermons.filter((sermon) => sermon.video_url).length} description="Visual recordings" icon={FileVideo} iconTone="violet" />
        <StatCard title="Audio sermons" value={sermons.filter((sermon) => sermon.audio_url).length} description="Audio recordings" icon={FileAudio} iconTone="emerald" />
        <StatCard title="With resources" value={sermons.filter((sermon) => sermon.pdf_url || sermon.image_url).length} description="Supporting files attached" icon={BookOpen} iconTone="amber" />
      </div>

      <SermonTable sermons={sermons} />
    </div>
  );
}
