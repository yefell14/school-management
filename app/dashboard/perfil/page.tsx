"use client"

import { useState, useEffect } from "react"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Phone, MapPin, Key, Download, LogOut, ArrowLeft } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getCurrentUser } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { QRCodeSVG } from "qrcode.react"

interface UserData {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  rol: 'admin' | 'profesor' | 'alumno' | 'auxiliar';
  dni?: string;
  telefono?: string;
  direccion?: string;
  fecha_registro: string;
  ultimo_acceso?: string;
  especialidad?: string;
  grado?: string;
  seccion?: string;
  activo: boolean;
}

export default function PerfilPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("perfil")
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        
        // 1. Obtener el usuario autenticado
        const { data: authData, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
          console.error("Error al obtener usuario autenticado:", authError)
          throw authError
        }

        if (!authData?.user) {
          console.log("No hay usuario autenticado, redirigiendo al login")
          router.push('/login')
          return
        }

        console.log("Usuario autenticado:", authData.user)

        // 2. Obtener datos del usuario de la tabla usuarios usando el email
        const { data: userProfile, error: profileError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('email', authData.user.email)
          .single()

        if (profileError) {
          console.error("Error al obtener perfil del usuario:", profileError)
          throw profileError
        }

        if (!userProfile) {
          console.error("No se encontró el perfil del usuario")
          toast({
            title: "Error al cargar el perfil",
            description: "No se encontró tu perfil en el sistema. Por favor, contacta al administrador.",
            variant: "destructive",
          })
          return
        }

        console.log("Perfil de usuario encontrado:", userProfile)
        setUserData(userProfile)

      } catch (error) {
        console.error("Error detallado al obtener datos del usuario:", error)
        toast({
          title: "Error al cargar el perfil",
          description: "No se pudo obtener la información del usuario. Por favor, intenta recargar la página.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [toast, router])

  // Manejar cambio de contraseña
  const handleChangePassword = async () => {
    try {
      // Primero actualizamos en la tabla usuarios
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ contraseña: passwordData.newPassword })
        .eq('email', userData?.email)

      if (updateError) throw updateError

      // Luego actualizamos en auth
      const { error: authError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (authError) throw authError

      setIsChangePasswordDialogOpen(false)
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido actualizada correctamente",
      })
    } catch (error) {
      console.error("Error al cambiar contraseña:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la contraseña",
        variant: "destructive",
      })
    }
  }

  // Manejar cierre de sesión
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/login")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión",
        variant: "destructive",
      })
    }
  }

  // Formatear fecha
  const formatFecha = (fechaString: string | undefined): string => {
    if (!fechaString) return "No disponible"
    const fecha = new Date(fechaString)
    return fecha.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Formatear fecha y hora
  const formatFechaHora = (fechaString: string | undefined): string => {
    if (!fechaString) return "No disponible"
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
    if (!userData) return "U"
    return `${userData.nombre?.charAt(0) || ""}${userData.apellidos?.charAt(0) || ""}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando información del perfil...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-lg text-red-600">No se pudo cargar la información del usuario</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    )
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
        <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </Button>
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
                        <span>{userData.nombre || "No disponible"}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apellidos">Apellidos</Label>
                      <div className="flex items-center border rounded-md px-3 py-2 bg-muted">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{userData.apellidos || "No disponible"}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <div className="flex items-center border rounded-md px-3 py-2 bg-muted">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{userData.email || "No disponible"}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dni">DNI</Label>
                      <div className="flex items-center border rounded-md px-3 py-2 bg-muted">
                        <span>{userData.dni || "No disponible"}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefono">Teléfono</Label>
                      <div className="flex items-center border rounded-md px-3 py-2 bg-muted">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{userData.telefono || "No disponible"}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rol">Rol</Label>
                      <div className="flex items-center border rounded-md px-3 py-2 bg-muted">
                        <span>
                          {userData.rol === "admin"
                            ? "Administrador"
                            : userData.rol === "profesor"
                              ? "Profesor"
                              : userData.rol === "alumno"
                                ? "Alumno"
                                : "Auxiliar"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="direccion">Dirección</Label>
                    <div className="flex items-center border rounded-md px-3 py-2 bg-muted">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{userData.direccion || "No disponible"}</span>
                    </div>
                  </div>
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
                <p className="text-muted-foreground">Estas son las sesiones actualmente activas en tu cuenta.</p>
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">Sesión Actual</h4>
                        <p className="text-sm text-muted-foreground">Navegador: Chrome en Windows 10</p>
                        <p className="text-sm text-muted-foreground">Dirección IP: 192.168.1.1</p>
                        <p className="text-sm text-muted-foreground">Última actividad: Hace 5 minutos</p>
                      </div>
                      <Button variant="outline" size="sm" disabled>
                        Sesión Actual
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qr" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mi Código QR</CardTitle>
              <CardDescription>
                Este es tu código QR personal para registrar asistencia y acceder a recursos.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-6">
              <div className="bg-white p-6 rounded-lg shadow-md border-2 border-blue-200 w-64 text-center">
                <h3 className="font-bold text-lg mb-2">Código QR Personal</h3>
                <div className="bg-white w-48 h-48 mx-auto flex items-center justify-center">
                  {userData && (
                    <QRCodeSVG
                      value={`usuario-${userData.id}`}
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                  )}
                </div>
                <p className="text-sm mt-4">
                  {userData.nombre} {userData.apellidos}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{userData.dni}</p>
              </div>
              <div className="mt-6 space-y-2 text-center">
                <Button onClick={() => {
                  const canvas = document.querySelector('canvas');
                  if (canvas) {
                    const link = document.createElement('a');
                    link.href = canvas.toDataURL('image/png');
                    link.download = `qr_${userData.nombre}_${userData.apellidos}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Código QR
                </Button>
                <p className="text-sm text-muted-foreground">
                  Muestra este código para registrar tu asistencia o acceder a recursos.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
