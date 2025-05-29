import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })
  const { data: { session } } = await supabase.auth.getSession()

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/nosotros', '/precios', '/libro-reclamaciones', '/login', '/registro', '/recuperar-contrasena']
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname)

  // If trying to access a public route while logged in, redirect to appropriate dashboard
  if (session && request.nextUrl.pathname === '/login') {
    const { data: userData } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', session.user.id)
      .single()

    if (userData) {
      switch (userData.rol) {
        case 'admin':
          return NextResponse.redirect(new URL('/dashboard/admin', request.url))
        case 'profesor':
          return NextResponse.redirect(new URL('/dashboard/profesor', request.url))
        case 'alumno':
          return NextResponse.redirect(new URL('/dashboard/alumno', request.url))
        case 'auxiliar':
          return NextResponse.redirect(new URL('/dashboard/auxiliar', request.url))
      }
    }
  }

  // If trying to access a protected route without being logged in
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Handle external API endpoints and student routes
  if (
    request.nextUrl.pathname.startsWith('/site_integration') || 
    request.nextUrl.pathname.startsWith('/writing') ||
    request.nextUrl.pathname.startsWith('/dashboard/alumno')
  ) {
    // Para endpoints externos (/writing y /site_integration), permitir acceso sin sesión
    if (request.nextUrl.pathname.startsWith('/writing') || request.nextUrl.pathname.startsWith('/site_integration')) {
      // Permitir acceso a estos endpoints sin verificación de sesión
      return res
    }

    // Para rutas de dashboard/alumno, mantener la verificación de sesión
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'No autorizado', code: 401 }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Verificar permisos específicos para rutas de dashboard
    const { data: userData } = await supabase
      .from('usuarios')
      .select('rol, activo')
      .eq('id', session.user.id)
      .single()

    if (!userData || !userData.activo) {
      return new NextResponse(
        JSON.stringify({ error: 'Usuario inactivo o no encontrado', code: 403 }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Para rutas de alumnos, verificar que el usuario sea alumno
    if (request.nextUrl.pathname.startsWith('/dashboard/alumno') && userData.rol !== 'alumno') {
      return new NextResponse(
        JSON.stringify({ error: 'No tiene permisos para acceder a esta sección', code: 403 }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return res
  }

  return res
}

// Specify which routes this middleware should run for
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - images folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public|assets|images).*)',
  ],
}
