import { createClient } from "@/lib/supabase/server";

export async function isSetupComplete(): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("is_setup_complete");
  return data === true;
}
