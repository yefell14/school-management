"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"
import { getSupabaseBrowser } from "@/lib/supabase-browser"
import type { Usuario } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

export default function PerfilPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    telefono: "",
    direccion: "",
  })

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const supabase = getSupabaseBrowser()
        
        // Obtener la sesión actual
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) throw sessionError
        if (!sessionData.session) {
          throw new Error("No hay sesión activa")
        }

        // Obtener los datos del usuario
        const { data, error } = await supabase
          .from("usuarios")
          .select("*")
          .eq("id", sessionData.session.user.id)
          .single()

        if (error) throw error

        setUsuario(data)
        setFormData({
          nombre: data.nombre || "",
          apellidos: data.apellidos || "",
          email: data.email || "",
          telefono: data.telefono || "",
          direccion: data.direccion || "",
        })
      } catch (error) {
        console.error("Error al cargar el perfil:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la información del perfil",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUsuario()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleSaveProfile = async () => {
    if (!usuario) return

    setLoading(true)
    try {
      const supabase = getSupabaseBrowser()
      
      const { error } = await supabase
        .from("usuarios")
        .update({
          nombre: formData.nombre,
          apellidos: formData.apellidos,
          telefono: formData.telefono,
          direccion: formData.direccion,
        })
        .eq("id", usuario.id)

      if (error) throw error

      // Actualizar el usuario en el estado
      setUsuario({
        ...usuario,
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        telefono: formData.telefono,
        direccion: formData.direccion,
      })

      setIsEditing(false)
      toast({
        title: "Perfil actualizado",
        description: "Tu perfil ha sido actualizado correctamente",
      })
    } catch (error: any) {
      toast({
        title: "Error al actualizar",
        description: error.message || "Ocurrió un error al actualizar el perfil",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!usuario) {
    return (
      <div className="flex h-full w-full items-center justify-center py-24">
        <p className="text-muted-foreground">No se pudo cargar la información del perfil</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Mi Perfil</h2>
        <Button onClick={() => setIsEditing(!isEditing)}>{isEditing ? "Cancelar" : "Editar Perfil"}</Button>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Información Personal</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
          <TabsTrigger value="activity">Actividad</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>Actualiza tu información personal y de contacto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={`/avatars/${usuario.id.slice(-2)}.png`} alt="Avatar" />
                  <AvatarFallback>{`${usuario.nombre?.charAt(0) || ""}${usuario.apellidos?.charAt(0) || ""}`}</AvatarFallback>
                </Avatar>
                {isEditing && <Button variant="outline">Cambiar Foto</Button>}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input id="nombre" value={formData.nombre} onChange={handleInputChange} disabled={!isEditing} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="apellidos">Apellidos</Label>
                  <Input id="apellidos" value={formData.apellidos} onChange={handleInputChange} disabled={!isEditing} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input id="email" type="email" value={formData.email} disabled={true} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input id="telefono" value={formData.telefono} onChange={handleInputChange} disabled={!isEditing} />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Textarea id="direccion" value={formData.direccion} onChange={handleInputChange} disabled={!isEditing} />
                </div>
              </div>
            </CardContent>
            {isEditing && (
              <CardFooter>
                <Button onClick={handleSaveProfile} disabled={loading}>
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seguridad</CardTitle>
              <CardDescription>Actualiza tu contraseña y configuración de seguridad</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="current-password">Contraseña Actual</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-password">Nueva Contraseña</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Actualizar Contraseña</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>Tu actividad reciente en el sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Aquí irá la lista de actividades */}
                <p className="text-muted-foreground">No hay actividad reciente para mostrar.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
