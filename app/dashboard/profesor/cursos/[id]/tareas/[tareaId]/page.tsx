"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { ArrowLeft, Calendar, Download, ExternalLink, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { format, parseISO, isAfter } from "date-fns"
import { es } from "date-fns/locale"

interface Task {
  id: string
  titulo: string
  descripcion: string
  fecha_asignacion: string
  fecha_entrega: string
  estado: "pendiente" | "completada" | "calificada"
  creado_por: string
}

interface Submission {
  id: string
  alumno_id: string
  fecha_entrega: string
  contenido: string | null
  archivo_url: string | null
  calificacion: number | null
  comentario: string | null
  alumno: {
    nombre: string
    apellidos: string
  }
}

interface CourseInfo {
  id: string
  nombre: string
  grado: string
  seccion: string
}

export default function TaskDetailPage({ params }: { params: { id: string; tareaId: string } }) {
  const [task, setTask] = useState<Task | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [courseInfo, setCourseInfo] = useState<CourseInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [editingGrades, setEditingGrades] = useState<Record<string, { calificacion: number; comentario: string }>>({})
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchTaskDetails() {
      try {
        setLoading(true)
        setError(null)

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

        // Obtener información del curso
        const { data: groupData, error: groupError } = await supabase
          .from("grupos")
          .select(`
            id,
            cursos:curso_id (nombre),
            grados:grado_id (nombre),
            secciones:seccion_id (nombre)
          `)
          .eq("id", params.id)
          .single()

        if (groupError) {
          console.error("Error al obtener información del curso:", groupError)
          throw groupError
        }

        setCourseInfo({
          id: groupData.id,
          nombre: groupData.cursos.nombre,
          grado: groupData.grados.nombre,
          seccion: groupData.secciones.nombre,
        })

        // Obtener detalles de la tarea
        const { data: taskData, error: taskError } = await supabase
          .from("tareas")
          .select("*")
          .eq("id", params.tareaId)
          .single()

        if (taskError) {
          console.error("Error al obtener detalles de la tarea:", taskError)
          throw taskError
        }

        setTask(taskData)

        // Obtener estudiantes del grupo
        const { data: groupStudents, error: studentsError } = await supabase
          .from("grupo_alumno")
          .select(`
            alumno_id
          `)
          .eq("grupo_id", params.id)

        if (studentsError) {
          console.error("Error al obtener estudiantes del grupo:", studentsError)
          throw studentsError
        }

        if (!groupStudents || groupStudents.length === 0) {
          setSubmissions([])
          return
        }

        // Extraer IDs de estudiantes
        const studentIds = groupStudents.map((item) => item.alumno_id)

        // Obtener entregas de la tarea
        const { data: submissionsData, error: submissionsError } = await supabase
          .from("entregas_tareas")
          .select(`
            id,
            tarea_id,
            alumno_id,
            fecha_entrega,
            contenido,
            archivo_url,
            calificacion,
            comentario,
            alumno:alumno_id (
              nombre,
              apellidos
            )
          `)
          .eq("tarea_id", params.tareaId)

        if (submissionsError) {
          console.error("Error al obtener entregas:", submissionsError)
          throw submissionsError
        }

        // Crear lista de entregas, incluyendo estudiantes sin entregas
        const allStudents = await supabase
          .from("usuarios")
          .select("id, nombre, apellidos")
          .in("id", studentIds)
          .eq("rol", "alumno")
          .order("apellidos", { ascending: true })

        if (allStudents.error) {
          console.error("Error al obtener estudiantes:", allStudents.error)
          throw allStudents.error
        }

        const allSubmissions: Submission[] = []

        // Agregar estudiantes con entregas
        submissionsData?.forEach((submission) => {
          allSubmissions.push({
            id: submission.id,
            alumno_id: submission.alumno_id,
            fecha_entrega: submission.fecha_entrega,
            contenido: submission.contenido,
            archivo_url: submission.archivo_url,
            calificacion: submission.calificacion,
            comentario: submission.comentario,
            alumno: {
              nombre: submission.alumno.nombre,
              apellidos: submission.alumno.apellidos,
            },
          })
        })

        // Agregar estudiantes sin entregas
        allStudents.data?.forEach((student) => {
          if (!allSubmissions.some((s) => s.alumno_id === student.id)) {
            allSubmissions.push({
              id: "",
              alumno_id: student.id,
              fecha_entrega: "",
              contenido: null,
              archivo_url: null,
              calificacion: null,
              comentario: null,
              alumno: {
                nombre: student.nombre,
                apellidos: student.apellidos,
              },
            })
          }
        })

        // Ordenar por apellidos
        allSubmissions.sort((a, b) => a.alumno.apellidos.localeCompare(b.alumno.apellidos))

        setSubmissions(allSubmissions)
      } catch (error: any) {
        console.error("Error:", error)
        setError(error.message || "Error al cargar los datos")
      } finally {
        setLoading(false)
      }
    }

    fetchTaskDetails()
  }, [params.id, params.tareaId, supabase])

  const handleGradeChange = (submissionId: string, field: "calificacion" | "comentario", value: string | number) => {
    setEditingGrades((prev) => ({
      ...prev,
      [submissionId]: {
        ...prev[submissionId],
        [field]: value,
      },
    }))
  }

  const saveGrades = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const gradesToUpdate = Object.entries(editingGrades).map(([id, data]) => ({
        id,
        calificacion: data.calificacion,
        comentario: data.comentario,
      }))

      if (gradesToUpdate.length === 0) {
        setError("No hay calificaciones para guardar")
        return
      }

      // Actualizar calificaciones
      for (const grade of gradesToUpdate) {
        const { error: updateError } = await supabase
          .from("entregas_tareas")
          .update({
            calificacion: grade.calificacion,
            comentario: grade.comentario,
          })
          .eq("id", grade.id)

        if (updateError) {
          console.error("Error al actualizar calificación:", updateError)
          throw updateError
        }
      }

      // Actualizar estado de la tarea si todas las entregas están calificadas
      const allSubmissionsWithId = submissions.filter((s) => s.id)
      const allGraded = allSubmissionsWithId.every(
        (s) => s.calificacion !== null || editingGrades[s.id]?.calificacion !== undefined,
      )

      if (allGraded && task) {
        const { error: taskUpdateError } = await supabase
          .from("tareas")
          .update({ estado: "calificada" })
          .eq("id", task.id)

        if (taskUpdateError) {
          console.error("Error al actualizar estado de la tarea:", taskUpdateError)
          throw taskUpdateError
        }

        setTask({ ...task, estado: "calificada" })
      }

      setSuccess("Calificaciones guardadas correctamente")
      setEditingGrades({})

      // Recargar entregas
      const { data: updatedSubmissions, error: reloadError } = await supabase
        .from("entregas_tareas")
        .select(`
          id,
          tarea_id,
          alumno_id,
          fecha_entrega,
          contenido,
          archivo_url,
          calificacion,
          comentario,
          alumno:alumno_id (
            nombre,
            apellidos
          )
        `)
        .eq("tarea_id", params.tareaId)

      if (reloadError) {
        console.error("Error al recargar entregas:", reloadError)
        throw reloadError
      }

      // Actualizar entregas en el estado
      const updatedSubmissionsList = [...submissions]
      updatedSubmissions?.forEach((updated) => {
        const index = updatedSubmissionsList.findIndex((s) => s.id === updated.id)
        if (index !== -1) {
          updatedSubmissionsList[index] = {
            ...updatedSubmissionsList[index],
            calificacion: updated.calificacion,
            comentario: updated.comentario,
          }
        }
      })

      setSubmissions(updatedSubmissionsList)
    } catch (error: any) {
      console.error("Error:", error)
      setError(error.message || "Error al guardar las calificaciones")
    } finally {
      setSaving(false)
    }
  }

  const exportSubmissions = () => {
    // Crear contenido CSV
    const headers = ["Estudiante", "Estado", "Fecha Entrega", "Calificación", "Comentario"]
    const csvContent =
      headers.join(",") +
      "\n" +
      submissions
        .map((submission) => {
          const estado = submission.id ? "Entregado" : "No entregado"
          return [
            `${submission.alumno.apellidos}, ${submission.alumno.nombre}`,
            estado,
            submission.fecha_entrega ? format(parseISO(submission.fecha_entrega), "dd/MM/yyyy HH:mm") : "",
            submission.calificacion !== null ? submission.calificacion : "",
            submission.comentario ? `"${submission.comentario.replace(/"/g, '""')}"` : "",
          ].join(",")
        })
        .join("\n")

    // Crear y descargar el archivo
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `entregas_${task?.titulo.replace(/\s+/g, "_")}_${format(new Date(), "yyyyMMdd")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error && !task) {
    return (
      <div className="container mx-auto">
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button asChild>
          <Link href={`/dashboard/profesor/cursos/${params.id}/tareas`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Tareas
          </Link>
        </Button>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="container mx-auto">
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>No se encontró la tarea solicitada</AlertDescription>
        </Alert>
        <Button asChild>
          <Link href={`/dashboard/profesor/cursos/${params.id}/tareas`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Tareas
          </Link>
        </Button>
      </div>
    )
  }

  const isOverdue = !isAfter(parseISO(task.fecha_entrega), new Date())
  const submittedCount = submissions.filter((s) => s.id).length
  const gradedCount = submissions.filter((s) => s.calificacion !== null).length

  return (
    <div className="container mx-auto">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href={`/dashboard/profesor/cursos/${params.id}/tareas`}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-blue-600">Detalle de Tarea</h1>
          {courseInfo && (
            <div className="ml-4 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md">
              {`${courseInfo.nombre} - ${courseInfo.grado} ${courseInfo.seccion}`}
            </div>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert variant="default" className="bg-green-50 border-green-500 text-green-700">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{task.titulo}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                    Fecha de entrega:{" "}
                    {format(parseISO(task.fecha_entrega), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
                    {isOverdue && (
                      <Badge variant="destructive" className="ml-2">
                        Vencida
                      </Badge>
                    )}
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    task.estado === "pendiente" ? "outline" : task.estado === "completada" ? "secondary" : "default"
                  }
                >
                  {task.estado === "pendiente"
                    ? "Pendiente"
                    : task.estado === "completada"
                      ? "Completada"
                      : "Calificada"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <h3 className="text-lg font-medium mb-2">Descripción</h3>
                <div className="whitespace-pre-wrap">{task.descripcion}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumen de Entregas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Estudiantes</div>
                  <div className="text-2xl font-bold">{submissions.length}</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Entregas</div>
                  <div className="text-2xl font-bold">{submittedCount}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Calificadas</div>
                  <div className="text-2xl font-bold">{gradedCount}</div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Pendientes</div>
                  <div className="text-2xl font-bold">{submissions.length - submittedCount}</div>
                </div>
              </div>

              <div className="pt-2">
                <Button variant="outline" className="w-full" onClick={exportSubmissions}>
                  <Download className="h-4 w-4 mr-1" />
                  Exportar Entregas
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="submissions">
          <TabsList>
            <TabsTrigger value="submissions">Entregas</TabsTrigger>
            <TabsTrigger value="grades">Calificaciones</TabsTrigger>
          </TabsList>

          <TabsContent value="submissions">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Entregas</CardTitle>
                <CardDescription>
                  {submittedCount} de {submissions.length} estudiantes han entregado la tarea
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Estudiante</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha de Entrega</TableHead>
                        <TableHead>Contenido</TableHead>
                        <TableHead>Archivo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((submission) => (
                        <TableRow key={submission.alumno_id}>
                          <TableCell className="font-medium">
                            {`${submission.alumno.apellidos}, ${submission.alumno.nombre}`}
                          </TableCell>
                          <TableCell>
                            {submission.id ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                Entregado
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-700">
                                No entregado
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {submission.fecha_entrega
                              ? format(parseISO(submission.fecha_entrega), "dd/MM/yyyy HH:mm")
                              : "—"}
                          </TableCell>
                          <TableCell>
                            {submission.contenido ? (
                              <div className="max-w-xs truncate">{submission.contenido}</div>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell>
                            {submission.archivo_url ? (
                              <Button variant="ghost" size="sm" asChild>
                                <a href={submission.archivo_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  Ver archivo
                                </a>
                              </Button>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grades">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Calificaciones</CardTitle>
                  <CardDescription>
                    {gradedCount} de {submittedCount} entregas han sido calificadas
                  </CardDescription>
                </div>
                <Button onClick={saveGrades} disabled={saving || Object.keys(editingGrades).length === 0}>
                  <Star className="h-4 w-4 mr-1" />
                  {saving ? "Guardando..." : "Guardar Calificaciones"}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Estudiante</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha de Entrega</TableHead>
                        <TableHead>Calificación</TableHead>
                        <TableHead>Comentario</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((submission) => (
                        <TableRow key={submission.alumno_id}>
                          <TableCell className="font-medium">
                            {`${submission.alumno.apellidos}, ${submission.alumno.nombre}`}
                          </TableCell>
                          <TableCell>
                            {submission.id ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                Entregado
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-700">
                                No entregado
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {submission.fecha_entrega
                              ? format(parseISO(submission.fecha_entrega), "dd/MM/yyyy HH:mm")
                              : "—"}
                          </TableCell>
                          <TableCell>
                            {submission.id ? (
                              <Input
                                type="number"
                                min="0"
                                max="20"
                                step="0.1"
                                className="w-20 h-8"
                                value={
                                  editingGrades[submission.id]?.calificacion !== undefined
                                    ? editingGrades[submission.id].calificacion
                                    : submission.calificacion || ""
                                }
                                onChange={(e) =>
                                  handleGradeChange(
                                    submission.id,
                                    "calificacion",
                                    e.target.value ? Number.parseFloat(e.target.value) : "",
                                  )
                                }
                              />
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell>
                            {submission.id ? (
                              <Textarea
                                className="min-h-8 h-20 resize-none"
                                placeholder="Comentario (opcional)"
                                value={
                                  editingGrades[submission.id]?.comentario !== undefined
                                    ? editingGrades[submission.id].comentario
                                    : submission.comentario || ""
                                }
                                onChange={(e) => handleGradeChange(submission.id, "comentario", e.target.value)}
                              />
                            ) : (
                              "—"
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveGrades} disabled={saving || Object.keys(editingGrades).length === 0}>
                  <Star className="h-4 w-4 mr-1" />
                  {saving ? "Guardando..." : "Guardar Calificaciones"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
