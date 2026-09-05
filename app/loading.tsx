import Image from "next/image";

export default function PublicLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4" role="status" aria-label="Loading page">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          <span className="absolute inset-1 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
          <Image
            src="/Agape%20logo.png"
            alt="Agape Word Chapel"
            width={76}
            height={76}
            className="relative h-16 w-16 object-contain"
            priority
          />
        </div>
        <p className="text-sm font-medium text-muted-foreground">Loading…</p>
      </div>
    </div>
  );
}
