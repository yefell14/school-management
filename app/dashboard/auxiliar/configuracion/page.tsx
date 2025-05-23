"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

export default function ConfiguracionPage() {
  const handleSaveSettings = () => {
    toast({
      title: "Configuración guardada",
      description: "Tu configuración ha sido actualizada correctamente",
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="appearance">Apariencia</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>Configura las opciones generales del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="auto-logout" className="flex flex-col space-y-1">
                  <span>Cierre de sesión automático</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Cerrar sesión automáticamente después de un período de inactividad
                  </span>
                </Label>
                <Switch id="auto-logout" />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="confirm-actions" className="flex flex-col space-y-1">
                  <span>Confirmar acciones</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Solicitar confirmación antes de realizar acciones importantes
                  </span>
                </Label>
                <Switch id="confirm-actions" defaultChecked />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="language">Idioma</Label>
                <Select defaultValue="es">
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Seleccionar idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="timezone">Zona Horaria</Label>
                <Select defaultValue="america-lima">
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Seleccionar zona horaria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="america-lima">América/Lima (GMT-5)</SelectItem>
                    <SelectItem value="america-bogota">América/Bogotá (GMT-5)</SelectItem>
                    <SelectItem value="america-santiago">América/Santiago (GMT-4)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings}>Guardar Configuración</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Notificaciones</CardTitle>
              <CardDescription>Configura cómo y cuándo recibir notificaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                  <span>Notificaciones por correo</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Recibir notificaciones por correo electrónico
                  </span>
                </Label>
                <Switch id="email-notifications" defaultChecked />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="push-notifications" className="flex flex-col space-y-1">
                  <span>Notificaciones push</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Recibir notificaciones push en el navegador
                  </span>
                </Label>
                <Switch id="push-notifications" defaultChecked />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="attendance-notifications" className="flex flex-col space-y-1">
                  <span>Notificaciones de asistencia</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Recibir notificaciones cuando se registre una asistencia
                  </span>
                </Label>
                <Switch id="attendance-notifications" defaultChecked />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="report-notifications" className="flex flex-col space-y-1">
                  <span>Notificaciones de reportes</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Recibir notificaciones cuando se genere un reporte
                  </span>
                </Label>
                <Switch id="report-notifications" defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings}>Guardar Configuración</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Apariencia</CardTitle>
              <CardDescription>Personaliza la apariencia del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="theme">Tema</Label>
                <Select defaultValue="light">
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Seleccionar tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Oscuro</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Colores del Tema</Label>
                <div className="flex gap-2">
                  <Button className="h-8 w-8 rounded-full bg-blue-500" variant="outline" />
                  <Button className="h-8 w-8 rounded-full bg-orange-500" variant="outline" />
                  <Button className="h-8 w-8 rounded-full bg-green-500" variant="outline" />
                  <Button className="h-8 w-8 rounded-full bg-purple-500" variant="outline" />
                  <Button className="h-8 w-8 rounded-full bg-red-500" variant="outline" />
                </div>
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="compact-mode" className="flex flex-col space-y-1">
                  <span>Modo compacto</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Utilizar un diseño más compacto para mostrar más información
                  </span>
                </Label>
                <Switch id="compact-mode" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings}>Guardar Configuración</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
