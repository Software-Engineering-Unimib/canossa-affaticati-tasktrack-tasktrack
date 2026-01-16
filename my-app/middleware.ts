import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Recupera l'utente da Supabase controllando il token
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Definisci le route protette e quelle pubbliche
    const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/auth')

    // Se l'utente NON è loggato e sta cercando di accedere a una pagina che NON è di login
    // (escludi file statici, immagini, api, ecc.)
    if (!user && !isAuthPage && !request.nextUrl.pathname.match(/\.(.*)$/)) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Se l'utente è GIÀ loggato e prova ad andare al login, mandalo alla dashboard
    if (user && isAuthPage) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return response
}

export const config = {
    // Specifica su quali percorsi deve girare il middleware
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - api (API routes, se vuoi proteggere anche le API rimuovi questa riga)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}