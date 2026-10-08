import Link from "next/link";
import { Cake, CalendarDays, ChevronRight, Clock3, MessageCircle, PartyPopper, UsersRound } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, StatCard } from "@/components/ui/stat-card";
import { getBirthdayOverview } from "@/lib/queries/birthdays";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

function formatBirthday(date: string, options: Intl.DateTimeFormatOptions = { month: "long", day: "numeric" }) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GH", { ...options, timeZone: "UTC" });
}

function getCountdown(daysUntil: number) {
  if (daysUntil === 0) return "Today";
  if (daysUntil === 1) return "Tomorrow";
  return `In ${daysUntil} days`;
}

function birthdaySms(name: string) {
  return `Happy birthday, ${name}! We thank God for your life and pray that this new year brings you joy, peace, and abundant blessings. With love, Agape Word Chapel International.`;
}

export default async function BirthdaysPage() {
  await requireAdmin();
  const overview = await getBirthdayOverview();
  const todaysBirthdays = overview.upcoming.filter((birthday) => birthday.daysUntil === 0);
  const todayLabel = new Date().toLocaleDateString("en-GH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Birthday celebrations"
        description="Celebrate the people in your church and make every member feel remembered."
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/members"><UsersRound className="h-4 w-4" />Member directory</Link>
          </Button>
        }
      />

      <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-card p-6 shadow-card md:p-8">
        <div className="pointer-events-none absolute -right-8 -top-12 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <PartyPopper className="h-3.5 w-3.5" />Birthday ministry
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              {todaysBirthdays.length > 0
                ? `${todaysBirthdays.length} celebration${todaysBirthdays.length === 1 ? "" : "s"} today`
                : "Make every birthday meaningful"}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {todaysBirthdays.length > 0
                ? `Today, ${todayLabel}, is a special day for ${todaysBirthdays.map((birthday) => birthday.firstName).join(", ")}. Send them a personal birthday blessing.`
                : `Keep up with upcoming member birthdays and send a thoughtful message. ${todayLabel}.`}
            </p>
          </div>
          <div className="flex h-20 w-20 shrink-0 items-center justify-center self-start rounded-2xl border border-primary/15 bg-background/80 text-primary shadow-sm sm:self-auto">
            <Cake className="h-10 w-10" strokeWidth={1.5} />
          </div>
        </div>
        {todaysBirthdays.length > 0 && (
          <div className="relative mt-6 flex flex-wrap gap-2">
            {todaysBirthdays.map((birthday) => (
              <span key={birthday.id} className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 py-1 pl-1 pr-3 text-sm font-medium text-foreground">
                <Avatar src={birthday.avatarUrl} firstName={birthday.firstName} lastName={birthday.lastName} size="sm" />
                {birthday.firstName} {birthday.lastName}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Today" value={overview.today} description="Members celebrating today" icon={Cake} iconTone="amber" />
        <StatCard title="Next 7 days" value={overview.nextSevenDays} description="Coming up this week" icon={Clock3} iconTone="rose" />
        <StatCard title="This month" value={overview.thisMonth} description="Birthdays in the current month" icon={CalendarDays} iconTone="violet" />
        <StatCard title="Birthday directory" value={overview.totalWithBirthdays} description="Members with a birthday on file" icon={UsersRound} iconTone="primary" />
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="flex-row items-center justify-between border-b border-border/70 px-5 py-4 md:px-6">
          <div>
            <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary" />Next 30 days</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">A rolling view of member birthdays. Member ages are not displayed.</p>
          </div>
          <Badge variant="outline">{overview.upcoming.length} upcoming</Badge>
        </CardHeader>
        <CardContent className="p-0">
          {overview.upcoming.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground"><Cake className="h-7 w-7" /></div>
              <h3 className="mt-4 text-base font-semibold">No upcoming birthdays</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                There are no birthdays in the next 30 days. Add a date of birth to a member profile to see it here.
              </p>
              <Button className="mt-5" variant="outline" asChild><Link href="/dashboard/members">View members <ChevronRight className="h-4 w-4" /></Link></Button>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {overview.upcoming.map((birthday) => {
                const name = `${birthday.firstName} ${birthday.lastName}`;
                const messageHref = `/dashboard/announcements?${new URLSearchParams({
                  memberId: birthday.id,
                  message: birthdaySms(birthday.firstName),
                }).toString()}`;
                return (
                  <div key={birthday.id} className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center md:px-6">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <Avatar src={birthday.avatarUrl} firstName={birthday.firstName} lastName={birthday.lastName} size="md" />
                      <div className="min-w-0">
                        <Link href={`/dashboard/members/${birthday.id}`} className="truncate text-sm font-semibold hover:text-primary hover:underline">{name}</Link>
                        <p className="mt-0.5 text-xs text-muted-foreground">{birthday.phone || "No phone number on file"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:w-48">
                      <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg border border-border/80 bg-background">
                        <span className="text-[9px] font-semibold uppercase leading-none text-muted-foreground">{formatBirthday(birthday.birthday, { month: "short" })}</span>
                        <span className="mt-0.5 text-sm font-bold leading-none">{Number(birthday.birthday.slice(8))}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{formatBirthday(birthday.birthday)}</p>
                        <p className={`text-xs ${birthday.daysUntil <= 7 ? "font-semibold text-amber-700 dark:text-amber-300" : "text-muted-foreground"}`}>{getCountdown(birthday.daysUntil)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 sm:justify-end">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/dashboard/members/${birthday.id}`}>View profile</Link>
                      </Button>
                      {birthday.phone && (
                        <Button size="sm" asChild>
                          <Link href={messageHref}><MessageCircle className="h-4 w-4" />Send wishes</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Birthday visibility follows the date of birth recorded in each member profile. Keep member details up to date in the <Link href="/dashboard/members" className="font-medium text-primary hover:underline">member directory</Link>.
      </p>
    </div>
  );
}
