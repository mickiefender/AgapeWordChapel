import { createClient } from "@/lib/supabase/server";

export type UpcomingBirthday = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  birthday: string;
  daysUntil: number;
};

export type BirthdayOverview = {
  upcoming: UpcomingBirthday[];
  totalWithBirthdays: number;
  today: number;
  nextSevenDays: number;
  thisMonth: number;
};

function getNextBirthday(dateOfBirth: string, today: Date) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOfBirth);
  if (!match) return null;

  const month = Number(match[2]);
  const day = Number(match[3]);
  const originalDate = new Date(Date.UTC(Number(match[1]), month - 1, day));
  if (
    originalDate.getUTCFullYear() !== Number(match[1]) ||
    originalDate.getUTCMonth() !== month - 1 ||
    originalDate.getUTCDate() !== day
  ) return null;

  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  let year = today.getUTCFullYear();
  let nextDate = new Date(Date.UTC(year, month - 1, day));
  if (nextDate.getUTCMonth() !== month - 1) nextDate = new Date(Date.UTC(year, month, 0));
  if (nextDate.getTime() < todayUtc) {
    year += 1;
    nextDate = new Date(Date.UTC(year, month - 1, day));
    if (nextDate.getUTCMonth() !== month - 1) nextDate = new Date(Date.UTC(year, month, 0));
  }

  return {
    date: nextDate,
    daysUntil: Math.round((nextDate.getTime() - todayUtc) / 86_400_000),
    month,
  };
}

export async function getBirthdayOverview(): Promise<BirthdayOverview> {
  const supabase = await createClient();
  const pageSize = 1000;
  const today = new Date();
  const birthdays: UpcomingBirthday[] = [];
  let totalWithBirthdays = 0;
  let todayCount = 0;
  let nextSevenDays = 0;
  let thisMonth = 0;

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("members")
      .select("id, first_name, last_name, phone, avatar_url, date_of_birth")
      .not("date_of_birth", "is", null)
      .order("first_name")
      .range(from, from + pageSize - 1);

    if (error) throw new Error(`Unable to load member birthdays: ${error.message}`);

    for (const member of data ?? []) {
      if (!member.date_of_birth) continue;
      const birthday = getNextBirthday(member.date_of_birth, today);
      if (!birthday) continue;

      totalWithBirthdays += 1;
      if (birthday.month === today.getUTCMonth() + 1) thisMonth += 1;
      if (birthday.daysUntil === 0) todayCount += 1;
      if (birthday.daysUntil <= 6) nextSevenDays += 1;
      if (birthday.daysUntil <= 30) {
        birthdays.push({
          id: member.id,
          firstName: member.first_name,
          lastName: member.last_name,
          phone: member.phone,
          avatarUrl: member.avatar_url,
          birthday: birthday.date.toISOString().slice(0, 10),
          daysUntil: birthday.daysUntil,
        });
      }
    }

    if ((data ?? []).length < pageSize) break;
  }

  birthdays.sort((a, b) => a.daysUntil - b.daysUntil || a.firstName.localeCompare(b.firstName));

  return { upcoming: birthdays, totalWithBirthdays, today: todayCount, nextSevenDays, thisMonth };
}
