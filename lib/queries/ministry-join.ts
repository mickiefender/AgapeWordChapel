import { createClient } from "@/lib/supabase/server";
export type JoinRequestStatus = "pending" | "approved" | "rejected";

export type JoinRequestWithDepartment = {
  id: string;
  department_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  status: JoinRequestStatus;
  created_at: string;
  department_name: string | null;
};

export async function getJoinRequests(): Promise<JoinRequestWithDepartment[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ministry_join_requests")
    .select("*, department:departments(name)")
    .order("created_at", { ascending: false });

  return (data ?? []).map((request: any) => ({
    id: request.id,
    department_id: request.department_id,
    name: request.name,
    email: request.email,
    phone: request.phone,
    message: request.message,
    status: request.status as JoinRequestStatus,
    created_at: request.created_at,
    department_name: request.department?.name ?? null,
  }));
}
