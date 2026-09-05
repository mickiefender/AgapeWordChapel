import { createClient } from "@/lib/supabase/server";

type FinancialRow = {
  id: string;
  amount: number | string;
  category?: string | null;
  donation_type?: string | null;
  member_id?: string | null;
  description?: string | null;
  donor_name?: string | null;
  payment_method?: string | null;
  transaction_ref?: string | null;
  notes?: string | null;
  transaction_date?: string;
  donation_date?: string;
  expense_date?: string;
  currency?: string | null;
};

export type FinanceActivity = {
  id: string;
  type: "income" | "expense";
  label: string;
  description: string;
  amount: number;
  date: string;
  currency: string;
};

export type FinanceMonth = {
  label: string;
  income: number;
  expenses: number;
};

export type FinanceOverview = {
  totalIncome: number;
  totalExpenses: number;
  currentMonthIncome: number;
  currentMonthExpenses: number;
  activeBudget: number;
  balance: number;
  activities: FinanceActivity[];
  incomeByCategory: { label: string; value: number }[];
  expenseByCategory: { label: string; value: number }[];
  monthlyTrend: FinanceMonth[];
};

export type IncomeEntry = {
  id: string;
  donorName: string;
  memberId: string | null;
  donationType: string;
  amount: number;
  currency: string;
  paymentMethod: string | null;
  transactionRef: string | null;
  donationDate: string;
  notes: string | null;
};

export type FinanceMemberOption = {
  id: string;
  name: string;
};

export type ExpenseEntry = {
  id: string;
  category: string;
  description: string | null;
  amount: number;
  expenseDate: string;
  currency: string;
  approvalStatus: "pending" | "approved" | "rejected";
  rejectionReason: string | null;
  requesterName: string;
  approverName: string | null;
};

export type BudgetEntry = {
  id: string;
  name: string;
  category: string | null;
  amount: number;
  currency: string;
  startDate: string | null;
  endDate: string | null;
  spent: number;
};

export type ReconciliationData = {
  donationTotal: number;
  linkedIncomeTotal: number;
  expenseTotal: number;
  linkedExpenseTotal: number;
  unmatchedDonations: { id: string; date: string; amount: number; category: string }[];
  unmatchedExpenses: { id: string; date: string; amount: number; category: string }[];
};

export type AuditEntry = {
  id: string;
  action: string;
  resource: string;
  resourceId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  userName: string;
};

export type FinanceReport = {
  startDate: string;
  endDate: string;
  income: number;
  expenses: number;
  net: number;
  donationCount: number;
  expenseCount: number;
  incomeByCategory: { label: string; value: number }[];
  expensesByCategory: { label: string; value: number }[];
  monthly: { label: string; income: number; expenses: number }[];
};

