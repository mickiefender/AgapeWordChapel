"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const contactMessageSchema = z.object({
  name: z.string().trim().min(1, "Your name is required.").max(120),
  email: z.string().trim().email("Enter a valid email address.").max(255),
  subject: z.string().trim().min(1, "A subject is required.").max(200),
  message: z.string().trim().min(1, "A message is required.").max(5000),
});

export type ContactMessageActionError = { error: string };

export async function submitContactMessage(
  formData: FormData,
): Promise<ContactMessageActionError | void> {
  const parsed = contactMessageSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please complete the form." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    sender_name: parsed.data.name,
    sender_email: parsed.data.email,
    subject: parsed.data.subject,
    message: parsed.data.message,
    status: "new",
  });

  if (error) return { error: "We could not send your message. Please try again." };
  revalidatePath("/dashboard/contact-messages");
}
