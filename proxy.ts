import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getIsAdminUser } from '@/lib/admin/server';

export async function proxy(request: NextRequest) {
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
  const isAdmin = await getIsAdminUser(supabase, user?.id);

  if (user) {
    if (isLoginPage) {
      if (isAdmin) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      return response;
    }

    if (isResetPage && !hasRecoveryCode) {
      return NextResponse.redirect(new URL(isAdmin ? '/dashboard' : '/', request.url));
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

  if (user && !isAdmin && isDashboardPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/login',
    '/auth/reset-password',
  ],
};
