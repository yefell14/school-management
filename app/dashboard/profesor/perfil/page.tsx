"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Phone, MapPin, Key, QrCode, BookOpen, Users, CheckSquare, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

// Datos de ejemplo del usuario
const userData = {
  id: "1",
  nombre: "Juan",
  apellidos: "Pérez García",
  email: "juan.perez@escuela.edu",
  rol: "profesor",
  dni: "12345678",
  telefono: "987654321",
  direccion: "Av. Principal 123, Ciudad",
  especialidad: "Matemáticas",
  fecha_registro: "2023-01-15",
  ultimo_acceso: "2023-05-10T08:30:00",
  cursos_asignados: 5,
  estudiantes_total: 142,
  asistencia_promedio: 92,
}

export default function PerfilProfesorPage() {
  const [activeTab, setActiveTab] = useState("perfil")
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const router = useRouter()

  // Manejar cambio de contraseña
  const handleChangePassword = () => {
    // Aquí iría la lógica para cambiar la contraseña
    console.log("Cambiando contraseña:", passwordData)
    setIsChangePasswordDialogOpen(false)
    // Resetear el formulario
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
  }

  // Formatear fecha
  const formatFecha = (fechaString) => {
    const fecha = new Date(fechaString)
    return fecha.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Formatear fecha y hora
  const formatFechaHora = (fechaString) => {
    const fecha = new Date(fechaString)
    return fecha.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Obtener iniciales para el avatar
  const getInitials = () => {
    return `${userData.nombre.charAt(0)}${userData.apellidos.charAt(0)}`
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Regresar</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
            <p className="text-muted-foreground">Gestiona tu información personal y seguridad.</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
          <TabsTrigger value="qr">Código QR</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>Visualiza y actualiza tu información personal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src="/placeholder.svg?height=96&width=96"
                      alt={`${userData.nombre} ${userData.apellidos}`}
                    />
                    <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-600 to-blue-700">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline">Cambiar Foto</Button>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre</Label>
                      <div className="flex items-center border rounded-md px-3 py-2 bg-muted">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{userData.nombre}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apellidos">Apellidos</Label>
                      <div className="flex items-center border rounded-md px-3 py-2 bg-muted">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{userData.apellidos}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <div className="flex items-center border rounded-md px-3 py-2 bg-muted">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{userData.email}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dni">DNI</Label>
                      <div className="flex items-center border rounded-md px-3 py-2 bg-muted">
                        <span>{userData.dni}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefono">Teléfono</Label>
                      <div className="flex items-center border rounded-md px-3 py-2 bg-muted">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{userData.telefono}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="especialidad">Especialidad</Label>
                      <div className="flex items-center border rounded-md px-3 py-2 bg-muted">
                        <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{userData.especialidad}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="direccion">Dirección</Label>
                    <div className="flex items-center border rounded-md px-3 py-2 bg-muted">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{userData.direccion}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Estadísticas</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <BookOpen className="h-8 w-8 text-blue-600 mb-2" />
                        <p className="text-2xl font-bold">{userData.cursos_asignados}</p>
                        <p className="text-sm text-muted-foreground">Cursos Asignados</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <Users className="h-8 w-8 text-blue-600 mb-2" />
                        <p className="text-2xl font-bold">{userData.estudiantes_total}</p>
                        <p className="text-sm text-muted-foreground">Estudiantes</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <CheckSquare className="h-8 w-8 text-blue-600 mb-2" />
                        <p className="text-2xl font-bold">{userData.asistencia_promedio}%</p>
                        <p className="text-sm text-muted-foreground">Asistencia Promedio</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Información de la Cuenta</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fecha de Registro</Label>
                    <div className="flex items-center border rounded-md px-3 py-2 bg-muted">
                      <span>{formatFecha(userData.fecha_registro)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Último Acceso</Label>
                    <div className="flex items-center border rounded-md px-3 py-2 bg-muted">
                      <span>{formatFechaHora(userData.ultimo_acceso)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>Editar Perfil</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguridad" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seguridad</CardTitle>
              <CardDescription>Gestiona la seguridad de tu cuenta.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Cambiar Contraseña</h3>
                <p className="text-muted-foreground">
                  Es recomendable cambiar tu contraseña periódicamente para mantener la seguridad de tu cuenta.
                </p>
                <Dialog open={isChangePasswordDialogOpen} onOpenChange={setIsChangePasswordDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-600 to-blue-700">
                      <Key className="mr-2 h-4 w-4" /> Cambiar Contraseña
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cambiar Contraseña</DialogTitle>
                      <DialogDescription>
                        Ingresa tu contraseña actual y la nueva contraseña para actualizarla.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="currentPassword">Contraseña Actual</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="newPassword">Nueva Contraseña</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsChangePasswordDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleChangePassword}>Cambiar Contraseña</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Sesiones Activas</h3>
                <p className="text-muted-foreground">Aquí se mostrarán las sesiones activas del usuario.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qr" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Código QR</CardTitle>
              <CardDescription>Accede rápidamente a tu perfil mediante un código QR.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <QrCode className="h-48 w-48 text-blue-600" />
              </div>
              <p className="text-center text-muted-foreground">
                Escanea este código QR para acceder a tu perfil de forma rápida y segura.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
