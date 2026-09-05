import { createClient } from "@/lib/supabase/server";

export type DashboardStats = {
  totalMembers: number;
  activeMembers: number;
  newMembers: number;
  visitors: number;
  todayAttendance: number;
  weekAttendance: number;
  upcomingEvents: number;
  pendingFollowUps: number;
  activeDepartments: number;
  activeCellGroups: number;
  workers: number;
  totalGiving: number;
  totalExpenses: number;
};

export type DashboardTrend = {
  label: string;
  value: number;
};

export type DashboardData = {
  stats: DashboardStats;
  membershipGrowth: DashboardTrend[];
  attendanceTrend: DashboardTrend[];
  visitorGrowth: DashboardTrend[];
  givingTrend: DashboardTrend[];
  departmentParticipation: { name: string; count: number }[];
  cellGroupAttendance: { name: string; count: number }[];
  recentMembers: {
    id: string;
    name: string;
    status: string;
    created_at: string;
    avatar_url: string | null;
  }[];
  upcomingEvents: {
    id: string;
    title: string;
    start_date: string;
    location: string | null;
  }[];
  pendingFollowUps: {
    id: string;
    task: string;
    due_date: string | null;
    member_name: string | null;
  }[];
};

function monthLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short" });
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(today);
  const dayOfWeek = (today.getDay() + 6) % 7; // Monday = 0
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  const [
    membersRes,
    visitorsRes,
    attendanceRes,
    eventsRes,
    followUpsRes,
    departmentsRes,
    cellGroupsRes,
    donationsRes,
    expensesRes,
  ] = await Promise.all([
    supabase.from("members").select("id, membership_status, created_at"),
    supabase.from("visitors").select("id, status, created_at"),
    supabase
      .from("attendance")
      .select("id, attendance_type, check_in_time")
      .gte("check_in_time", startOfWeek.toISOString()),
    supabase.from("events").select("id, title, start_date, location").gte("start_date", today.toISOString().slice(0, 10)),
    supabase.from("follow_ups").select("id, task, due_date, member_id, status").eq("status", "pending"),
    supabase.from("departments").select("id"),
    supabase.from("cell_groups").select("id"),
    supabase.from("donations").select("amount, donation_date"),
    supabase.from("expenses").select("amount, expense_date"),
  ]);

  const members = membersRes.data ?? [];
  const visitors = visitorsRes.data ?? [];
  const attendance = attendanceRes.data ?? [];
  const events = eventsRes.data ?? [];
  const followUps = followUpsRes.data ?? [];
  const departments = departmentsRes.data ?? [];
  const cellGroups = cellGroupsRes.data ?? [];
  const donations = donationsRes.data ?? [];
  const expenses = expensesRes.data ?? [];

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const totalMembers = members.length;
  const activeMembers = members.filter((m) =>
    ["active_member", "worker", "leader"].includes(m.membership_status),
  ).length;
  const newMembers = members.filter((m) => new Date(m.created_at) >= monthStart).length;
  const todayAttendance = attendance.filter((a) => {
    const d = new Date(a.check_in_time);
    return d.toDateString() === today.toDateString();
  }).length;
  const weekAttendance = attendance.length;
  const totalGiving = donations.reduce((sum, d) => sum + Number(d.amount ?? 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount ?? 0), 0);

  // Build monthly trends (last 6 months)
  const membershipGrowth: DashboardTrend[] = [];
  const attendanceTrend: DashboardTrend[] = [];
  const visitorGrowth: DashboardTrend[] = [];
  const givingTrend: DashboardTrend[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const end = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);
    const label = monthLabel(d);
    membershipGrowth.push({
      label,
      value: members.filter((m) => {
        const c = new Date(m.created_at);
        return c >= d && c < end;
      }).length,
    });
    attendanceTrend.push({
      label,
      value: attendance.filter((a) => {
        const c = new Date(a.check_in_time);
        return c >= d && c < end;
      }).length,
    });
    visitorGrowth.push({
      label,
      value: visitors.filter((v) => {
        const c = new Date(v.created_at);
        return c >= d && c < end;
      }).length,
    });
    givingTrend.push({
      label,
      value: donations.filter((don) => {
        const c = new Date(don.donation_date);
        return c >= d && c < end;
      }).reduce((sum, don) => sum + Number(don.amount ?? 0), 0),
    });
  }

  // Department participation: count members in each department
  const { data: deptMembersRes } = await supabase.from("department_members").select("department_id");
  const deptMembers = deptMembersRes ?? [];
  const { data: allDepartmentsRes } = await supabase.from("departments").select("id, name");
  const allDepartments = allDepartmentsRes ?? [];
  const departmentParticipation = allDepartments.map((d) => ({
    name: d.name,
    count: deptMembers.filter((dm) => dm.department_id === d.id).length,
  }));

  // Cell group attendance
  const { data: cellReportsRes } = await supabase.from("cell_group_reports").select("cell_group_id, present");
  const cellReports = cellReportsRes ?? [];
  const { data: allCellGroupsRes } = await supabase.from("cell_groups").select("id, name");
  const allCellGroups = allCellGroupsRes ?? [];
  const cellGroupAttendance = allCellGroups.map((g) => ({
    name: g.name,
    count: cellReports
      .filter((r) => r.cell_group_id === g.id)
      .reduce((sum, r) => sum + Number(r.present ?? 0), 0),
  }));

  // Recent members
  const { data: recentMembersRes } = await supabase
    .from("members")
    .select("id, first_name, last_name, membership_status, created_at, avatar_url")
    .order("created_at", { ascending: false })
    .limit(5);
  const recentMembers = (recentMembersRes ?? []).map((m) => ({
    id: m.id,
    name: `${m.first_name} ${m.last_name}`,
    status: m.membership_status,
    created_at: m.created_at,
    avatar_url: m.avatar_url,
  }));

  // Upcoming events
  const upcomingEvents = events.slice(0, 5).map((e) => ({
    id: e.id,
    title: e.title,
    start_date: e.start_date,
    location: e.location,
  }));

  // Pending follow-ups with member names
  const memberIds = followUps.map((f) => f.member_id).filter(Boolean) as string[];
  const memberNames: Record<string, string> = {};
  if (memberIds.length > 0) {
    const { data: membersForNames } = await supabase
      .from("members")
      .select("id, first_name, last_name")
      .in("id", memberIds);
    for (const m of membersForNames ?? []) {
      memberNames[m.id] = `${m.first_name} ${m.last_name}`;
    }
  }
  const pendingFollowUps = followUps.slice(0, 5).map((f) => ({
    id: f.id,
    task: f.task,
    due_date: f.due_date,
    member_name: f.member_id ? memberNames[f.member_id] ?? null : null,
  }));

  return {
    stats: {
      totalMembers,
      activeMembers,
      newMembers,
      visitors: visitors.length,
      todayAttendance,
      weekAttendance,
      upcomingEvents: events.length,
      pendingFollowUps: followUps.length,
      activeDepartments: departments.length,
      activeCellGroups: cellGroups.length,
      workers: members.filter((m) => ["worker", "leader"].includes(m.membership_status)).length,
      totalGiving,
      totalExpenses,
    },
    membershipGrowth,
    attendanceTrend,
    visitorGrowth,
    givingTrend,
    departmentParticipation,
    cellGroupAttendance,
    recentMembers,
    upcomingEvents,
    pendingFollowUps,
  };
}
