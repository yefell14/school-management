"use client"

import { useState } from "react"
import Link from "next/link"
import { UserCircle, Bell, LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePathname } from "next/navigation"

export function Header() {
  const [notifications, setNotifications] = useState(3)
  const pathname = usePathname()

  // Determine user role from path
  const getUserRole = () => {
    if (pathname.includes("/dashboard/admin")) return "Administrador"
    if (pathname.includes("/dashboard/profesor")) return "Profesor"
    if (pathname.includes("/dashboard/alumno")) return "Alumno"
    if (pathname.includes("/dashboard/auxiliar")) return "Auxiliar"
    return "Usuario"
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-gradient-to-r from-yellow-400 to-orange-500 px-4 text-white">
      <div className="flex items-center gap-2 md:gap-4">
        <Button variant="ghost" size="icon" className="md:hidden text-white">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold">María de los Ángeles</span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative text-white">
          <Bell className="h-5 w-5" />
          {notifications > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold">
              {notifications}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full text-white">
              <UserCircle className="h-6 w-6" />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{getUserRole()}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href="/dashboard/perfil" className="flex w-full">
                Mi Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/dashboard/configuracion" className="flex w-full">
                Configuración
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500">
              <Link href="/login" className="flex w-full items-center gap-2">
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
