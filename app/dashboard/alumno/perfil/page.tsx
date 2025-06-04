"use client"

import { useState, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Lock, Phone, Mail, MapPin, Calendar, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { QRCodeCanvas } from "qrcode.react"
import { convertQRtoJPG } from "@/lib/qr-utils"

export default function PerfilPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas nuevas no coinciden",
        variant: "destructive",
      })
      return
    }

    setChangingPassword(true)

    try {
      // First verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: currentPassword,
      })

      if (signInError) {
        throw new Error("La contraseña actual es incorrecta")
      }

      // Then update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) throw updateError

      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido actualizada correctamente",
      })

      // Reset form
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setChangePasswordOpen(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la contraseña",
        variant: "destructive",
      })
    } finally {
      setChangingPassword(false)
    }
  }

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "No disponible"

    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground">Gestiona tu información personal y configuración</p>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Información Personal</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
          <TabsTrigger value="qr">Mi QR</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>Datos de tu perfil de estudiante</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="text-2xl">
                    {user.nombre.charAt(0)}
                    {user.apellidos.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="text-2xl font-semibold">
                    {user.nombre} {user.apellidos}
                  </h3>
                  <p className="text-muted-foreground">Estudiante</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Nombre completo</span>
                  </div>
                  <p>
                    {user.nombre} {user.apellidos}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Correo electrónico</span>
                  </div>
                  <p>{user.email}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Teléfono</span>
                  </div>
                  <p>{user.telefono || "No disponible"}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Dirección</span>
                  </div>
                  <p>{user.direccion || "No disponible"}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Fecha de registro</span>
                  </div>
                  <p>{formatDate(user.fecha_registro)}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Último acceso</span>
                  </div>
                  <p>{formatDate(user.ultimo_acceso)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seguridad</CardTitle>
              <CardDescription>Gestiona la seguridad de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <div className="flex items-center">
                    <Lock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Contraseña</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Actualiza tu contraseña regularmente para mayor seguridad
                  </p>
                </div>
                <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">Cambiar contraseña</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Cambiar contraseña</DialogTitle>
                      <DialogDescription>Ingresa tu contraseña actual y la nueva contraseña</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <label htmlFor="current-password" className="text-sm font-medium">
                          Contraseña actual
                        </label>
                        <Input
                          id="current-password"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="new-password" className="text-sm font-medium">
                          Nueva contraseña
                        </label>
                        <Input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="confirm-password" className="text-sm font-medium">
                          Confirmar nueva contraseña
                        </label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setChangePasswordOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleChangePassword} disabled={changingPassword}>
                        {changingPassword ? "Actualizando..." : "Actualizar contraseña"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qr" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mi Código QR</CardTitle>
              <CardDescription>Utiliza este código QR para marcar tu asistencia</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div ref={qrRef} className="bg-white p-6 rounded-lg shadow-md border-2 border-blue-200 w-64 text-center">
                <h3 className="font-bold text-lg mb-2">Código QR Personal</h3>
                <div className="bg-white w-48 h-48 mx-auto flex items-center justify-center">
                  {user && (
                    <QRCodeCanvas
                      value={`usuario-${user.id}`}
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                  )}
                </div>
                <p className="text-sm mt-4">
                  {user.nombre} {user.apellidos}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{user.dni || "Sin DNI"}</p>
              </div>
              <div className="mt-6 space-y-2 text-center">
                <Button onClick={() => {
                  try {
                    console.log('Iniciando descarga del QR');
                    if (!qrRef.current) {
                      console.error('No se encontró la referencia al contenedor del QR');
                      toast({
                        title: "Error",
                        description: "No se pudo encontrar el código QR para descargar",
                        variant: "destructive",
                      });
                      return;
                    }

                    const canvas = qrRef.current.querySelector('canvas');
                    console.log('Canvas encontrado:', canvas);
                    
                    if (!canvas) {
                      console.error('No se encontró el elemento canvas dentro del contenedor del QR');
                      toast({
                        title: "Error",
                        description: "No se pudo encontrar el código QR para descargar",
                        variant: "destructive",
                      });
                      return;
                    }

                    const link = document.createElement('a');
                    try {
                      link.href = convertQRtoJPG(canvas);
                      link.download = `qr_${user.nombre}_${user.apellidos}.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      
                      toast({
                        title: "Éxito",
                        description: "El código QR se ha descargado correctamente",
                      });
                    } catch (error) {
                      console.error('Error al convertir o descargar el QR:', error);
                      toast({
                        title: "Error",
                        description: "No se pudo descargar el código QR",
                        variant: "destructive",
                      });
                    }
                  } catch (error) {
                    console.error('Error general al descargar el QR:', error);
                    toast({
                      title: "Error",
                      description: "Ocurrió un error al procesar la descarga",
                      variant: "destructive",
                    });
                  }
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Código QR
                </Button>
                <p className="text-sm text-muted-foreground">
                  Muestra este código QR a tu profesor para registrar tu asistencia a clases
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
