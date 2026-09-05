import Image from "next/image";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4" role="status" aria-label="Loading dashboard">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          <span className="absolute inset-1 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
          <Image
            src="/Agape%20logo.png"
            alt="Agape Word Chapel"
            width={64}
            height={64}
            className="relative h-14 w-14 object-contain"
            priority
          />
        </div>
        <p className="text-sm font-medium text-muted-foreground">Loading dashboard…</p>
      </div>
    </div>
  );
}
