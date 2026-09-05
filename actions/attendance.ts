"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const attendanceTypes = [
  "sunday_service",
  "midweek_service",
  "bible_study",
  "prayer_meeting",
  "cell_group",
  "department",
  "event",
  "children_ministry",
  "youth_ministry",
] as const;

const markAttendanceSchema = z.object({
  memberIds: z.array(z.string().uuid()).min(1, "Select at least one member."),
  attendanceType: z.enum(attendanceTypes),
  contextId: z.string().uuid().optional().nullable(),
  checkInTime: z.string().datetime({ offset: true }),
});

export type AttendanceActionError = { error: string };

export async function markAttendance(input: {
  memberIds: string[];
  attendanceType: string;
  contextId?: string;
  checkInTime: string;
}): Promise<AttendanceActionError | void> {
  await requireAdmin();

  const parsed = markAttendanceSchema.safeParse({
    memberIds: input.memberIds,
    attendanceType: input.attendanceType,
    contextId: input.contextId || null,
    checkInTime: input.checkInTime,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid attendance data." };
  }

  const contextColumn =
    parsed.data.attendanceType === "cell_group"
      ? "cell_group_id"
      : parsed.data.attendanceType === "department"
        ? "department_id"
        : parsed.data.attendanceType === "sunday_service" ||
            parsed.data.attendanceType === "midweek_service"
          ? "service_id"
          : parsed.data.attendanceType === "event"
            ? "event_id"
          : null;

  if (["cell_group", "department", "sunday_service", "midweek_service", "event"].includes(parsed.data.attendanceType) && !parsed.data.contextId) {
    return { error: "Select a context for this attendance type." };
  }

  const supabase = await createClient();
  if (
    parsed.data.contextId &&
    (parsed.data.attendanceType === "sunday_service" || parsed.data.attendanceType === "midweek_service")
  ) {
    const checkInDate = new Date(parsed.data.checkInTime);
    const startOfDay = new Date(
      Date.UTC(checkInDate.getUTCFullYear(), checkInDate.getUTCMonth(), checkInDate.getUTCDate()),
    );
    const startOfNextDay = new Date(startOfDay);
    startOfNextDay.setUTCDate(startOfNextDay.getUTCDate() + 1);

    const { data: existing } = await supabase
      .from("attendance")
      .select("member_id")
      .eq("service_id", parsed.data.contextId)
      .in("member_id", parsed.data.memberIds)
      .gte("check_in_time", startOfDay.toISOString())
      .lt("check_in_time", startOfNextDay.toISOString());

    if (existing && existing.length > 0) {
      return {
        error: `${existing.length} selected ${existing.length === 1 ? "person has" : "people have"} already been marked for this service on this day.`,
      };
    }
  }

  const rows = parsed.data.memberIds.map((memberId) => ({
    member_id: memberId,
    attendance_type: parsed.data.attendanceType,
    check_in_time: parsed.data.checkInTime,
    ...(contextColumn && parsed.data.contextId ? { [contextColumn]: parsed.data.contextId } : {}),
  }));

  const { error } = await supabase.from("attendance").insert(rows);
  if (error) {
    if (error.code === "23505") {
      return { error: "One or more selected people are already marked for this service on this day." };
    }
    return { error: error.message };
  }

  revalidatePath("/dashboard/attendance");
}
