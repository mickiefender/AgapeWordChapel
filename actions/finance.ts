"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireFinance } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";

const donationSchema = z.object({
  donor_name: z.string().trim().max(120).optional(),
  member_id: z.string().uuid().optional(),
  donation_type: z.enum(["tithe", "offering", "donation", "pledge", "building_fund", "missions", "welfare", "department_fund"]),
  amount: z.coerce.number().positive("Amount must be greater than zero."),
  payment_method: z.string().trim().max(60).optional(),
  transaction_ref: z.string().trim().max(120).optional(),
  donation_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid donation date."),
  notes: z.string().trim().max(500).optional(),
});

function optionalValue(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || undefined;
}

export async function createIncomeEntry(formData: FormData): Promise<void> {
  const { user } = await requireFinance();

  const parsed = donationSchema.safeParse({
    donor_name: optionalValue(formData.get("donor_name")),
    member_id: optionalValue(formData.get("member_id")),
    donation_type: formData.get("donation_type"),
    amount: formData.get("amount"),
    payment_method: optionalValue(formData.get("payment_method")),
    transaction_ref: optionalValue(formData.get("transaction_ref")),
    donation_date: formData.get("donation_date"),
    notes: optionalValue(formData.get("notes")),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid income entry.");
  }

  const supabase = await createClient();
  const { data: donation, error } = await supabase.from("donations").insert({
    ...parsed.data,
    currency: "GHS",
  }).select("id").single();

  if (error) throw new Error(`Unable to save income entry: ${error.message}`);
  await logAudit({
    userId: user.id,
    action: "financial_transaction",
    resource: "donation",
    resourceId: donation.id,
    metadata: { donationType: parsed.data.donation_type, amount: parsed.data.amount, currency: "GHS" },
  });

  revalidatePath("/dashboard/finance");
  revalidatePath("/dashboard/finance/income");
  redirect("/dashboard/finance/income");
}

const expenseSchema = z.object({
  category: z.string().trim().min(1, "Category is required.").max(80),
  description: z.string().trim().max(500).optional(),
  amount: z.coerce.number().positive("Amount must be greater than zero."),
  expense_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid expense date."),
});

export async function createExpense(formData: FormData): Promise<void> {
  const { profile } = await requireFinance();
  const parsed = expenseSchema.safeParse({
    category: formData.get("category"),
    description: optionalValue(formData.get("description")),
    amount: formData.get("amount"),
    expense_date: formData.get("expense_date"),
  });

  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid expense.");

  const supabase = await createClient();
  const { data: expense, error } = await supabase.from("expenses").insert({
    ...parsed.data,
    currency: "GHS",
    requested_by: profile.id,
    approval_status: "pending",
  }).select("id").single();

  if (error) throw new Error(`Unable to save expense: ${error.message}`);
  await logAudit({
    userId: profile.user_id,
    action: "create",
    resource: "expense",
    resourceId: expense.id,
    metadata: { category: parsed.data.category, amount: parsed.data.amount, currency: "GHS", approvalStatus: "pending" },
  });

  revalidatePath("/dashboard/finance");
  revalidatePath("/dashboard/finance/expenses");
  redirect("/dashboard/finance/expenses");
}

export async function reviewExpense(
  expenseId: string,
  decision: "approved" | "rejected",
  rejectionReason?: string,
): Promise<void> {
  const { profile } = await requireFinance();
  const supabase = await createClient();
  const update = decision === "approved"
    ? {
        approval_status: "approved",
        approved_by: profile.id,
        approved_at: new Date().toISOString(),
        rejection_reason: null,
      }
    : {
        approval_status: "rejected",
        approved_by: null,
        approved_at: null,
        rejection_reason: rejectionReason?.trim() || "Rejected by finance reviewer.",
      };

  const { error } = await supabase.from("expenses").update(update).eq("id", expenseId).eq("approval_status", "pending");
  if (error) throw new Error(`Unable to review expense: ${error.message}`);
  await logAudit({
    userId: profile.user_id,
    action: "financial_transaction",
    resource: "expense",
    resourceId: expenseId,
    metadata: { decision, rejectionReason: decision === "rejected" ? update.rejection_reason : null },
  });

  revalidatePath("/dashboard/finance");
  revalidatePath("/dashboard/finance/expenses");
}

const budgetSchema = z.object({
  name: z.string().trim().min(1, "Budget name is required.").max(120),
  category: z.string().trim().max(80).optional(),
  amount: z.coerce.number().positive("Budget amount must be greater than zero."),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid start date."),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid end date."),
});

function parseBudget(formData: FormData) {
  const parsed = budgetSchema.safeParse({
    name: formData.get("name"),
    category: optionalValue(formData.get("category")),
    amount: formData.get("amount"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid budget.");
  if (parsed.data.end_date < parsed.data.start_date) throw new Error("End date must be on or after the start date.");
  return parsed.data;
}

export async function createBudget(formData: FormData): Promise<void> {
  const { user } = await requireFinance();
  const budgetData = parseBudget(formData);
  const supabase = await createClient();
  const { data: budget, error } = await supabase.from("budgets").insert({ ...budgetData, currency: "GHS" }).select("id").single();
  if (error) throw new Error(`Unable to save budget: ${error.message}`);
  await logAudit({ userId: user.id, action: "create", resource: "budget", resourceId: budget.id, metadata: { amount: budgetData.amount, currency: "GHS" } });
  revalidatePath("/dashboard/finance");
  revalidatePath("/dashboard/finance/budgets");
  redirect("/dashboard/finance/budgets");
}

export async function updateBudget(budgetId: string, formData: FormData): Promise<void> {
  const { user } = await requireFinance();
  const budgetData = parseBudget(formData);
  const supabase = await createClient();
  const { error } = await supabase.from("budgets").update(budgetData).eq("id", budgetId);
  if (error) throw new Error(`Unable to update budget: ${error.message}`);
  await logAudit({ userId: user.id, action: "update", resource: "budget", resourceId: budgetId, metadata: { amount: budgetData.amount, currency: "GHS" } });
  revalidatePath("/dashboard/finance");
  revalidatePath("/dashboard/finance/budgets");
  redirect("/dashboard/finance/budgets");
}

export async function deleteBudget(budgetId: string): Promise<void> {
  const { user } = await requireFinance();
  const supabase = await createClient();
  const { error } = await supabase.from("budgets").delete().eq("id", budgetId);
  if (error) throw new Error(`Unable to delete budget: ${error.message}`);
  await logAudit({ userId: user.id, action: "delete", resource: "budget", resourceId: budgetId });
  revalidatePath("/dashboard/finance");
  revalidatePath("/dashboard/finance/budgets");
}
