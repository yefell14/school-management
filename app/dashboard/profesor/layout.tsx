"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { BookOpen, Calendar, MessageSquare, User, Settings, LogOut, Menu, X, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Providers } from "./providers"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface TeacherData {
  id: string
  nombre: string
  apellidos: string
}

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const [teacher, setTeacher] = useState<TeacherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function getTeacherData() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          console.log("No hay sesión activa, redirigiendo a login...")
          router.push("/auth/login")
          return
        }

        console.log("Sesión activa, obteniendo datos del profesor. User ID:", session.user.id)

        // Primero verificamos si el usuario existe en la tabla usuarios
        const { data: userData, error: userError } = await supabase
          .from("usuarios")
          .select("id, nombre, apellidos, rol, email")
          .eq("id", session.user.id)

        if (userError) {
          console.error("Error al consultar la tabla usuarios:", userError)
          throw new Error(`Error al obtener datos: ${userError.message}`)
        }

        // Si no encontramos el usuario por ID, intentamos buscarlo por email
        if (!userData || userData.length === 0) {
          console.log("No se encontró usuario con ese ID, buscando por email...")

          const { data: userByEmail, error: emailError } = await supabase
            .from("usuarios")
            .select("id, nombre, apellidos, rol, email")
            .eq("email", session.user.email)

          if (emailError) {
            console.error("Error al buscar por email:", emailError)
            throw new Error(`Error al buscar por email: ${emailError.message}`)
          }

          if (!userByEmail || userByEmail.length === 0) {
            throw new Error("No se encontró ningún usuario asociado a esta cuenta")
          }

          // Si encontramos múltiples usuarios con el mismo email, tomamos el primero
          const user = userByEmail[0]

          if (user.rol !== "profesor") {
            throw new Error(`Acceso no autorizado. El rol del usuario es ${user.rol}, se requiere rol 'profesor'`)
          }

          console.log("Usuario encontrado por email:", user)
          setTeacher(user)
          return
        }

        // Si encontramos múltiples usuarios con el mismo ID (no debería ocurrir), tomamos el primero
        const user = userData[0]

        if (user.rol !== "profesor") {
          throw new Error(`Acceso no autorizado. El rol del usuario es ${user.rol}, se requiere rol 'profesor'`)
        }

        console.log("Datos del profesor obtenidos correctamente:", user)
        setTeacher(user)
      } catch (error: any) {
        console.error("Error en getTeacherData:", error)
        setError(error.message || "Error al obtener datos del usuario")
        // No redirigimos automáticamente para mostrar el mensaje de error
      } finally {
        setLoading(false)
      }
    }

    getTeacherData()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Si hay un error, mostramos un mensaje con opción de cerrar sesión
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

  const navItems = [
    { href: "/dashboard/profesor", label: "Mis Cursos", icon: <BookOpen className="h-5 w-5" /> },
    { href: "/dashboard/profesor/horario", label: "Horario", icon: <Calendar className="h-5 w-5" /> },
    { href: "/dashboard/profesor/mensajes", label: "Mensajes", icon: <MessageSquare className="h-5 w-5" /> },
    { href: "/dashboard/profesor/perfil", label: "Mi Perfil", icon: <User className="h-5 w-5" /> },
    { href: "/dashboard/profesor/configuracion", label: "Configuración", icon: <Settings className="h-5 w-5" /> },
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

            {teacher && (
              <div className="p-4 border-b border-blue-700 dark:border-blue-900">
                <p className="text-lg font-medium truncate">{`${teacher.nombre} ${teacher.apellidos}`}</p>
                <p className="text-sm text-blue-200">Profesor</p>
              </div>
            )}

            <nav className="flex-1 overflow-y-auto">
              <ul className="p-2 space-y-1">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                        pathname === item.href ||
                        (item.href !== "/dashboard/profesor" && pathname?.startsWith(item.href))
                          ? "bg-blue-700 dark:bg-blue-900 text-white"
                          : "text-blue-100 hover:bg-blue-700 dark:hover:bg-blue-900"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
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
          <header className="bg-yellow-400 dark:bg-yellow-600 shadow-md z-10">
            <div className="flex items-center justify-between p-4">
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                {teacher ? `${teacher.nombre} ${teacher.apellidos}` : "Cargando..."}
              </h1>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Button variant="ghost" size="icon" className="text-gray-800 dark:text-white">
                    <MessageSquare className="h-5 w-5" />
                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                      3
                    </span>
                  </Button>
                </div>
                <Button variant="ghost" size="icon" className="text-gray-800 dark:text-white">
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800 p-4">{children}</main>
        </div>
      </div>
    </Providers>
  )
}
