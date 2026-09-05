const announcement = "WELCOME TO AGAPE WORD CHAPEL INTERNATIONAL • GROWING IN FAITH, WALKING IN PURPOSE";

export function AnnouncementTicker() {
  return (
    <section className="overflow-hidden bg-amber-400 text-slate-950" aria-label="Church welcome message">
      <div className="announcement-ticker-track flex w-max whitespace-nowrap py-5 sm:py-6">
        {[announcement, announcement].map((message, index) => (
          <span
            key={index}
            aria-hidden={index === 1}
            className="px-5 text-2xl font-black uppercase tracking-[0.12em] sm:px-8 sm:text-4xl"
          >
            {message}
          </span>
        ))}
      </div>
    </section>
  );
}
