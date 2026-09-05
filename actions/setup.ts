"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const setupSchema = z.object({
  email: z.string().email({ message: "Enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
});

export type SetupError = { error: string };

export async function setupSuperAdmin(formData: FormData): Promise<SetupError | void> {
  const supabase = await createClient();
  const { data: setupComplete } = await supabase.rpc("is_setup_complete");
  if (setupComplete === true) {
    return { error: "Setup has already been completed." };
  }

  const parsed = setupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form data." };
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      role: "super_admin",
    },
  });

  if (error) return { error: error.message };
  if (!data?.user) return { error: "Failed to create user." };

  // Ensure the profile has the super_admin role (the handle_new_user trigger reads
  // user_metadata->>'role', but we enforce it explicitly via the admin client).
  const { error: profileError } = await admin
    .from("profiles")
    .upsert(
      {
        user_id: data.user.id,
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
        role: "super_admin",
      },
      { onConflict: "user_id" },
    );

  if (profileError) return { error: profileError.message };

  revalidatePath("/", "layout");
  redirect("/login");
}
