"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { User, Phone, Mail, MapPin, Calendar, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QRCodeSVG } from "qrcode.react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TeacherProfile {
  id: string
  nombre: string
  apellidos: string
  email: string
  dni: string | null
  telefono: string | null
  direccion: string | null
  especialidad: string | null
  fecha_registro: string
  ultimo_acceso: string | null
}

export default function TeacherProfilePage() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [changingPassword, setChangingPassword] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchProfile() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          setError("No hay sesión activa")
          return
        }

        console.log("Obteniendo perfil para el usuario ID:", session.user.id)

        // Primero intentamos buscar por ID
        const { data: userData, error: userError } = await supabase
          .from("usuarios")
          .select("*")
          .eq("id", session.user.id)

        if (userError) {
          console.error("Error al buscar usuario por ID:", userError)
          throw userError
        }

        // Si no encontramos por ID, intentamos buscar por email
        if (!userData || userData.length === 0) {
          console.log("No se encontró usuario con ese ID, buscando por email...")

          const { data: userByEmail, error: emailError } = await supabase
            .from("usuarios")
            .select("*")
            .eq("email", session.user.email)

          if (emailError) {
            console.error("Error al buscar por email:", emailError)
            throw emailError
          }

          if (!userByEmail || userByEmail.length === 0) {
            throw new Error("No se encontró ningún usuario asociado a esta cuenta")
          }

          // Si encontramos múltiples usuarios con el mismo email, tomamos el primero
          setProfile(userByEmail[0])
          return
        }

        // Si encontramos por ID, tomamos el primer resultado
        setProfile(userData[0])
      } catch (error: any) {
        console.error("Error fetching profile:", error)
        setError(error.message || "Error al cargar el perfil")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [supabase])

  const handleChangePassword = async () => {
    try {
      setPasswordError(null)
      setPasswordSuccess(null)
      setChangingPassword(true)

      // Validate passwords
      if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
        setPasswordError("Las contraseñas nuevas no coinciden")
        return
      }

      if (changePasswordData.newPassword.length < 6) {
        setPasswordError("La contraseña debe tener al menos 6 caracteres")
        return
      }

      // Change password
      const { error } = await supabase.auth.updateUser({
        password: changePasswordData.newPassword,
      })

      if (error) throw error

      // Reset form
      setChangePasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      setPasswordSuccess("Contraseña actualizada correctamente")
    } catch (error: any) {
      console.error("Error changing password:", error)
      setPasswordError(error.message || "Error al cambiar la contraseña")
    } finally {
      setChangingPassword(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"

    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto">
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => window.location.reload()}>Reintentar</Button>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Error al cargar el perfil</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center">
          <User className="h-6 w-6 mr-2 text-blue-600" />
          <h1 className="text-3xl font-bold text-blue-600">Mi Perfil</h1>
        </div>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="info">Información Personal</TabsTrigger>
            <TabsTrigger value="security">Seguridad</TabsTrigger>
            <TabsTrigger value="qr">Mi QR</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                  <CardDescription>Detalles de su información personal y de contacto</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nombre</Label>
                      <div className="flex items-center mt-1 p-2 border rounded-md bg-gray-50">{profile.nombre}</div>
                    </div>
                    <div>
                      <Label>Apellidos</Label>
                      <div className="flex items-center mt-1 p-2 border rounded-md bg-gray-50">{profile.apellidos}</div>
                    </div>
                  </div>

                  <div>
                    <Label>Correo Electrónico</Label>
                    <div className="flex items-center mt-1 p-2 border rounded-md bg-gray-50">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      {profile.email}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>DNI</Label>
                      <div className="flex items-center mt-1 p-2 border rounded-md bg-gray-50">
                        {profile.dni || "No especificado"}
                      </div>
                    </div>
                    <div>
                      <Label>Teléfono</Label>
                      <div className="flex items-center mt-1 p-2 border rounded-md bg-gray-50">
                        <Phone className="h-4 w-4 mr-2 text-gray-500" />
                        {profile.telefono || "No especificado"}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Dirección</Label>
                    <div className="flex items-center mt-1 p-2 border rounded-md bg-gray-50">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      {profile.direccion || "No especificada"}
                    </div>
                  </div>

                  <div>
                    <Label>Especialidad</Label>
                    <div className="flex items-center mt-1 p-2 border rounded-md bg-gray-50">
                      {profile.especialidad || "No especificada"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actividad</CardTitle>
                  <CardDescription>Información sobre su actividad en el sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Fecha de Registro</Label>
                    <div className="flex items-center mt-1 p-2 border rounded-md bg-gray-50">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      {formatDate(profile.fecha_registro)}
                    </div>
                  </div>

                  <div>
                    <Label>Último Acceso</Label>
                    <div className="flex items-center mt-1 p-2 border rounded-md bg-gray-50">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      {formatDate(profile.ultimo_acceso)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Seguridad</CardTitle>
                <CardDescription>Gestione su contraseña y configuración de seguridad</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-w-md">
                  {passwordError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                      {passwordError}
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                      {passwordSuccess}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Contraseña Actual</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={changePasswordData.currentPassword}
                        onChange={(e) =>
                          setChangePasswordData({
                            ...changePasswordData,
                            currentPassword: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="newPassword">Nueva Contraseña</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={changePasswordData.newPassword}
                        onChange={(e) =>
                          setChangePasswordData({
                            ...changePasswordData,
                            newPassword: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={changePasswordData.confirmPassword}
                        onChange={(e) =>
                          setChangePasswordData({
                            ...changePasswordData,
                            confirmPassword: e.target.value,
                          })
                        }
                      />
                    </div>

                    <Button onClick={handleChangePassword} disabled={changingPassword} className="w-full">
                      {changingPassword ? "Cambiando..." : "Cambiar Contraseña"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qr">
            <Card>
              <CardHeader>
                <CardTitle>Mi Código QR</CardTitle>
                <CardDescription>Utilice este código QR para identificarse en el sistema</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-6">
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <QRCodeSVG value={`profesor:${profile.id}`} size={200} level="H" includeMargin={true} />
                </div>
                <p className="mt-4 text-center text-gray-600">
                  Este código QR contiene su identificación única como profesor
                </p>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button>Descargar QR</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
