import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isLoginPage = request.nextUrl.pathname === '/auth/login';
  const isDashboardPage = request.nextUrl.pathname === '/dashboard'; 
  const isResetPage = request.nextUrl.pathname === '/auth/reset-password';
  const hasRecoveryCode = request.nextUrl.searchParams.has('code');

  if (user) {
    if (isLoginPage || (isResetPage && !hasRecoveryCode)) {
      return NextResponse.redirect(new URL('/dashboard', request.url)); 
    }
  }

  if (!user) {
    if (isDashboardPage) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    if (isResetPage && !hasRecoveryCode) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};