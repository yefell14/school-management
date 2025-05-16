"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { BookOpen, Users, ClipboardCheck, Search, FileText, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Course {
  id: string
  nombre: string
  grado: string
  seccion: string
  nivel: string
  estudiantes_count: number
  horario: {
    dia: string
    hora_inicio: string
    hora_fin: string
  }[]
}

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [activeCourses, setActiveCourses] = useState<Course[]>([])
  const [previousCourses, setPreviousCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchCourses() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) return

        console.log("Obteniendo cursos para el profesor ID:", session.user.id)

        // Buscar en la tabla grupo_profesor para obtener los grupos asignados al profesor
        const { data: profesorGroups, error: profesorError } = await supabase
          .from("grupo_profesor")
          .select(`
            grupo_id
          `)
          .eq("profesor_id", session.user.id)

        if (profesorError) {
          console.error("Error al obtener grupos del profesor:", profesorError)
          throw profesorError
        }

        console.log("Grupos encontrados para el profesor:", profesorGroups?.length || 0)

        if (!profesorGroups || profesorGroups.length === 0) {
          setError("No se encontraron cursos asignados a este profesor")
          setLoading(false)
          return
        }

        // Extraer los IDs de los grupos
        const groupIds = profesorGroups.map((item) => item.grupo_id)

        // Obtener detalles de los grupos
        const { data: groupsData, error: groupsError } = await supabase
          .from("grupos")
          .select(`
            id,
            año_escolar,
            activo,
            cursos:curso_id (
              id,
              nombre,
              nivel
            ),
            grados:grado_id (
              nombre
            ),
            secciones:seccion_id (
              nombre
            )
          `)
          .in("id", groupIds)

        if (groupsError) {
          console.error("Error al obtener detalles de los grupos:", groupsError)
          throw groupsError
        }

        console.log("Detalles de grupos obtenidos:", groupsData?.length || 0)

        // Get student count and schedule for each group
        const coursesWithDetails = await Promise.all(
          groupsData.map(async (group) => {
            // Obtener el número de estudiantes para cada grupo
            const { count: studentCount, error: countError } = await supabase
              .from("grupo_alumno")
              .select("*", { count: "exact", head: true })
              .eq("grupo_id", group.id)

            if (countError) {
              console.error("Error al obtener conteo de estudiantes:", countError)
            }

            // Obtener el horario para cada grupo
            const { data: scheduleData, error: scheduleError } = await supabase
              .from("horarios")
              .select("dia, hora_inicio, hora_fin")
              .eq("grupo_id", group.id)

            if (scheduleError) {
              console.error("Error al obtener horario:", scheduleError)
            }

            return {
              id: group.id,
              nombre: group.cursos.nombre,
              grado: group.grados.nombre,
              seccion: group.secciones.nombre,
              nivel: group.cursos.nivel,
              año_escolar: group.año_escolar,
              activo: group.activo,
              estudiantes_count: studentCount || 0,
              horario: scheduleData || [],
            }
          }),
        )

        // Separate active and previous courses
        const active = coursesWithDetails.filter((course) => course.activo)
        const previous = coursesWithDetails.filter((course) => !course.activo)

        console.log("Cursos activos:", active.length)
        console.log("Cursos anteriores:", previous.length)

        setCourses(coursesWithDetails)
        setActiveCourses(active)
        setPreviousCourses(previous)
      } catch (error: any) {
        console.error("Error fetching courses:", error)
        setError(error.message || "Error al obtener los cursos")
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [supabase])

  // Filter courses based on search query
  const filteredActiveCourses = activeCourses.filter(
    (course) =>
      course.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${course.grado} ${course.seccion}`.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <BookOpen className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-xl text-gray-500">No se encontraron cursos asignados</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-blue-600">Mis Cursos</h1>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar cursos..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="active">Cursos Activos</TabsTrigger>
            <TabsTrigger value="previous">Cursos Anteriores</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {filteredActiveCourses.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">No se encontraron cursos activos</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredActiveCourses.map((course) => (
                  <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader className="bg-blue-50 pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                          <CardTitle className="text-xl">{course.nombre}</CardTitle>
                        </div>
                        <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                          {`${course.grado} ${course.seccion}`}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="flex items-center mb-3">
                        <Users className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">{course.estudiantes_count} estudiantes</span>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-500">Horario:</p>
                        <div className="text-sm">
                          {course.horario.map((schedule, index) => (
                            <div key={index} className="text-gray-600">
                              {`${schedule.dia}, ${schedule.hora_inicio} - ${schedule.hora_fin}`}
                            </div>
                          ))}
                          {course.horario.length === 0 && <div className="text-gray-600">No hay horario asignado</div>}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <Button variant="outline" size="sm" className="flex items-center justify-center" asChild>
                          <Link href={`/dashboard/profesor/cursos/${course.id}/estudiantes`}>
                            <Users className="h-4 w-4 mr-1" />
                            Estudiantes
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center justify-center" asChild>
                          <Link href={`/dashboard/profesor/cursos/${course.id}/asistencia`}>
                            <ClipboardCheck className="h-4 w-4 mr-1" />
                            Asistencia
                          </Link>
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <Button variant="outline" size="sm" className="flex items-center justify-center" asChild>
                          <Link href={`/dashboard/profesor/cursos/${course.id}/tareas`}>
                            <FileText className="h-4 w-4 mr-1" />
                            Tareas
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center justify-center" asChild>
                          <Link href={`/dashboard/profesor/cursos/${course.id}/qr`}>
                            <QrCode className="h-4 w-4 mr-1" />
                            QR Curso
                          </Link>
                        </Button>
                      </div>

                      <Button className="w-full mt-4" asChild>
                        <Link href={`/dashboard/profesor/cursos/${course.id}`}>Ver Detalles</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="previous">
            {previousCourses.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">No se encontraron cursos anteriores</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {previousCourses.map((course) => (
                  <Card key={course.id} className="overflow-hidden opacity-75 hover:opacity-100 transition-opacity">
                    <CardHeader className="bg-gray-100 pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-5 w-5 text-gray-600" />
                          <CardTitle className="text-xl">{course.nombre}</CardTitle>
                        </div>
                        <div className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-md">
                          {`${course.grado} ${course.seccion}`}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="flex items-center mb-3">
                        <Users className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">{course.estudiantes_count} estudiantes</span>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-500">Año escolar:</p>
                        <div className="text-sm text-gray-600">{course.año_escolar}</div>
                      </div>

                      <Button variant="outline" className="w-full mt-2" asChild>
                        <Link href={`/dashboard/profesor/cursos/${course.id}`}>Ver Historial</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
