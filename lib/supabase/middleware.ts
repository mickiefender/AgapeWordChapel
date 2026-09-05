import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_ROUTES = ["/login", "/register", "/reset-password"];
const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/leadership",
  "/ministries",
  "/events",
  "/sermons",
  "/giving",
  "/contact",
  "/prayer",
  "/visit",
];
const PROTECTED_PREFIX = "/dashboard";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r)) || pathname.startsWith("/auth");
  const isPublicRoute = PUBLIC_ROUTES.some(
    (r) => pathname === r || (r !== "/" && pathname.startsWith(r)),
  );
  const isProtected = pathname.startsWith(PROTECTED_PREFIX);

  // Not logged in, accessing a protected area -> redirect to login
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Logged in, accessing an auth route -> redirect to dashboard
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Logged in, accessing root -> go to dashboard (member portal experience)
  if (user && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Not logged in accessing public/auth routes -> allow through
  if (!user && (isPublicRoute || isAuthRoute)) {
    return supabaseResponse;
  }

  return supabaseResponse;
}
