import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Debug para ver si la petición llega al servidor
  // console.log(`[Middleware] ${request.method} ${request.nextUrl.pathname}`)

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { 
    data: { user }, 
  } = await supabase.auth.getUser()

  // Rutas protegidas (Dashboard, Práctica, Perfil, etc.)
  const isProtectedRoute = 
    request.nextUrl.pathname.startsWith('/estudio') ||
    request.nextUrl.pathname.startsWith('/practica') ||
    request.nextUrl.pathname.startsWith('/inicio') ||
    request.nextUrl.pathname.startsWith('/perfil')

  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si el usuario ya está logueado y va al login o registro, redirigir al dashboard
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/registro')) {
    return NextResponse.redirect(new URL('/estudio', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
