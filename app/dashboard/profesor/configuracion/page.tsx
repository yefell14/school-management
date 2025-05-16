"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Settings, Moon, Sun, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useTheme } from "next-themes"

export default function TeacherSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    showOnlineStatus: true,
  })
  const { theme, setTheme } = useTheme()
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Simulate loading settings
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const handleThemeChange = (value: string) => {
    setTheme(value)
  }

  const handleToggleChange = (setting: keyof typeof settings) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting],
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center">
          <Settings className="h-6 w-6 mr-2 text-blue-600" />
          <h1 className="text-3xl font-bold text-blue-600">Configuración</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Apariencia</CardTitle>
              <CardDescription>Personalice la apariencia de la aplicación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base">Tema</Label>
                <RadioGroup defaultValue={theme} onValueChange={handleThemeChange} className="mt-3 space-y-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light" className="flex items-center cursor-pointer">
                      <Sun className="h-4 w-4 mr-2" />
                      Claro
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark" className="flex items-center cursor-pointer">
                      <Moon className="h-4 w-4 mr-2" />
                      Oscuro
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="system" />
                    <Label htmlFor="system" className="cursor-pointer">
                      Sistema
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>Configure sus preferencias de notificaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notificaciones en la aplicación</Label>
                  <p className="text-sm text-gray-500">Recibir notificaciones dentro de la aplicación</p>
                </div>
                <Switch checked={settings.notifications} onCheckedChange={() => handleToggleChange("notifications")} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Alertas por correo</Label>
                  <p className="text-sm text-gray-500">Recibir notificaciones por correo electrónico</p>
                </div>
                <Switch checked={settings.emailAlerts} onCheckedChange={() => handleToggleChange("emailAlerts")} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacidad</CardTitle>
              <CardDescription>Configure sus ajustes de privacidad</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Mostrar estado en línea</Label>
                  <p className="text-sm text-gray-500">Permitir que otros usuarios vean cuando está en línea</p>
                </div>
                <Switch
                  checked={settings.showOnlineStatus}
                  onCheckedChange={() => handleToggleChange("showOnlineStatus")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Visibilidad del perfil</Label>
                  <p className="text-sm text-gray-500">Controle quién puede ver su perfil completo</p>
                </div>
                <div className="flex items-center">
                  {settings.showOnlineStatus ? (
                    <Eye className="h-5 w-5 text-gray-500 mr-2" />
                  ) : (
                    <EyeOff className="h-5 w-5 text-gray-500 mr-2" />
                  )}
                  <span className="text-sm">{settings.showOnlineStatus ? "Visible" : "Limitado"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Accesibilidad</CardTitle>
              <CardDescription>Ajustes de accesibilidad para mejorar su experiencia</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Tamaño de fuente</Label>
                  <p className="text-sm text-gray-500">Ajuste el tamaño de texto en la aplicación</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    A-
                  </Button>
                  <Button variant="outline" size="sm">
                    A+
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Animaciones reducidas</Label>
                  <p className="text-sm text-gray-500">Reducir o eliminar animaciones en la interfaz</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button>Guardar Cambios</Button>
        </div>
      </div>
    </div>
  )
}
