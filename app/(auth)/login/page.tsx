import { Suspense } from "react";
import { getActiveHeroImages } from "@/lib/queries/hero-images";
import { LoginForm } from "@/components/auth/login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const heroImages = await getActiveHeroImages();
  const backgroundImage = heroImages[0]?.image_url;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12">
      {backgroundImage && (
        <div
          aria-hidden="true"
          className="absolute inset-0 scale-105 bg-cover bg-center blur-sm"
          style={{ backgroundImage: `url("${backgroundImage}")` }}
        />
      )}
      <div aria-hidden="true" className="absolute inset-0 bg-slate-950/65" />
      <Suspense fallback={<div className="relative z-10 text-sm text-white/70">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
