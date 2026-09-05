"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/actions/auth";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await login(formData);
    if (result?.error) setError(result.error);
  }

  return (
    <div className="relative z-10 w-full max-w-md">
      <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/95 shadow-2xl backdrop-blur-xl">
        <div className="px-6 pb-8 pt-8 sm:px-9">
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-2 shadow-lg ring-1 ring-primary/15">
              <img src="/Agape%20logo.png" alt="Agape Word Chapel logo" className="h-full w-full object-contain" />
            </div>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-primary">Welcome back</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Sign in to Agape</h1>
            <p className="mt-2 text-sm text-slate-500">Access your church management platform</p>
          </div>

          <form action={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">Email address</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input id="email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" className="h-11 border-slate-200 bg-white pl-10 text-slate-900 shadow-none focus-visible:border-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-700">Password</Label>
                <Link href="/reset-password" className="text-xs font-medium text-primary hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input id="password" name="password" type={showPassword ? "text" : "password"} required autoComplete="current-password" className="h-11 border-slate-200 bg-white pl-10 pr-11 text-slate-900 shadow-none focus-visible:border-primary" />
                <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            <Button type="submit" className="h-11 w-full rounded-lg text-sm font-semibold shadow-md shadow-primary/20">Sign in to your account</Button>
            <input type="hidden" name="next" value={next} />
          </form>
        </div>
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 text-center text-xs text-slate-500 sm:px-9">Agape Word Chapel International</div>
      </div>
    </div>
  );
}
