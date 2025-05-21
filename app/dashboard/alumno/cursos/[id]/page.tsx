"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase, type Grupo, type Tarea, type Usuario } from "@/lib/supabase"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, ClipboardList, QrCode } from "lucide-react"
import Link from "next/link"

export default function CursoDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const [curso, setCurso] = useState<
    | (Grupo & {
        curso: { nombre: string; descripcion: string | null }
        grado: { nombre: string }
        seccion: { nombre: string }
      })
    | null
  >(null)
  const [profesor, setProfesor] = useState<Usuario | null>(null)
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [compañeros, setCompañeros] = useState<Usuario[]>([])
  const [horarios, setHorarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCursoDetails = async () => {
      if (!user) return

      try {
        // Fetch course details
        const { data: grupoData, error: grupoError } = await supabase
          .from("grupos")
          .select(`
            id,
            año_escolar,
            curso:cursos(id, nombre, descripcion),
            grado:grados(id, nombre),
            seccion:secciones(id, nombre)
          `)
          .eq("id", params.id)
          .single()

        if (grupoError) throw grupoError
        setCurso(grupoData as any)

        // Fetch professor
        const { data: profesorData, error: profesorError } = await supabase
          .from("grupo_profesor")
          .select(`
            profesor:profesor_id(id, nombre, apellidos, email)
          `)
          .eq("grupo_id", params.id)
          .single()

        if (!profesorError && profesorData) {
          setProfesor(profesorData.profesor as Usuario)
        }

        // Fetch tasks
        const { data: tareasData, error: tareasError } = await supabase
          .from("tareas")
          .select("*")
          .eq("grupo_id", params.id)
          .order("fecha_entrega", { ascending: false })

        if (!tareasError) {
          setTareas(tareasData)
        }

        // Fetch classmates
        const { data: compañerosData, error: compañerosError } = await supabase
          .from("grupo_alumno")
          .select(`
            alumno:alumno_id(id, nombre, apellidos)
          `)
          .eq("grupo_id", params.id)

        if (!compañerosError) {
          setCompañeros(compañerosData.map((item) => item.alumno) as Usuario[])
        }

        // Fetch schedule
        const { data: horariosData, error: horariosError } = await supabase
          .from("horarios")
          .select("*")
          .eq("grupo_id", params.id)
          .order("dia", { ascending: true })
          .order("hora_inicio", { ascending: true })

        if (!horariosError) {
          setHorarios(horariosData)
        }
      } catch (error) {
        console.error("Error fetching course details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCursoDetails()
  }, [user, params.id])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!curso) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <h2 className="text-2xl font-bold">Curso no encontrado</h2>
        <p className="text-muted-foreground">El curso que buscas no existe o no tienes acceso</p>
        <Link href="/alumno/cursos">
          <Button className="mt-4">Volver a mis cursos</Button>
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

  const diasOrden = {
    lunes: 1,
    martes: 2,
    miércoles: 3,
    jueves: 4,
    viernes: 5,
    sábado: 6,
    domingo: 7,
  }

  const formatDia = (dia: string) => {
    return dia.charAt(0).toUpperCase() + dia.slice(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <Link href="/alumno/cursos">
            <Button variant="ghost" size="sm">
              ← Volver
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{curso.curso.nombre}</h1>
        </div>
        <p className="text-muted-foreground">
          {curso.grado.nombre} - {curso.seccion.nombre} | Año escolar: {curso.año_escolar}
        </p>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="schedule">Horario</TabsTrigger>
          <TabsTrigger value="tasks">Tareas</TabsTrigger>
          <TabsTrigger value="students">Compañeros</TabsTrigger>
          <TabsTrigger value="attendance">Asistencia</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información del curso</CardTitle>
              <CardDescription>Detalles generales del curso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold">Descripción</h3>
                <p className="text-sm text-muted-foreground">
                  {curso.curso.descripcion || "Este curso no tiene una descripción disponible."}
                </p>
              </div>

              {profesor && (
                <div>
                  <h3 className="font-semibold">Profesor</h3>
                  <div className="mt-2 flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback>
                        {profesor.nombre.charAt(0)}
                        {profesor.apellidos.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {profesor.nombre} {profesor.apellidos}
                      </p>
                      <p className="text-xs text-muted-foreground">{profesor.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Horario de clases</CardTitle>
              <CardDescription>Horario semanal del curso</CardDescription>
            </CardHeader>
            <CardContent>
              {horarios.length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(
                    horarios.reduce(
                      (acc, horario) => {
                        if (!acc[horario.dia]) {
                          acc[horario.dia] = []
                        }
                        acc[horario.dia].push(horario)
                        return acc
                      },
                      {} as Record<string, any[]>,
                    ),
                  )
                    .sort(
                      ([diaA], [diaB]) =>
                        diasOrden[diaA as keyof typeof diasOrden] - diasOrden[diaB as keyof typeof diasOrden],
                    )
                    .map(([dia, horariosDia]) => (
                      <div key={dia} className="rounded-lg border p-4">
                        <h3 className="mb-2 font-semibold">{formatDia(dia)}</h3>
                        <div className="space-y-2">
                          {horariosDia.map((horario) => (
                            <div
                              key={horario.id}
                              className="flex items-center justify-between rounded-md bg-muted p-2 text-sm"
                            >
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {horario.hora_inicio} - {horario.hora_fin}
                                </span>
                              </div>
                              <div>Aula: {horario.aula || "No especificada"}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No hay horarios disponibles para este curso</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tareas asignadas</CardTitle>
              <CardDescription>Listado de tareas del curso</CardDescription>
            </CardHeader>
            <CardContent>
              {tareas.length > 0 ? (
                <div className="space-y-4">
                  {tareas.map((tarea) => (
                    <div key={tarea.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-1">
                        <p className="font-medium">{tarea.titulo}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <ClipboardList className="mr-1 h-4 w-4" />
                          <span>Fecha de entrega: {formatDate(tarea.fecha_entrega)}</span>
                        </div>
                        <div className="flex items-center">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              tarea.estado === "pendiente"
                                ? "bg-yellow-100 text-yellow-800"
                                : tarea.estado === "completada"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {tarea.estado === "pendiente"
                              ? "Pendiente"
                              : tarea.estado === "completada"
                                ? "Completada"
                                : "Calificada"}
                          </span>
                        </div>
                      </div>
                      <Link href={`/dashboard/alumno/tareas/${tarea.id}`}>
                        <Button variant="outline" size="sm">
                          Ver tarea
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No hay tareas asignadas para este curso</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compañeros de clase</CardTitle>
              <CardDescription>Estudiantes inscritos en este curso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {compañeros.map((compañero) => (
                  <div key={compañero.id} className="flex items-center space-x-4 rounded-lg border p-3">
                    <Avatar>
                      <AvatarFallback>
                        {compañero.nombre.charAt(0)}
                        {compañero.apellidos.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {compañero.nombre} {compañero.apellidos}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Marcar asistencia</CardTitle>
              <CardDescription>Escanea el código QR para registrar tu asistencia</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-4 p-6">
              <div className="rounded-lg border border-dashed p-8">
                <QrCode className="h-32 w-32 text-muted-foreground" />
              </div>
              <Button>Escanear código QR</Button>
              <p className="text-center text-sm text-muted-foreground">
                Solicita a tu profesor que genere un código QR para marcar tu asistencia a la clase
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
