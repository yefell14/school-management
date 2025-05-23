"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  BarChart,
  Calendar,
  ChevronLeft,
  ClipboardCheck,
  FileText,
  Home,
  LogOut,
  Menu,
  QrCode,
  Settings,
  User,
  X,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getSupabaseBrowser } from "@/lib/supabase-browser"
import { cn } from "@/lib/utils"

interface AuxiliarData {
  id: string
  nombre: string
  apellidos: string
}

const navItems = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/dashboard/auxiliar",
  },
  {
    label: "Registrar Asistencia",
    icon: QrCode,
    href: "/dashboard/auxiliar/asistencia",
  },
  {
    label: "Ver Asistencias",
    icon: ClipboardCheck,
    href: "/dashboard/auxiliar/asistencias",
  },
  {
    label: "Reportes",
    icon: FileText,
    href: "/dashboard/auxiliar/reportes",
  },
  {
    label: "Calendario",
    icon: Calendar,
    href: "/dashboard/auxiliar/calendario",
  },
  {
    label: "Estadísticas",
    icon: BarChart,
    href: "/dashboard/auxiliar/estadisticas",
  },
  {
    label: "Mi Perfil",
    icon: User,
    href: "/dashboard/auxiliar/perfil",
  },
  {
    label: "Configuración",
    icon: Settings,
    href: "/dashboard/auxiliar/configuracion",
  },
]

export default function AuxiliarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [auxiliar, setAuxiliar] = useState<AuxiliarData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = getSupabaseBrowser()

  useEffect(() => {
    async function getAuxiliarData() {
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

        if (userData.rol !== 'auxiliar') {
          throw new Error("No tienes permisos para acceder a esta sección")
        }

        setAuxiliar(userData)
      } catch (error: any) {
        console.error("Error en getAuxiliarData:", error)
        setError(error.message || "Error al obtener datos del usuario")
      } finally {
        setLoading(false)
      }
    }

    getAuxiliarData()
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
            <h1 className="text-xl font-bold">Panel Auxiliar</h1>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-blue-700 dark:hover:bg-blue-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {auxiliar && (
            <div className="p-4 border-b border-blue-700 dark:border-blue-900">
              <p className="text-lg font-medium truncate">{`${auxiliar.nombre} ${auxiliar.apellidos}`}</p>
              <p className="text-sm text-blue-200">Auxiliar</p>
            </div>
          )}

          <nav className="flex-1 overflow-y-auto">
            <ul className="p-2 space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-md transition-colors",
                      pathname === item.href ||
                      (item.href !== "/dashboard/auxiliar" && pathname?.startsWith(item.href))
                        ? "bg-blue-700 dark:bg-blue-900 text-white"
                        : "text-blue-100 hover:bg-blue-700 dark:hover:bg-blue-900"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
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
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
