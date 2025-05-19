"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from "next-themes"
import { Moon, Sun, Monitor, Bell, BellOff, Languages, LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ConfiguracionPage() {
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const [notificaciones, setNotificaciones] = useState(true)
  const [idioma, setIdioma] = useState("es")

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    toast({
      title: "Tema actualizado",
      description: `El tema ha sido cambiado a ${
        newTheme === "light" ? "claro" : newTheme === "dark" ? "oscuro" : "sistema"
      }`,
    })
  }

  const handleNotificacionesChange = (checked: boolean) => {
    setNotificaciones(checked)
    toast({
      title: checked ? "Notificaciones activadas" : "Notificaciones desactivadas",
      description: checked
        ? "Recibirás notificaciones sobre tus cursos y tareas"
        : "No recibirás notificaciones sobre tus cursos y tareas",
    })
  }

  const handleIdiomaChange = (value: string) => {
    setIdioma(value)
    toast({
      title: "Idioma actualizado",
      description: `El idioma ha sido cambiado a ${value === "es" ? "Español" : "Inglés"}`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">Personaliza tu experiencia en la plataforma</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Apariencia</CardTitle>
            <CardDescription>Personaliza la apariencia de la plataforma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="theme">Tema</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handleThemeChange("light")}
                >
                  <Sun className="mr-2 h-4 w-4" />
                  Claro
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handleThemeChange("dark")}
                >
                  <Moon className="mr-2 h-4 w-4" />
                  Oscuro
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handleThemeChange("system")}
                >
                  <Monitor className="mr-2 h-4 w-4" />
                  Sistema
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificaciones</CardTitle>
            <CardDescription>Configura tus preferencias de notificaciones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {notificaciones ? (
                  <Bell className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <BellOff className="h-4 w-4 text-muted-foreground" />
                )}
                <Label htmlFor="notifications">Recibir notificaciones</Label>
              </div>
              <Switch id="notifications" checked={notificaciones} onCheckedChange={handleNotificacionesChange} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Idioma</CardTitle>
            <CardDescription>Selecciona el idioma de la plataforma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col space-y-1.5">
              <div className="flex items-center space-x-2">
                <Languages className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="language">Idioma</Label>
              </div>
              <Select value={idioma} onValueChange={handleIdiomaChange}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="Selecciona un idioma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">Inglés</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sesión</CardTitle>
            <CardDescription>Gestiona tu sesión actual</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={signOut} className="w-full sm:w-auto">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
