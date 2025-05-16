"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"

export default function ConfiguracionPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("general")

  // Estados para configuraciones generales
  const [generalConfig, setGeneralConfig] = useState({
    nombreInstitucion: "Colegio María de los Ángeles",
    direccion: "Av. Principal 123, Ciudad",
    telefono: "123-456-7890",
    email: "contacto@mariaangeles.edu",
    sitioWeb: "www.mariaangeles.edu",
    logoUrl: "",
  })

  // Estados para configuraciones de notificaciones
  const [notificacionesConfig, setNotificacionesConfig] = useState({
    emailNotificaciones: true,
    notificacionesAsistencia: true,
    notificacionesCalificaciones: true,
    notificacionesTareas: true,
    notificacionesEventos: true,
  })

  // Estados para configuraciones académicas
  const [academicoConfig, setAcademicoConfig] = useState({
    añoEscolar: "2023-2024",
    periodoActual: "Primer Trimestre",
    escalaPuntuacion: "0-100",
    notaAprobacion: "60",
    horaInicio: "07:30",
    horaFin: "14:30",
  })

  // Manejar cambios en configuraciones generales
  const handleGeneralChange = (e) => {
    const { name, value } = e.target
    setGeneralConfig({
      ...generalConfig,
      [name]: value,
    })
  }

  // Manejar cambios en configuraciones de notificaciones
  const handleNotificacionesChange = (key, value) => {
    setNotificacionesConfig({
      ...notificacionesConfig,
      [key]: value,
    })
  }

  // Manejar cambios en configuraciones académicas
  const handleAcademicoChange = (key, value) => {
    setAcademicoConfig({
      ...academicoConfig,
      [key]: value,
    })
  }

  // Guardar configuraciones
  const handleSaveConfig = () => {
    // Aquí iría la lógica para guardar las configuraciones en la base de datos
    console.log("Guardando configuraciones:", {
      general: generalConfig,
      notificaciones: notificacionesConfig,
      academico: academicoConfig,
    })

    toast({
      title: "Configuración guardada",
      description: "Los cambios han sido guardados exitosamente.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración del Sistema</h1>
          <p className="text-muted-foreground">Administra las configuraciones generales del sistema escolar.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
          <TabsTrigger value="academico">Académico</TabsTrigger>
          <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>Configura la información básica de la institución educativa.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombreInstitucion">Nombre de la Institución</Label>
                  <Input
                    id="nombreInstitucion"
                    name="nombreInstitucion"
                    value={generalConfig.nombreInstitucion}
                    onChange={handleGeneralChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    name="direccion"
                    value={generalConfig.direccion}
                    onChange={handleGeneralChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input id="telefono" name="telefono" value={generalConfig.telefono} onChange={handleGeneralChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={generalConfig.email}
                    onChange={handleGeneralChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sitioWeb">Sitio Web</Label>
                  <Input id="sitioWeb" name="sitioWeb" value={generalConfig.sitioWeb} onChange={handleGeneralChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo de la Institución</Label>
                  <div className="flex gap-2">
                    <Input
                      id="logoUrl"
                      name="logoUrl"
                      value={generalConfig.logoUrl}
                      onChange={handleGeneralChange}
                      placeholder="URL del logo o subir archivo"
                    />
                    <Button variant="outline">Subir</Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button onClick={handleSaveConfig}>Guardar Cambios</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificaciones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Notificaciones</CardTitle>
              <CardDescription>Configura cómo y cuándo se envían las notificaciones a los usuarios.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotificaciones">Notificaciones por Correo</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificaciones por correo electrónico a los usuarios.
                    </p>
                  </div>
                  <Switch
                    id="emailNotificaciones"
                    checked={notificacionesConfig.emailNotificaciones}
                    onCheckedChange={(checked) => handleNotificacionesChange("emailNotificaciones", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notificacionesAsistencia">Notificaciones de Asistencia</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificaciones cuando se registre la asistencia de un estudiante.
                    </p>
                  </div>
                  <Switch
                    id="notificacionesAsistencia"
                    checked={notificacionesConfig.notificacionesAsistencia}
                    onCheckedChange={(checked) => handleNotificacionesChange("notificacionesAsistencia", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notificacionesCalificaciones">Notificaciones de Calificaciones</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificaciones cuando se publiquen nuevas calificaciones.
                    </p>
                  </div>
                  <Switch
                    id="notificacionesCalificaciones"
                    checked={notificacionesConfig.notificacionesCalificaciones}
                    onCheckedChange={(checked) => handleNotificacionesChange("notificacionesCalificaciones", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notificacionesTareas">Notificaciones de Tareas</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificaciones cuando se asignen nuevas tareas.
                    </p>
                  </div>
                  <Switch
                    id="notificacionesTareas"
                    checked={notificacionesConfig.notificacionesTareas}
                    onCheckedChange={(checked) => handleNotificacionesChange("notificacionesTareas", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notificacionesEventos">Notificaciones de Eventos</Label>
                    <p className="text-sm text-muted-foreground">Enviar notificaciones sobre eventos próximos.</p>
                  </div>
                  <Switch
                    id="notificacionesEventos"
                    checked={notificacionesConfig.notificacionesEventos}
                    onCheckedChange={(checked) => handleNotificacionesChange("notificacionesEventos", checked)}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button onClick={handleSaveConfig}>Guardar Cambios</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academico" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración Académica</CardTitle>
              <CardDescription>Configura los parámetros académicos del sistema escolar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="añoEscolar">Año Escolar Actual</Label>
                  <Input
                    id="añoEscolar"
                    value={academicoConfig.añoEscolar}
                    onChange={(e) => handleAcademicoChange("añoEscolar", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="periodoActual">Periodo Actual</Label>
                  <Select
                    value={academicoConfig.periodoActual}
                    onValueChange={(value) => handleAcademicoChange("periodoActual", value)}
                  >
                    <SelectTrigger id="periodoActual">
                      <SelectValue placeholder="Seleccionar periodo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Primer Trimestre">Primer Trimestre</SelectItem>
                      <SelectItem value="Segundo Trimestre">Segundo Trimestre</SelectItem>
                      <SelectItem value="Tercer Trimestre">Tercer Trimestre</SelectItem>
                      <SelectItem value="Primer Semestre">Primer Semestre</SelectItem>
                      <SelectItem value="Segundo Semestre">Segundo Semestre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="escalaPuntuacion">Escala de Puntuación</Label>
                  <Select
                    value={academicoConfig.escalaPuntuacion}
                    onValueChange={(value) => handleAcademicoChange("escalaPuntuacion", value)}
                  >
                    <SelectTrigger id="escalaPuntuacion">
                      <SelectValue placeholder="Seleccionar escala" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-100">0-100</SelectItem>
                      <SelectItem value="0-20">0-20</SelectItem>
                      <SelectItem value="0-10">0-10</SelectItem>
                      <SelectItem value="A-F">A-F</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notaAprobacion">Nota Mínima de Aprobación</Label>
                  <Input
                    id="notaAprobacion"
                    value={academicoConfig.notaAprobacion}
                    onChange={(e) => handleAcademicoChange("notaAprobacion", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horaInicio">Hora de Inicio de Clases</Label>
                  <Input
                    id="horaInicio"
                    type="time"
                    value={academicoConfig.horaInicio}
                    onChange={(e) => handleAcademicoChange("horaInicio", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horaFin">Hora de Fin de Clases</Label>
                  <Input
                    id="horaFin"
                    type="time"
                    value={academicoConfig.horaFin}
                    onChange={(e) => handleAcademicoChange("horaFin", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button onClick={handleSaveConfig}>Guardar Cambios</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguridad" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Seguridad</CardTitle>
              <CardDescription>Configura los parámetros de seguridad del sistema.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Autenticación de Dos Factores</Label>
                    <p className="text-sm text-muted-foreground">
                      Requerir autenticación de dos factores para todos los usuarios administrativos.
                    </p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Tiempo de Expiración de Sesión</Label>
                    <p className="text-sm text-muted-foreground">
                      Tiempo de inactividad antes de cerrar la sesión automáticamente.
                    </p>
                  </div>
                  <Select defaultValue="30">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Seleccionar tiempo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="120">2 horas</SelectItem>
                      <SelectItem value="240">4 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Política de Contraseñas</Label>
                    <p className="text-sm text-muted-foreground">
                      Configurar requisitos mínimos para las contraseñas de los usuarios.
                    </p>
                  </div>
                  <Button variant="outline">Configurar</Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Registro de Actividad</Label>
                    <p className="text-sm text-muted-foreground">
                      Mantener un registro detallado de todas las actividades de los usuarios.
                    </p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button onClick={handleSaveConfig}>Guardar Cambios</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