function amount(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

function monthStart(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function dateValue(row: FinancialRow) {
  return row.donation_date ?? row.expense_date ?? row.transaction_date ?? "";
}

function monthKey(date: string) {
  return date.slice(0, 7);
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
}

export async function getFinanceOverview(): Promise<FinanceOverview> {
  const supabase = await createClient();
  const now = new Date();
  const currentMonth = monthStart(now);
  const trendStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));

  const [donationsRes, expensesRes, budgetsRes] = await Promise.all([
    supabase
      .from("donations")
      .select("id, amount, donation_type, donor_name, donation_date, currency")
      .order("donation_date", { ascending: false }),
    supabase
      .from("expenses")
      .select("id, amount, category, description, expense_date, currency")
      .order("expense_date", { ascending: false }),
    supabase.from("budgets").select("amount, start_date, end_date"),
  ]);

  if (donationsRes.error) throw new Error(`Unable to load donations: ${donationsRes.error.message}`);
  if (expensesRes.error) throw new Error(`Unable to load expenses: ${expensesRes.error.message}`);
  if (budgetsRes.error) throw new Error(`Unable to load budgets: ${budgetsRes.error.message}`);

  const donations = (donationsRes.data ?? []) as FinancialRow[];
  const expenses = (expensesRes.data ?? []) as FinancialRow[];
  const budgets = budgetsRes.data ?? [];

  const totalIncome = donations.reduce((sum, row) => sum + amount(row.amount), 0);
  const totalExpenses = expenses.reduce((sum, row) => sum + amount(row.amount), 0);
  const currentMonthKey = monthKey(currentMonth.toISOString());
  const currentMonthIncome = donations
    .filter((row) => monthKey(dateValue(row)) === currentMonthKey)
    .reduce((sum, row) => sum + amount(row.amount), 0);
  const currentMonthExpenses = expenses
    .filter((row) => monthKey(dateValue(row)) === currentMonthKey)
    .reduce((sum, row) => sum + amount(row.amount), 0);

  const activeBudget = budgets
    .filter((budget) => {
      const startsBeforeEnd = !budget.start_date || budget.start_date <= now.toISOString().slice(0, 10);
      const endsAfterStart = !budget.end_date || budget.end_date >= now.toISOString().slice(0, 10);
      return startsBeforeEnd && endsAfterStart;
    })
    .reduce((sum, budget) => sum + amount(budget.amount), 0);

  const incomeByCategory = Object.entries(
    donations.reduce<Record<string, number>>((totals, row) => {
      const key = row.donation_type ?? "Other";
      totals[key] = (totals[key] ?? 0) + amount(row.amount);
      return totals;
    }, {}),
  )
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const expenseByCategory = Object.entries(
    expenses.reduce<Record<string, number>>((totals, row) => {
      const key = row.category ?? "Other";
      totals[key] = (totals[key] ?? 0) + amount(row.amount);
      return totals;
    }, {}),
  )
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const monthlyTrend: FinanceMonth[] = [];
  for (let index = 0; index < 6; index += 1) {
    const date = new Date(Date.UTC(trendStart.getUTCFullYear(), trendStart.getUTCMonth() + index, 1));
    const key = monthKey(date.toISOString());
    monthlyTrend.push({
      label: monthLabel(date),
      income: donations
        .filter((row) => monthKey(dateValue(row)) === key)
        .reduce((sum, row) => sum + amount(row.amount), 0),
      expenses: expenses
        .filter((row) => monthKey(dateValue(row)) === key)
        .reduce((sum, row) => sum + amount(row.amount), 0),
    });
  }

  const activities: FinanceActivity[] = [
    ...donations.slice(0, 8).map((row) => ({
      id: `donation-${row.id}`,
      type: "income" as const,
      label: row.donation_type ?? "Income",
      description: row.donor_name || "Anonymous giving",
      amount: amount(row.amount),
      date: dateValue(row),
      currency: row.currency ?? "GHS",
    })),
    ...expenses.slice(0, 8).map((row) => ({
      id: `expense-${row.id}`,
      type: "expense" as const,
      label: row.category ?? "Expense",
      description: row.description || "Church expense",
      amount: amount(row.amount),
      date: dateValue(row),
      currency: row.currency ?? "GHS",
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  return {
    totalIncome,
    totalExpenses,
    currentMonthIncome,
    currentMonthExpenses,
    activeBudget,
    balance: totalIncome - totalExpenses,
    activities,
    incomeByCategory,
    expenseByCategory,
    monthlyTrend,
  };
}

export async function getIncomeRegister(): Promise<{
  entries: IncomeEntry[];
  members: FinanceMemberOption[];
}> {
  const supabase = await createClient();
  const [donationsRes, membersRes] = await Promise.all([
    supabase
      .from("donations")
      .select("id, donor_name, member_id, donation_type, amount, currency, payment_method, transaction_ref, donation_date, notes")
      .order("donation_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(100),
    supabase.from("members").select("id, first_name, last_name").order("last_name").order("first_name"),
  ]);

  if (donationsRes.error) throw new Error(`Unable to load income entries: ${donationsRes.error.message}`);
  if (membersRes.error) throw new Error(`Unable to load members: ${membersRes.error.message}`);

  return {
    entries: ((donationsRes.data ?? []) as FinancialRow[]).map((entry) => ({
      id: entry.id,
      donorName: entry.donor_name || "Anonymous giving",
      memberId: entry.member_id ?? null,
      donationType: entry.donation_type ?? "donation",
      amount: amount(entry.amount),
      currency: entry.currency ?? "GHS",
      paymentMethod: entry.payment_method ?? null,
      transactionRef: entry.transaction_ref ?? null,
      donationDate: entry.donation_date ?? "",
      notes: entry.notes ?? null,
    })),
    members: (membersRes.data ?? []).map((member) => ({
      id: member.id,
      name: `${member.first_name} ${member.last_name}`,
    })),
  };
}

export async function getExpenseRegister(): Promise<ExpenseEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("expenses")
    .select("id, category, description, amount, currency, expense_date, approval_status, rejection_reason, requested_by, approved_by")
    .order("expense_date", { ascending: false })
    .limit(100);

  if (error) {
    if (error.message.includes("approval_status") || error.message.includes("requested_by")) {
      throw new Error("Expense approvals are not enabled in the database. Apply supabase/migrations/0008_expense_approvals.sql, then reload this page.");
    }
    throw new Error(`Unable to load expenses: ${error.message}`);
  }
  const rows = data ?? [];
  const profileIds = rows.flatMap((row) => [row.requested_by, row.approved_by]).filter(Boolean) as string[];
  const { data: profiles, error: profilesError } = profileIds.length
    ? await supabase.from("profiles").select("id, first_name, last_name").in("id", [...new Set(profileIds)])
    : { data: [], error: null };
  if (profilesError) throw new Error(`Unable to load expense reviewers: ${profilesError.message}`);

  const names = new Map((profiles ?? []).map((profile) => [profile.id, `${profile.first_name} ${profile.last_name}`]));
  return rows.map((row) => ({
    id: row.id,
    category: row.category,
    description: row.description,
    amount: amount(row.amount),
    expenseDate: row.expense_date,
    currency: row.currency ?? "GHS",
    approvalStatus: row.approval_status ?? (row.approved_by ? "approved" : "pending"),
    rejectionReason: row.rejection_reason,
    requesterName: names.get(row.requested_by) ?? "Finance team",
    approverName: row.approved_by ? names.get(row.approved_by) ?? "Reviewer" : null,
  }));
}

export async function getBudgetRegister(): Promise<BudgetEntry[]> {
  const supabase = await createClient();
  const [budgetsRes, expensesRes] = await Promise.all([
    supabase.from("budgets").select("id, name, category, amount, currency, start_date, end_date").order("start_date", { ascending: false }),
    supabase.from("expenses").select("category, amount, expense_date, approval_status, approved_by"),
  ]);
  if (budgetsRes.error) throw new Error(`Unable to load budgets: ${budgetsRes.error.message}`);
  if (expensesRes.error) throw new Error(`Unable to calculate budget usage: ${expensesRes.error.message}`);

  return (budgetsRes.data ?? []).map((budget) => ({
    id: budget.id,
    name: budget.name,
    category: budget.category,
    amount: amount(budget.amount),
    currency: budget.currency ?? "GHS",
    startDate: budget.start_date,
    endDate: budget.end_date,
    spent: (expensesRes.data ?? [])
      .filter((expense) => {
        const inDateRange = (!budget.start_date || expense.expense_date >= budget.start_date)
          && (!budget.end_date || expense.expense_date <= budget.end_date);
        const sameCategory = !budget.category || expense.category === budget.category;
        return expense.approval_status === "approved" || (!expense.approval_status && expense.approved_by)
          ? inDateRange && sameCategory
          : false;
      })
      .reduce((sum, expense) => sum + amount(expense.amount), 0),
  }));
}

export async function getReconciliationData(): Promise<ReconciliationData> {
  const supabase = await createClient();
  const [donationsRes, expensesRes, transactionsRes] = await Promise.all([
    supabase.from("donations").select("id, donation_type, amount, donation_date"),
    supabase.from("expenses").select("id, category, amount, expense_date, approval_status, approved_by"),
    supabase.from("transactions").select("id, transaction_type, category, amount, transaction_date, related_donation_id"),
  ]);
  if (donationsRes.error) throw new Error(`Unable to load donations for reconciliation: ${donationsRes.error.message}`);
  if (expensesRes.error) throw new Error(`Unable to load expenses for reconciliation: ${expensesRes.error.message}`);
  if (transactionsRes.error) throw new Error(`Unable to load transactions for reconciliation: ${transactionsRes.error.message}`);

  const donations = donationsRes.data ?? [];
  const expenses = (expensesRes.data ?? []).filter((expense) =>
    expense.approval_status === "approved" || (!expense.approval_status && expense.approved_by),
  );
  const transactions = transactionsRes.data ?? [];
  const linkedDonationIds = new Set(transactions.filter((row) => row.transaction_type === "income" && row.related_donation_id).map((row) => row.related_donation_id));
  const linkedExpenseKeys = new Set(transactions.filter((row) => row.transaction_type === "expense").map((row) => `${row.transaction_date}|${row.category}|${Number(row.amount)}`));

  return {
    donationTotal: donations.reduce((sum, row) => sum + amount(row.amount), 0),
    linkedIncomeTotal: transactions.filter((row) => row.transaction_type === "income").reduce((sum, row) => sum + amount(row.amount), 0),
    expenseTotal: expenses.reduce((sum, row) => sum + amount(row.amount), 0),
    linkedExpenseTotal: transactions.filter((row) => row.transaction_type === "expense").reduce((sum, row) => sum + amount(row.amount), 0),
    unmatchedDonations: donations.filter((row) => !linkedDonationIds.has(row.id)).slice(0, 20).map((row) => ({
      id: row.id,
      date: row.donation_date,
      amount: amount(row.amount),
      category: row.donation_type,
    })),
    unmatchedExpenses: expenses.filter((row) => !linkedExpenseKeys.has(`${row.expense_date}|${row.category}|${Number(row.amount)}`)).slice(0, 20).map((row) => ({
      id: row.id,
      date: row.expense_date,
      amount: amount(row.amount),
      category: row.category,
    })),
  };
}

export async function getAuditEntries(filters?: { action?: string; resource?: string; search?: string; from?: string; to?: string }): Promise<AuditEntry[]> {
  const supabase = await createClient();
  let query = supabase
    .from("audit_logs")
    .select("id, action, resource, resource_id, metadata, created_at, user_id")
    .order("created_at", { ascending: false });
  if (filters?.action && filters.action !== "all") query = query.eq("action", filters.action);
  if (filters?.resource && filters.resource !== "all") query = query.eq("resource", filters.resource);
  if (filters?.from) query = query.gte("created_at", `${filters.from}T00:00:00.000Z`);
  if (filters?.to) query = query.lte("created_at", `${filters.to}T23:59:59.999Z`);
  if (filters?.search) query = query.or(`resource.ilike.%${filters.search}%,resource_id.ilike.%${filters.search}%`);
  const { data, error } = await query.limit(200);
  if (error) throw new Error(`Unable to load audit logs: ${error.message}`);

  const userIds = [...new Set((data ?? []).map((row) => row.user_id).filter(Boolean))] as string[];
  const { data: profiles, error: profilesError } = userIds.length
    ? await supabase.from("profiles").select("user_id, first_name, last_name").in("user_id", userIds)
    : { data: [], error: null };
  if (profilesError) throw new Error(`Unable to load audit users: ${profilesError.message}`);
  const names = new Map((profiles ?? []).map((profile) => [profile.user_id, `${profile.first_name} ${profile.last_name}`]));

  return (data ?? []).map((row) => ({
    id: row.id,
    action: row.action,
    resource: row.resource,
    resourceId: row.resource_id,
    metadata: row.metadata as Record<string, unknown> | null,
    createdAt: row.created_at,
    userName: row.user_id ? names.get(row.user_id) ?? "Unknown user" : "System",
  }));
}

export async function getFinanceReport(startDate?: string, endDate?: string): Promise<FinanceReport> {
  const now = new Date();
  const start = /^\d{4}-\d{2}-\d{2}$/.test(startDate ?? "") ? startDate! : `${now.getUTCFullYear()}-01-01`;
  const end = /^\d{4}-\d{2}-\d{2}$/.test(endDate ?? "") ? endDate! : now.toISOString().slice(0, 10);
  const supabase = await createClient();
  const [donationsRes, expensesRes] = await Promise.all([
    supabase.from("donations").select("amount, donation_type, donation_date").gte("donation_date", start).lte("donation_date", end),
    supabase.from("expenses").select("amount, category, expense_date, approved_by").gte("expense_date", start).lte("expense_date", end),
  ]);
  if (donationsRes.error) throw new Error(`Unable to load report income: ${donationsRes.error.message}`);
  if (expensesRes.error) throw new Error(`Unable to load report expenses: ${expensesRes.error.message}`);

  const donations = donationsRes.data ?? [];
  const expenses = (expensesRes.data ?? []).filter((row) => row.approved_by);
  const group = (rows: { amount: number | string; key: string }[]) => Object.entries(rows.reduce<Record<string, number>>((totals, row) => {
    totals[row.key] = (totals[row.key] ?? 0) + amount(row.amount);
    return totals;
  }, {})).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  const income = donations.reduce((sum, row) => sum + amount(row.amount), 0);
  const expenseTotal = expenses.reduce((sum, row) => sum + amount(row.amount), 0);
  const monthMap = new Map<string, { income: number; expenses: number }>();
  const startMonth = new Date(`${start}T00:00:00Z`);
  const endMonth = new Date(`${end}T00:00:00Z`);
  for (const cursor = new Date(Date.UTC(startMonth.getUTCFullYear(), startMonth.getUTCMonth(), 1)); cursor <= endMonth; cursor.setUTCMonth(cursor.getUTCMonth() + 1)) {
    const key = cursor.toISOString().slice(0, 7);
    monthMap.set(key, { income: 0, expenses: 0 });
  }
  donations.forEach((row) => {
    const bucket = monthMap.get(row.donation_date.slice(0, 7));
    if (bucket) bucket.income += amount(row.amount);
  });
  expenses.forEach((row) => {
    const bucket = monthMap.get(row.expense_date.slice(0, 7));
    if (bucket) bucket.expenses += amount(row.amount);
  });

  return {
    startDate: start,
    endDate: end,
    income,
    expenses: expenseTotal,
    net: income - expenseTotal,
    donationCount: donations.length,
    expenseCount: expenses.length,
    incomeByCategory: group(donations.map((row) => ({ amount: row.amount, key: row.donation_type }))),
    expensesByCategory: group(expenses.map((row) => ({ amount: row.amount, key: row.category }))),
    monthly: [...monthMap.entries()].map(([key, values]) => ({
      label: new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${key}-01T00:00:00Z`)),
      ...values,
    })),
  };
}
