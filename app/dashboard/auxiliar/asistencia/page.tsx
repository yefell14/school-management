"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QrScanner } from "@/components/dashboard/qr-scanner"
import { QrGenerator } from "@/components/dashboard/qr-generator"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Usuario } from "@/lib/supabase"

export default function AsistenciaPage() {
  const [activeTab, setActiveTab] = useState("escanear")
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [selectedUsuario, setSelectedUsuario] = useState("")
  const [selectedRol, setSelectedRol] = useState<"alumno" | "profesor">("alumno")
  const [observacion, setObservacion] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchUsuarios = async () => {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .in("rol", ["alumno", "profesor"])
        .eq("activo", true)
        .order("apellidos", { ascending: true })

      if (error) {
        console.error("Error al cargar usuarios:", error)
        return
      }
      setUsuarios(data || [])
    }

    fetchUsuarios()
  }, [])

  const handleQrScanned = async (data: string) => {
    setLoading(true)
    try {
      // Verificamos si es un QR válido
      if (!data.includes("-")) {
        throw new Error("Código QR inválido")
      }

      const [tipo, id] = data.split("-")

      if (tipo === "curso") {
        // Verificamos si el QR existe y está activo
        const { data: qrData, error: qrError } = await supabase
          .from("qr_asistencias_curso")
          .select("*, curso:cursos(*)")
          .eq("qr_codigo", data)
          .eq("activo", true)
          .single()

        if (qrError || !qrData) {
          throw new Error("Código QR no válido o expirado")
        }

        // Verificamos si el QR no ha expirado
        if (qrData.fecha_expiracion && new Date(qrData.fecha_expiracion) < new Date()) {
          // Actualizamos el QR a inactivo
          await supabase.from("qr_asistencias_curso").update({ activo: false }).eq("id", qrData.id)

          throw new Error("Código QR expirado")
        }

        toast({
          title: "QR válido",
          description: `Curso: ${qrData.curso?.nombre}. Seleccione un usuario para registrar asistencia.`,
        })

        // Cambiamos a la pestaña de registro manual
        setActiveTab("manual")
      } else if (tipo === "usuario") {
        // Verificamos si el usuario existe
        const { data: usuario, error: userError } = await supabase.from("usuarios").select("*").eq("id", id).single()

        if (userError || !usuario) {
          throw new Error("Usuario no encontrado")
        }

        // Registramos la asistencia
        await registrarAsistencia(usuario.id, usuario.rol as "alumno" | "profesor")

        toast({
          title: "Asistencia registrada",
          description: `Se ha registrado la asistencia de ${usuario.nombre} ${usuario.apellidos}`,
        })
      } else {
        throw new Error("Tipo de QR no reconocido")
      }
    } catch (error: any) {
      toast({
        title: "Error al procesar QR",
        description: error.message || "Ha ocurrido un error al procesar el código QR",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const registrarAsistencia = async (usuarioId: string, rol: "alumno" | "profesor") => {
    try {
      // Obtenemos el usuario actual (auxiliar)
      const usuarioActual = JSON.parse(localStorage.getItem("usuario") || "{}")
      if (!usuarioActual.id) {
        throw new Error("No se pudo identificar al usuario actual")
      }

      // Verificamos si ya existe una asistencia para hoy
      const fechaHoy = new Date().toISOString().split("T")[0]
      const { data: asistenciaExistente, error: checkError } = await supabase
        .from("asistencias_general")
        .select("*")
        .eq("usuario_id", usuarioId)
        .eq("fecha", fechaHoy)
        .maybeSingle()

      if (checkError) {
        throw checkError
      }

      if (asistenciaExistente) {
        // Actualizamos la hora de salida
        const { error: updateError } = await supabase
          .from("asistencias_general")
          .update({
            hora_salida: new Date().toLocaleTimeString(),
            observacion: observacion || asistenciaExistente.observacion,
          })
          .eq("id", asistenciaExistente.id)

        if (updateError) {
          throw updateError
        }

        toast({
          title: "Salida registrada",
          description: "Se ha registrado la hora de salida correctamente",
        })
      } else {
        // Registramos una nueva asistencia
        const { error: insertError } = await supabase.from("asistencias_general").insert({
          usuario_id: usuarioId,
          rol,
          fecha: fechaHoy,
          estado: "presente",
          hora_entrada: new Date().toLocaleTimeString(),
          observacion,
          registrado_por: usuarioActual.id,
        })

        if (insertError) {
          throw insertError
        }

        // Registramos la actividad del auxiliar
        await supabase.from("actividades_auxiliar").insert({
          auxiliar_id: usuarioActual.id,
          accion: "Registro de asistencia",
          detalles: `Registró la asistencia de un ${rol}`,
          tipo: "asistencia",
        })

        toast({
          title: "Asistencia registrada",
          description: "Se ha registrado la asistencia correctamente",
        })
      }

      // Limpiamos los campos
      setSelectedUsuario("")
      setObservacion("")
    } catch (error: any) {
      console.error("Error al registrar asistencia:", error)
      throw new Error(error.message || "Error al registrar la asistencia")
    }
  }

  const handleRegistroManual = async () => {
    setLoading(true)
    try {
      if (!selectedUsuario) {
        throw new Error("Debe seleccionar un usuario")
      }

      const usuario = usuarios.find((u) => u.id === selectedUsuario)
      if (!usuario) {
        throw new Error("Usuario no encontrado")
      }

      await registrarAsistencia(usuario.id, selectedRol)
    } catch (error: any) {
      toast({
        title: "Error al registrar asistencia",
        description: error.message || "Ha ocurrido un error al registrar la asistencia",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Registro de Asistencia</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="escanear">Escanear QR</TabsTrigger>
          <TabsTrigger value="generar">Generar QR</TabsTrigger>
          <TabsTrigger value="manual">Registro Manual</TabsTrigger>
        </TabsList>

        <TabsContent value="escanear" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Escanear Código QR</CardTitle>
              <CardDescription>
                Escanea el código QR del estudiante o profesor para registrar su asistencia
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <QrScanner onScan={handleQrScanned} />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("manual")}>
                Registro Manual
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="generar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generar Código QR</CardTitle>
              <CardDescription>Genera un código QR para un curso o evento específico</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <QrGenerator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registro Manual de Asistencia</CardTitle>
              <CardDescription>Registra la asistencia manualmente seleccionando el usuario</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="rol">Rol</Label>
                  <Select value={selectedRol} onValueChange={(value: "alumno" | "profesor") => setSelectedRol(value)}>
                    <SelectTrigger id="rol">
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alumno">Alumno</SelectItem>
                      <SelectItem value="profesor">Profesor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="usuario">Usuario</Label>
                  <Select value={selectedUsuario} onValueChange={setSelectedUsuario}>
                    <SelectTrigger id="usuario">
                      <SelectValue placeholder="Seleccionar usuario" />
                    </SelectTrigger>
                    <SelectContent>
                      {usuarios
                        .filter((u) => u.rol === selectedRol)
                        .map((usuario) => (
                          <SelectItem key={usuario.id} value={usuario.id}>
                            {usuario.apellidos}, {usuario.nombre}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="observacion">Observación (opcional)</Label>
                  <Input
                    id="observacion"
                    value={observacion}
                    onChange={(e) => setObservacion(e.target.value)}
                    placeholder="Ingrese una observación"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("escanear")}>
                Cancelar
              </Button>
              <Button onClick={handleRegistroManual} disabled={loading || !selectedUsuario}>
                {loading ? "Registrando..." : "Registrar Asistencia"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
