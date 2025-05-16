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
  Calendar,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getSupabaseBrowser } from "@/lib/supabase-browser"
import { Providers } from "./providers"

interface TeacherData {
  id: string
  nombre: string
  apellidos: string
  email: string
  rol: string
}

export default function ProfesorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [profesor, setProfesor] = useState<TeacherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = getSupabaseBrowser()

  useEffect(() => {
    const getTeacherData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          console.log("No hay sesión activa, redirigiendo a login...")
          router.push("/login")
          return
        }

        const { data: userData, error: userError } = await supabase
          .from("usuarios")
          .select("id, nombre, apellidos, email, rol")
          .eq("id", session.user.id)
          .single()

        if (userError) throw userError

        setProfesor(userData)
      } catch (error: any) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    getTeacherData()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (loading) {
    return <div>Cargando...</div>
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  const navItems = [
    { href: "/dashboard/profesor", label: "Mis Cursos", icon: <BookOpen className="h-5 w-5" /> },
    { href: "/dashboard/profesor/horario", label: "Horario", icon: <Calendar className="h-5 w-5" /> },
    { href: "/dashboard/profesor/mensajes", label: "Mensajes", icon: <MessageSquare className="h-5 w-5" /> },
    { href: "/dashboard/profesor/perfil", label: "Mi Perfil", icon: <User className="h-5 w-5" /> },
  ]

  return (
    <Providers>
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
              <h1 className="text-xl font-bold">Panel Docente</h1>
            </div>

            {profesor && (
              <div className="p-4 border-b border-blue-700 dark:border-blue-900">
                <div className="flex items-center space-x-3">
                  <User className="h-8 w-8" />
                  <div>
                    <p className="font-medium">{`${profesor.nombre} ${profesor.apellidos}`}</p>
                    <p className="text-sm text-blue-200">{profesor.email}</p>
                  </div>
                </div>
              </div>
            )}

            <nav className="flex-1 overflow-y-auto">
              <ul className="p-2">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                        pathname === item.href
                          ? "bg-blue-700 dark:bg-blue-900"
                          : "hover:bg-blue-700 dark:hover:bg-blue-900"
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="p-4 border-t border-blue-700 dark:border-blue-900">
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-blue-700 dark:hover:bg-blue-900"
                onClick={handleLogout}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Orange header */}
          <header className="bg-orange-500 dark:bg-orange-600 text-white p-4">
            <h1 className="text-2xl font-bold">María de los Ángeles</h1>
          </header>

          {/* Content area */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900">
            <div className="container mx-auto px-6 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </Providers>
  )
}
