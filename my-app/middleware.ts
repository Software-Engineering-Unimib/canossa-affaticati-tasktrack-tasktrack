/**
 * @fileoverview Middleware Next.js per la protezione delle route.
 *
 * Gestisce:
 * - Redirect utenti non autenticati da route protette → login
 * - Redirect utenti autenticati da route auth → dashboard
 *
 * @module middleware
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Route che richiedono autenticazione.
 */
const PROTECTED_ROUTES = [
    '/dashboard',
    '/board',
    '/categories',
    '/priorities',
    '/profile',
] as const;

/**
 * Route di autenticazione (login/register).
 * Gli utenti già autenticati vengono reindirizzati.
 */
const AUTH_ROUTES = ['/login', '/register'] as const;

/**
 * Route di default post-login.
 */
const DEFAULT_AUTHENTICATED_ROUTE = '/dashboard';

/**
 * Route di default per utenti non autenticati.
 */
const DEFAULT_UNAUTHENTICATED_ROUTE = '/login';

/**
 * Verifica se un path corrisponde a una route protetta.
 */
function isProtectedRoute(path: string): boolean {
    return PROTECTED_ROUTES.some(route => path.startsWith(route));
}

/**
 * Verifica se un path è una route di autenticazione.
 */
function isAuthRoute(path: string): boolean {
    return AUTH_ROUTES.some(route => path === route);
}

/**
 * Crea un client Supabase configurato per il middleware.
 * Gestisce la lettura/scrittura dei cookie di sessione.
 */
function createMiddlewareSupabaseClient(request: NextRequest, response: NextResponse) {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({ name, value, ...options });
                    response.cookies.set({ name, value, ...options });
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({ name, value: '', ...options });
                    response.cookies.set({ name, value: '', ...options });
                },
            },
        }
    );
}

/**
 * Middleware principale.
 * Eseguito per ogni richiesta che matcha la configurazione.
 */
export async function middleware(request: NextRequest) {
    // Inizializza response
    let response = NextResponse.next({
        request: { headers: request.headers },
    });

    // Crea client Supabase
    const supabase = createMiddlewareSupabaseClient(request, response);

    // Verifica autenticazione
    const { data: { user } } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;

    // Redirect: utente non autenticato su route protetta
    if (!user && isProtectedRoute(path)) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = DEFAULT_UNAUTHENTICATED_ROUTE;
        return NextResponse.redirect(redirectUrl);
    }

    // Redirect: utente autenticato su route auth
    if (user && isAuthRoute(path)) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = DEFAULT_AUTHENTICATED_ROUTE;
        return NextResponse.redirect(redirectUrl);
    }

    return response;
}

/**
 * Configurazione del matcher.
 * Esclude risorse statiche e ottimizzazioni Next.js.
 */
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};