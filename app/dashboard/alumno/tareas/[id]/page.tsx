"use client"

import { Input } from "@/components/ui/input"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase, type Tarea } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, CheckCircle2, AlertCircle, Upload, FileText, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function TareaDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [tarea, setTarea] = useState<(Tarea & { grupo: { curso: { nombre: string } } }) | null>(null)
  const [entrega, setEntrega] = useState<any | null>(null)
  const [contenido, setContenido] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    const fetchTareaDetails = async () => {
      if (!user) return

      try {
        // Fetch task details
        const { data: tareaData, error: tareaError } = await supabase
          .from("tareas")
          .select(`
            *,
            grupo:grupos(
              curso:cursos(nombre)
            )
          `)
          .eq("id", params.id)
          .single()

        if (tareaError) throw tareaError
        setTarea(tareaData)

        // Fetch submission if exists
        const { data: entregaData, error: entregaError } = await supabase
          .from("entregas_tareas")
          .select("*")
          .eq("tarea_id", params.id)
          .eq("alumno_id", user.id)
          .single()

        if (!entregaError && entregaData) {
          setEntrega(entregaData)
          setContenido(entregaData.contenido || "")
        }
      } catch (error) {
        console.error("Error fetching task details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTareaDetails()
  }, [user, params.id])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = async () => {
    if (!user || !tarea) return

    setSubmitting(true)

    try {
      let fileUrl = entrega?.archivo_url || null

      // If there's a new file, upload it
      if (selectedFile) {
        // In a real app, you would upload the file to storage
        // For this demo, we'll just use the file name
        fileUrl = `uploads/${selectedFile.name}`
      }

      if (entrega) {
        // Update existing submission
        const { error } = await supabase
          .from("entregas_tareas")
          .update({
            contenido,
            archivo_url: fileUrl,
            fecha_entrega: new Date().toISOString(),
          })
          .eq("id", entrega.id)

        if (error) throw error

        setEntrega({
          ...entrega,
          contenido,
          archivo_url: fileUrl,
          fecha_entrega: new Date().toISOString(),
        })
      } else {
        // Create new submission
        const { data, error } = await supabase
          .from("entregas_tareas")
          .insert([
            {
              tarea_id: tarea.id,
              alumno_id: user.id,
              contenido,
              archivo_url: fileUrl,
            },
          ])
          .select()

        if (error) throw error

        setEntrega(data[0])

        // Update task status to completed
        await supabase.from("tareas").update({ estado: "completada" }).eq("id", tarea.id)

        // Update local state
        setTarea({
          ...tarea,
          estado: "completada",
        })
      }

      toast({
        title: "Tarea entregada",
        description: "Tu tarea ha sido entregada correctamente",
      })
    } catch (error: any) {
      console.error("Error submitting task:", error)
      toast({
        title: "Error",
        description: "No se pudo entregar la tarea",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!tarea) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <h2 className="text-2xl font-bold">Tarea no encontrada</h2>
        <p className="text-muted-foreground">La tarea que buscas no existe o no tienes acceso</p>
        <Link href="/dashboard/alumno/tareas">
          <Button className="mt-4">Volver a mis tareas</Button>
        </Link>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const isOverdue = (dateString: string) => {
    const dueDate = new Date(dateString)
    const today = new Date()
    return dueDate < today && dueDate.toDateString() !== today.toDateString()
  }

  const getStatusBadge = (estado: string, fechaEntrega: string) => {
    if (estado === "pendiente" && isOverdue(fechaEntrega)) {
      return (
        <Badge variant="destructive">
          <AlertCircle className="mr-1 h-3 w-3" />
          Vencida
        </Badge>
      )
    }

    switch (estado) {
      case "pendiente":
        return (
          <Badge variant="outline">
            <Clock className="mr-1 h-3 w-3" />
            Pendiente
          </Badge>
        )
      case "completada":
        return (
          <Badge variant="secondary">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Completada
          </Badge>
        )
      case "calificada":
        return (
          <Badge variant="default">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Calificada
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <Link href="/dashboard/alumno/tareas">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Volver
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{tarea.titulo}</h1>
        </div>
        <div className="flex items-center">
          <p className="text-muted-foreground">{tarea.grupo.curso.nombre}</p>
          <span className="mx-2">•</span>
          <div className="flex items-center text-muted-foreground">
            <Calendar className="mr-1 h-4 w-4" />
            <span>Entrega: {formatDate(tarea.fecha_entrega)}</span>
          </div>
          <span className="mx-2">•</span>
          {getStatusBadge(tarea.estado, tarea.fecha_entrega)}
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="submission">Entrega</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Descripción de la tarea</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p>{tarea.descripcion || "No hay descripción disponible para esta tarea."}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información adicional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Fecha de asignación</p>
                  <p className="text-sm text-muted-foreground">{formatDateTime(tarea.fecha_asignacion)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Fecha de entrega</p>
                  <p className="text-sm text-muted-foreground">{formatDateTime(tarea.fecha_entrega)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Estado</p>
                  <p className="text-sm">{getStatusBadge(tarea.estado, tarea.fecha_entrega)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submission" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Entrega de tarea</CardTitle>
              <CardDescription>
                {entrega
                  ? `Última actualización: ${formatDateTime(entrega.fecha_entrega)}`
                  : "Completa y envía tu tarea antes de la fecha límite"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tarea.estado === "calificada" ? (
                <div className="space-y-4">
                  <div className="rounded-md bg-muted p-4">
                    <h3 className="font-medium mb-2">Tu respuesta:</h3>
                    <p className="whitespace-pre-wrap">{entrega?.contenido || "Sin contenido"}</p>
                  </div>

                  {entrega?.archivo_url && (
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{entrega.archivo_url.split("/").pop()}</span>
                    </div>
                  )}

                  <div className="rounded-md bg-muted p-4">
                    <h3 className="font-medium mb-2">Calificación:</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold">{entrega?.calificacion || "Pendiente"}</span>
                      {entrega?.calificacion && <span className="text-muted-foreground">/ 20</span>}
                    </div>
                    {entrega?.comentario && (
                      <div className="mt-2">
                        <h4 className="text-sm font-medium">Comentario del profesor:</h4>
                        <p className="text-sm text-muted-foreground">{entrega.comentario}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="contenido" className="text-sm font-medium">
                      Tu respuesta
                    </label>
                    <Textarea
                      id="contenido"
                      placeholder="Escribe tu respuesta aquí..."
                      value={contenido}
                      onChange={(e) => setContenido(e.target.value)}
                      rows={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="file" className="text-sm font-medium">
                      Adjuntar archivo (opcional)
                    </label>
                    <div className="flex items-center space-x-2">
                      <Input id="file" type="file" onChange={handleFileChange} />
                    </div>
                    {entrega?.archivo_url && !selectedFile && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>Archivo actual: {entrega.archivo_url.split("/").pop()}</span>
                      </div>
                    )}
                    {selectedFile && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>Nuevo archivo: {selectedFile.name}</span>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || isOverdue(tarea.fecha_entrega)}
                    className="w-full sm:w-auto"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {submitting ? "Enviando..." : entrega ? "Actualizar entrega" : "Enviar tarea"}
                  </Button>

                  {isOverdue(tarea.fecha_entrega) && (
                    <p className="text-sm text-destructive">
                      No puedes entregar esta tarea porque la fecha límite ha pasado.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
