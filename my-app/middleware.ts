import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // 1. Inizializziamo la risposta (necessaria per manipolare i cookie)
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // 2. Creiamo un client Supabase temporaneo per il middleware
    // Questo serve a controllare se esiste una sessione valida nei cookie
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    // 3. Verifichiamo l'utente
    // getUser è più sicuro di getSession per il server-side
    const { data: { user } } = await supabase.auth.getUser()

    // 4. Definiamo i percorsi e la logica di protezione
    const url = request.nextUrl.clone()
    const path = url.pathname

    // Definiamo le rotte protette (tutto ciò che sta dentro workspace o rotte specifiche)
    const isProtectedRoute =
        path.startsWith('/dashboard') ||
        path.startsWith('/board') ||
        path.startsWith('/categories') ||
        path.startsWith('/priorities') ||
        path.startsWith('/profile'); // Aggiungi altre rotte se necessario

    // Definiamo le rotte di autenticazione (dove non deve stare se è già loggato)
    const isAuthRoute = path === '/login' || path === '/register';

    // CASO A: Utente NON loggato cerca di accedere a rotte protette
    if (!user && isProtectedRoute) {
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // CASO B: Utente LOGGATO cerca di accedere a login/register
    if (user && isAuthRoute) {
        url.pathname = '/dashboard' // O dove preferisci mandarlo
        return NextResponse.redirect(url)
    }

    // Se tutto è ok, prosegui
    return response
}

// 5. Configurazione del Matcher
// Specifica su quali percorsi il middleware deve attivarsi
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files (images, etc)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}