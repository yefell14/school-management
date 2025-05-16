"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  Users,
  GraduationCap,
  BookOpen,
  Clock,
  QrCode,
  Settings,
  Layers,
  User,
  LogOut,
  Menu,
  X,
  AlertTriangle,
  MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getSupabaseBrowser } from "@/lib/supabase-browser"

interface AdminData {
  id: string
  nombre: string
  apellidos: string
}

const navigationItems = [
  { name: "Usuarios", href: "/dashboard/admin/usuarios", icon: Users },
  { name: "Grados", href: "/dashboard/admin/grados", icon: GraduationCap },
  { name: "Secciones", href: "/dashboard/admin/secciones", icon: Layers },
  { name: "Cursos", href: "/dashboard/admin/cursos", icon: BookOpen },
  { name: "Grupos", href: "/dashboard/admin/grupos", icon: Users },
  { name: "Horarios", href: "/dashboard/admin/horarios", icon: Clock },
  { name: "Escáner QR", href: "/dashboard/admin/escaner-qr", icon: QrCode },
  { name: "Mi Perfil", href: "/dashboard/admin/perfil", icon: User },
  { name: "Configuración", href: "/dashboard/admin/configuracion", icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [admin, setAdmin] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = getSupabaseBrowser()

  useEffect(() => {
    async function getAdminData() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          console.log("No hay sesión activa, redirigiendo a login...")
          router.push("/login")
          return
        }

        const { data: userData, error: userError } = await supabase
          .from("usuarios")
          .select("id, nombre, apellidos, rol")
          .eq("id", session.user.id)
          .single()

        if (userError) throw userError

        setAdmin(userData)
      } catch (error: any) {
        console.error("Error en getAdminData:", error)
        setError(error.message || "Error al obtener datos del usuario")
      } finally {
        setLoading(false)
      }
    }

    getAdminData()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error de acceso</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex gap-4">
          <Button onClick={handleLogout}>Cerrar sesión</Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 z-40 p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-700"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition duration-200 ease-in-out lg:relative lg:flex z-30 w-64 bg-blue-600 dark:bg-blue-800 text-white`}
      >
        <div className="flex flex-col w-full">
          <div className="flex items-center justify-between p-4 border-b border-blue-700 dark:border-blue-900">
            <h1 className="text-xl font-bold">Panel</h1>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-blue-700 dark:hover:bg-blue-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {admin && (
            <div className="p-4 border-b border-blue-700 dark:border-blue-900">
              <p className="text-lg font-medium truncate">{`${admin.nombre} ${admin.apellidos}`}</p>
              <p className="text-sm text-blue-200">Administrador</p>
            </div>
          )}

          <nav className="flex-1 overflow-y-auto">
            <ul className="p-2 space-y-1">
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-md transition-colors",
                      pathname === item.href ||
                      (item.href !== "/dashboard/admin" && pathname?.startsWith(item.href))
                        ? "bg-blue-700 dark:bg-blue-900 text-white"
                        : "text-blue-100 hover:bg-blue-700 dark:hover:bg-blue-900"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t border-blue-700 dark:border-blue-900">
            <Button
              variant="ghost"
              className="w-full justify-start text-blue-100 hover:bg-blue-700 dark:hover:bg-blue-900 hover:text-white"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-orange-500 dark:bg-orange-600 shadow-md z-10">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-bold text-white">
              María de los Ángeles - Gestión Administrativa
            </h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Button variant="ghost" size="icon" className="text-white">
                  <MessageSquare className="h-5 w-5" />
                  <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                    2
                  </span>
                </Button>
              </div>
              <Link href="/dashboard/admin/perfil">
                <Button variant="ghost" size="icon" className="text-white">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800 p-4">
          {children}
        </main>
      </div>
    </div>
  )
} 