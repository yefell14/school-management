"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { Users, ClipboardCheck, FileText, QrCode, ArrowLeft, Star, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface CourseDetails {
  id: string
  nombre: string
  descripcion: string
  nivel: string
  grado: string
  seccion: string
  año_escolar: string
  estudiantes_count: number
  horario: {
    dia: string
    hora_inicio: string
    hora_fin: string
    aula: string
  }[]
}

export default function CourseDetailsPage({ params }: { params: { id: string } }) {
  const [course, setCourse] = useState<CourseDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchCourseDetails() {
      try {
        // Verificar que el profesor tiene acceso a este grupo
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          setError("No hay sesión activa")
          return
        }

        // Verificar que el profesor está asignado a este grupo
        const { data: profesorGroup, error: profesorError } = await supabase
          .from("grupo_profesor")
          .select("*")
          .eq("profesor_id", session.user.id)
          .eq("grupo_id", params.id)
          .maybeSingle()

        if (profesorError) {
          console.error("Error al verificar acceso del profesor:", profesorError)
          throw profesorError
        }

        if (!profesorGroup) {
          setError("No tienes acceso a este curso")
          return
        }

        // Get course details
        const { data: groupData, error: groupError } = await supabase
          .from("grupos")
          .select(`
            id,
            año_escolar,
            activo,
            cursos:curso_id (
              id,
              nombre,
              descripcion,
              nivel
            ),
            grados:grado_id (
              nombre
            ),
            secciones:seccion_id (
              nombre
            )
          `)
          .eq("id", params.id)
          .single()

        if (groupError) {
          console.error("Error al obtener detalles del grupo:", groupError)
          throw groupError
        }

        // Get student count
        const { count: studentCount, error: countError } = await supabase
          .from("grupo_alumno")
          .select("*", { count: "exact", head: true })
          .eq("grupo_id", params.id)

        if (countError) {
          console.error("Error al obtener conteo de estudiantes:", countError)
        }

        // Get schedule
        const { data: scheduleData, error: scheduleError } = await supabase
          .from("horarios")
          .select("dia, hora_inicio, hora_fin, aula")
          .eq("grupo_id", params.id)
          .order("dia", { ascending: true })

        if (scheduleError) {
          console.error("Error al obtener horario:", scheduleError)
        }

        setCourse({
          id: groupData.id,
          nombre: groupData.cursos.nombre,
          descripcion: groupData.cursos.descripcion || "Sin descripción",
          nivel: groupData.cursos.nivel,
          grado: groupData.grados.nombre,
          seccion: groupData.secciones.nombre,
          año_escolar: groupData.año_escolar,
          estudiantes_count: studentCount || 0,
          horario: scheduleData || [],
        })
      } catch (error: any) {
        console.error("Error fetching course details:", error)
        setError(error.message || "Error al obtener detalles del curso")
      } finally {
        setLoading(false)
      }
    }

    fetchCourseDetails()
  }, [params.id, supabase])

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
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button asChild>
          <Link href="/dashboard/profesor">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Mis Cursos
          </Link>
        </Button>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-red-500 mb-4">No se encontró el curso</p>
        <Button asChild>
          <Link href="/dashboard/profesor">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Mis Cursos
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href="/dashboard/profesor">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-blue-600">{course.nombre}</h1>
          <div className="ml-4 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md">
            {`${course.grado} ${course.seccion}`}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Información del Curso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700">Descripción</h3>
                <p className="mt-1 text-gray-600">{course.descripcion}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-700">Nivel</h3>
                  <p className="mt-1 text-gray-600 capitalize">{course.nivel}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Año Escolar</h3>
                  <p className="mt-1 text-gray-600">{course.año_escolar}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-700">Horario</h3>
                <div className="mt-2 space-y-2">
                  {course.horario.map((schedule, index) => (
                    <div key={index} className="flex items-center p-2 bg-gray-50 rounded-md">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="capitalize">{schedule.dia}</span>
                      <span className="mx-2">•</span>
                      <span>{`${schedule.hora_inicio} - ${schedule.hora_fin}`}</span>
                      <span className="mx-2">•</span>
                      <span>Aula: {schedule.aula || "No asignada"}</span>
                    </div>
                  ))}

                  {course.horario.length === 0 && <p className="text-gray-500">No hay horarios asignados</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/dashboard/profesor/cursos/${course.id}/estudiantes`}>
                  <Users className="h-4 w-4 mr-2" />
                  Estudiantes ({course.estudiantes_count})
                </Link>
              </Button>

              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/dashboard/profesor/cursos/${course.id}/asistencia`}>
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Marcar Asistencia
                </Link>
              </Button>

              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/dashboard/profesor/cursos/${course.id}/tareas`}>
                  <FileText className="h-4 w-4 mr-2" />
                  Tareas y Evaluaciones
                </Link>
              </Button>

              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/dashboard/profesor/cursos/${course.id}/calificaciones`}>
                  <Star className="h-4 w-4 mr-2" />
                  Calificaciones
                </Link>
              </Button>

              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/dashboard/profesor/cursos/${course.id}/qr`}>
                  <QrCode className="h-4 w-4 mr-2" />
                  QR del Curso
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="students" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="students">Estudiantes</TabsTrigger>
            <TabsTrigger value="attendance">Asistencia</TabsTrigger>
            <TabsTrigger value="assignments">Tareas</TabsTrigger>
            <TabsTrigger value="grades">Calificaciones</TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Estudiantes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">Haga clic en "Estudiantes" para ver la lista completa</p>
                  <Button className="mt-4" asChild>
                    <Link href={`/dashboard/profesor/cursos/${course.id}/estudiantes`}>Ver Estudiantes</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>Registro de Asistencia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <ClipboardCheck className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">Haga clic en "Marcar Asistencia" para registrar la asistencia de hoy</p>
                  <Button className="mt-4" asChild>
                    <Link href={`/dashboard/profesor/cursos/${course.id}/asistencia`}>Marcar Asistencia</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments">
            <Card>
              <CardHeader>
                <CardTitle>Tareas y Evaluaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">
                    Haga clic en "Tareas y Evaluaciones" para gestionar las actividades del curso
                  </p>
                  <Button className="mt-4" asChild>
                    <Link href={`/dashboard/profesor/cursos/${course.id}/tareas`}>Gestionar Tareas</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grades">
            <Card>
              <CardHeader>
                <CardTitle>Calificaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Star className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">
                    Haga clic en "Calificaciones" para gestionar las notas de los estudiantes
                  </p>
                  <Button className="mt-4" asChild>
                    <Link href={`/dashboard/profesor/cursos/${course.id}/calificaciones`}>
                      Gestionar Calificaciones
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
