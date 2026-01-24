import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
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
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    // ═══════════════════════════════════════════════════════════
    // REDIRECT PAGINA INIZIALE (localhost:3000 o /)
    // ═══════════════════════════════════════════════════════════

    if (pathname === '/') {
        // Se l'utente è loggato, vai alla dashboard
        if (user) {
            const url = request.nextUrl.clone();
            url.pathname = '/dashboard';
            return NextResponse.redirect(url);
        }
        // Se non è loggato, vai al login
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    // ═══════════════════════════════════════════════════════════
    // PROTEZIONE ROUTE WORKSPACE
    // ═══════════════════════════════════════════════════════════

    // Se l'utente non è loggato e prova ad accedere a route protette
    if (!user && pathname.startsWith('/dashboard')) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    if (!user && pathname.startsWith('/board')) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    if (!user && pathname.startsWith('/categories')) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    if (!user && pathname.startsWith('/priorities')) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    // ═══════════════════════════════════════════════════════════
    // REDIRECT SE GIÀ LOGGATO
    // ═══════════════════════════════════════════════════════════

    // Se l'utente è già loggato e prova ad accedere al login
    if (user && pathname === '/login') {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        '/',
        '/login',
        '/dashboard/:path*',
        '/board/:path*',
        '/categories/:path*',
        '/priorities/:path*',
    ],
};