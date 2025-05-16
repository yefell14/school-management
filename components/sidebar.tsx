"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  MessageSquare,
  Bell,
  User,
  QrCode,
  Home,
  FileText,
  Video,
  CheckSquare,
  Award,
  Layers,
  Settings,
} from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(true)

  // Determine which menu to show based on the path
  const isAdmin = pathname.includes("/dashboard/admin")
  const isTeacher = pathname.includes("/dashboard/profesor")
  const isStudent = pathname.includes("/dashboard/alumno")
  const isAuxiliar = pathname.includes("/dashboard/auxiliar")

  const adminLinks = [
    { name: "Usuarios", href: "/dashboard/admin/usuarios", icon: Users },
    { name: "Grados", href: "/dashboard/admin/grados", icon: GraduationCap },
    { name: "Secciones", href: "/dashboard/admin/secciones", icon: Layers },
    { name: "Cursos", href: "/dashboard/admin/cursos", icon: BookOpen },
    { name: "Grupos", href: "/dashboard/admin/grupos", icon: Users },
    { name: "Horarios", href: "/dashboard/admin/horarios", icon: Clock },
    { name: "Escáner QR", href: "/dashboard/admin/escaner-qr", icon: QrCode },
    { name: "Configuración", href: "/dashboard/configuracion", icon: Settings },
  ]

  const teacherLinks = [
    { name: "Mis Cursos", href: "/dashboard/profesor/cursos", icon: BookOpen },
    { name: "Asistencias", href: "/dashboard/profesor/asistencias", icon: CheckSquare },
    { name: "Calificaciones", href: "/dashboard/profesor/calificaciones", icon: Award },
    { name: "Tareas", href: "/dashboard/profesor/tareas", icon: FileText },
    { name: "Mensajes", href: "/dashboard/profesor/mensajes", icon: MessageSquare },
    { name: "Sala Virtual", href: "/dashboard/profesor/sala-virtual", icon: Video },
    { name: "Configuración", href: "/dashboard/configuracion", icon: Settings },
  ]

  const studentLinks = [
    { name: "Mis Cursos", href: "/dashboard/alumno/cursos", icon: BookOpen },
    { name: "Asistencias", href: "/dashboard/alumno/asistencias", icon: CheckSquare },
    { name: "Calificaciones", href: "/dashboard/alumno/calificaciones", icon: Award },
    { name: "Tareas", href: "/dashboard/alumno/tareas", icon: FileText },
    { name: "Sala", href: "/dashboard/alumno/sala", icon: Video },
    { name: "Mensajes", href: "/dashboard/alumno/mensajes", icon: MessageSquare },
    { name: "Configuración", href: "/dashboard/configuracion", icon: Settings },
  ]

  const auxiliarLinks = [
    { name: "Calendario", href: "/dashboard/auxiliar/calendario", icon: Calendar },
    { name: "Clases", href: "/dashboard/auxiliar/clases", icon: BookOpen },
    { name: "Mensajes", href: "/dashboard/auxiliar/mensajes", icon: MessageSquare },
    { name: "Notificaciones", href: "/dashboard/auxiliar/notificaciones", icon: Bell },
    { name: "Perfil", href: "/dashboard/auxiliar/perfil", icon: User },
    { name: "Usuarios", href: "/dashboard/auxiliar/usuarios", icon: Users },
    { name: "Configuración", href: "/dashboard/configuracion", icon: Settings },
  ]

  // Determine which links to show
  let links = []
  if (isAdmin) links = adminLinks
  else if (isTeacher) links = teacherLinks
  else if (isStudent) links = studentLinks
  else if (isAuxiliar) links = auxiliarLinks
  else links = [] // Default or home dashboard

  return (
    <aside
      className={cn(
        "group/sidebar h-screen bg-gradient-to-b from-blue-600 to-blue-800 text-white overflow-y-auto flex flex-col border-r transition-all duration-300",
        expanded ? "w-64" : "w-[70px]",
      )}
    >
      <div className="p-3 flex justify-between items-center">
        {expanded && <span className="font-bold text-lg">Panel</span>}
        <button onClick={() => setExpanded(!expanded)} className="p-2 rounded-lg hover:bg-blue-700">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            {expanded ? (
              <path
                fillRule="evenodd"
                d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                clipRule="evenodd"
              />
            ) : (
              <path
                fillRule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clipRule="evenodd"
              />
            )}
          </svg>
        </button>
      </div>

      <div className="flex-1 py-2">
        <nav className="space-y-1 px-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-blue-700",
                pathname === link.href ? "bg-blue-700" : "transparent",
                !expanded && "justify-center px-2",
              )}
            >
              <link.icon className="h-5 w-5 flex-shrink-0" />
              {expanded && <span>{link.name}</span>}
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-3 mt-auto">
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-blue-700",
            !expanded && "justify-center px-2",
          )}
        >
          <Home className="h-5 w-5 flex-shrink-0" />
          {expanded && <span>Inicio</span>}
        </Link>
      </div>
    </aside>
  )
}
