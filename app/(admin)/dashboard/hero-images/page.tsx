import { ImagePlus, Images, Eye, EyeOff, Timer, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getHeroImages } from "@/lib/queries/hero-images";
import { deleteHeroImage, toggleHeroImage } from "@/actions/hero-images";
import { HeroImageForm } from "@/components/hero-images/hero-image-form";
import { PageHeader, StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function HeroImagesPage() {
  await requireAdmin();
  const images = await getHeroImages();
  const activeImages = images.filter((image) => image.is_active);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Hero Images" description="Manage the rotating images displayed on your public welcome page." />
      <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total images" value={images.length} description="Uploaded hero artwork" icon={Images} iconTone="primary" />
        <StatCard title="Published" value={activeImages.length} description="Visible on the homepage" icon={Eye} iconTone="emerald" />
        <StatCard title="Hidden" value={images.length - activeImages.length} description="Saved but not displayed" icon={EyeOff} iconTone="slate" />
        <StatCard title="Rotation" value={activeImages.length ? `${activeImages[0].duration_seconds}s` : "—"} description="Current first-slide duration" icon={Timer} iconTone="violet" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <section className="rounded-xl border border-border/80 bg-card p-5 shadow-card">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><ImagePlus className="h-5 w-5" /></div>
            <div><h2 className="font-semibold">Upload image</h2><p className="mt-1 text-xs text-muted-foreground">Choose how long this slide stays visible.</p></div>
          </div>
          <HeroImageForm />
        </section>

        <section className="rounded-xl border border-border/80 bg-card p-5 shadow-card">
          <div className="mb-5"><h2 className="font-semibold">Homepage rotation</h2><p className="mt-1 text-sm text-muted-foreground">Images change automatically using each slide&apos;s display duration.</p></div>
          {images.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center"><Images className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-3 font-medium">No hero images yet</p><p className="mt-1 text-sm text-muted-foreground">Upload your first image to start the homepage rotation.</p></div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {images.map((image) => (
                <article key={image.id} className="overflow-hidden rounded-xl border border-border/80 bg-background">
                  <div className="relative aspect-[16/8] bg-muted"><img src={image.image_url} alt={image.title ?? "Hero image"} className="h-full w-full object-cover" /><span className="absolute right-2 top-2 rounded-full bg-slate-950/75 px-2.5 py-1 text-xs font-medium text-white">{image.duration_seconds}s</span></div>
                  <div className="flex items-center justify-between gap-3 p-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{image.title || "Untitled hero image"}</p><p className="mt-1 text-xs text-muted-foreground">{image.is_active ? "Visible on homepage" : "Hidden from homepage"}</p></div><div className="flex shrink-0 items-center gap-1">
                    <form action={async () => { "use server"; await toggleHeroImage(image.id, !image.is_active); }}><Button type="submit" size="icon" variant="ghost" aria-label={image.is_active ? "Hide image" : "Show image"}>{image.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button></form>
                    <form action={async () => { "use server"; await deleteHeroImage(image.id); }}><Button type="submit" size="icon" variant="ghost" aria-label="Delete image"><Trash2 className="h-4 w-4 text-destructive" /></Button></form>
                  </div></div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
