"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookOpen, Calendar, MessageSquare, User, Settings, LogOut, Menu, X, CheckSquare, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AlumnoLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const navigation = [
    { name: "Mis Cursos", href: "/alumno/cursos", icon: BookOpen },
    { name: "Horario", href: "/alumno/horario", icon: Calendar },
    { name: "Mensajes", href: "/alumno/mensajes", icon: MessageSquare },
    { name: "Asistencia", href: "/alumno/asistencia", icon: CheckSquare },
    { name: "Tareas", href: "/alumno/tareas", icon: FileText },
    { name: "Mi Perfil", href: "/alumno/perfil", icon: User },
    { name: "Configuración", href: "/alumno/configuracion", icon: Settings },
  ]

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button variant="outline" size="icon" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar - Updated with blue background */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform bg-[hsl(var(--sidebar-bg))] text-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-center space-x-2 border-b border-white/10 p-6">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg" alt={`${user.nombre} ${user.apellidos}`} />
              <AvatarFallback>
                {user.nombre.charAt(0)}
                {user.apellidos.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {user.nombre} {user.apellidos}
              </p>
              <p className="text-xs opacity-70">Estudiante</p>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                    isActive ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10 hover:text-white",
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="border-t border-white/10 p-4">
            <Button
              variant="outline"
              className="w-full justify-start text-white border-white/20 hover:bg-white/10 hover:text-white"
              onClick={signOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Orange header */}
        <header className="bg-[hsl(var(--header-bg))] text-[hsl(var(--header-text))] p-4 shadow-md">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">
              Portal Estudiantil - {user.nombre} {user.apellidos}
            </h1>
            <div className="flex items-center space-x-2">
              <span>{new Date().toLocaleDateString("es-ES")}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
