"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { ArrowLeft, Calendar, Check, X, Clock, Save, Filter, Download, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Student {
  id: string
  nombre: string
  apellidos: string
  asistencia?: {
    estado: "presente" | "ausente" | "tardanza" | "justificado"
    hora_entrada?: string
    hora_salida?: string
    observacion?: string
  }
}

interface CourseInfo {
  id: string
  nombre: string
  grado: string
  seccion: string
}

export default function CourseAttendancePage({ params }: { params: { id: string } }) {
  const [students, setStudents] = useState<Student[]>([])
  const [courseInfo, setCourseInfo] = useState<CourseInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"))
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string | "no_registrado">("todos")
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchStudentsAndAttendance() {
      try {
        setLoading(true)
        setError(null)
        setSuccess(null)

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

        // Obtener estudiantes del grupo desde grupo_alumno
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

        console.log("Estudiantes encontrados en grupo_alumno:", groupStudents?.length || 0)

        if (!groupStudents || groupStudents.length === 0) {
          setStudents([])
          setLoading(false)
          return
        }

        // Extraer IDs de estudiantes
        const studentIds = groupStudents.map((item) => item.alumno_id)

        // Obtener detalles de los estudiantes
        const { data: studentsData, error: detailsError } = await supabase
          .from("usuarios")
          .select("id, nombre, apellidos")
          .in("id", studentIds)
          .eq("rol", "alumno")
          .order("apellidos", { ascending: true })

        if (detailsError) {
          console.error("Error al obtener detalles de estudiantes:", detailsError)
          throw detailsError
        }

        console.log("Detalles de estudiantes obtenidos:", studentsData?.length || 0)

        // Obtener asistencia para la fecha seleccionada
        const { data: attendanceData, error: attendanceError } = await supabase
          .from("asistencias")
          .select("*")
          .eq("grupo_id", params.id)
          .eq("fecha", selectedDate)
          .in("estudiante_id", studentIds)

        if (attendanceError) {
          console.error("Error al obtener asistencia:", attendanceError)
          throw attendanceError
        }

        // Combinar datos de estudiantes con asistencia
        const studentsWithAttendance = studentsData.map((student) => {
          const attendance = attendanceData?.find((a) => a.estudiante_id === student.id)
          return {
            ...student,
            asistencia: attendance
              ? {
                  estado: attendance.estado,
                  hora_entrada: attendance.hora_entrada,
                  hora_salida: attendance.hora_salida,
                  observacion: attendance.observacion,
                }
              : undefined,
          }
        })

        setStudents(studentsWithAttendance)

        // Obtener historial de asistencia (últimos 7 días)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const formattedDate = format(sevenDaysAgo, "yyyy-MM-dd")

        const { data: historyData, error: historyError } = await supabase
          .from("asistencias")
          .select(`
            fecha,
            estado,
            estudiante_id
          `)
          .eq("grupo_id", params.id)
          .gte("fecha", formattedDate)
          .order("fecha", { ascending: false })

        if (historyError) {
          console.error("Error al obtener historial de asistencia:", historyError)
          throw historyError
        }

        // Agrupar historial por fecha
        const historyByDate = historyData.reduce((acc: any, curr: any) => {
          if (!acc[curr.fecha]) {
            acc[curr.fecha] = {
              fecha: curr.fecha,
              presente: 0,
              ausente: 0,
              tardanza: 0,
              justificado: 0,
              total: 0,
            }
          }

          acc[curr.fecha][curr.estado]++
          acc[curr.fecha].total++

          return acc
        }, {})

        setAttendanceHistory(Object.values(historyByDate))
      } catch (error: any) {
        console.error("Error:", error)
        setError(error.message || "Error al cargar los datos")
      } finally {
        setLoading(false)
      }
    }

    fetchStudentsAndAttendance()
  }, [params.id, selectedDate, supabase])

  const handleAttendanceChange = (studentId: string, estado: "presente" | "ausente" | "tardanza" | "justificado") => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id === studentId) {
          return {
            ...student,
            asistencia: {
              ...student.asistencia,
              estado,
              hora_entrada: student.asistencia?.hora_entrada || format(new Date(), "HH:mm:ss"),
            },
          }
        }
        return student
      }),
    )
  }

  const handleObservationChange = (studentId: string, observacion: string) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id === studentId) {
          return {
            ...student,
            asistencia: {
              ...student.asistencia,
              observacion,
            },
          }
        }
        return student
      }),
    )
  }

  const saveAttendance = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setError("No hay sesión activa")
        return
      }

      // Preparar datos para guardar
      const attendanceToSave = students
        .filter((student) => student.asistencia)
        .map((student) => ({
          estudiante_id: student.id,
          grupo_id: params.id,
          fecha: selectedDate,
          estado: student.asistencia?.estado || "ausente",
          hora_entrada: student.asistencia?.hora_entrada,
          hora_salida: student.asistencia?.hora_salida,
          observacion: student.asistencia?.observacion,
          registrado_por: session.user.id,
        }))

      if (attendanceToSave.length === 0) {
        setError("No hay asistencia para guardar")
        return
      }

      // Primero eliminar registros existentes para esta fecha y grupo
      const { error: deleteError } = await supabase
        .from("asistencias")
        .delete()
        .eq("grupo_id", params.id)
        .eq("fecha", selectedDate)
        .in(
          "estudiante_id",
          students.filter((s) => s.asistencia).map((s) => s.id),
        )

      if (deleteError) {
        console.error("Error al eliminar registros existentes:", deleteError)
        throw deleteError
      }

      // Guardar nuevos registros
      const { error: insertError } = await supabase.from("asistencias").insert(attendanceToSave)

      if (insertError) {
        console.error("Error al guardar asistencia:", insertError)
        throw insertError
      }

      setSuccess("Asistencia guardada correctamente")
    } catch (error: any) {
      console.error("Error al guardar asistencia:", error)
      setError(error.message || "Error al guardar la asistencia")
    } finally {
      setSaving(false)
    }
  }

  const markAllPresent = () => {
    setStudents((prev) =>
      prev.map((student) => ({
        ...student,
        asistencia: {
          ...student.asistencia,
          estado: "presente",
          hora_entrada: format(new Date(), "HH:mm:ss"),
        },
      })),
    )
  }

  const exportAttendance = () => {
    // Crear contenido CSV
    const headers = ["Nombre", "Apellidos", "Estado", "Hora Entrada", "Hora Salida", "Observación"]
    const csvContent =
      headers.join(",") +
      "\n" +
      students
        .map((student) => {
          return [
            student.nombre,
            student.apellidos,
            student.asistencia?.estado || "No registrado",
            student.asistencia?.hora_entrada || "",
            student.asistencia?.hora_salida || "",
            student.asistencia?.observacion || "",
          ].join(",")
        })
        .join("\n")

    // Crear y descargar el archivo
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `asistencia_${courseInfo?.nombre.replace(/\s+/g, "_")}_${selectedDate.replace(/-/g, "")}.csv`,
    )
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Filtrar estudiantes según la búsqueda y el estado
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.apellidos.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter =
      filterStatus === "todos"
        ? true
        : filterStatus === "no_registrado"
          ? !student.asistencia
          : student.asistencia?.estado === filterStatus

    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error && !students.length) {
    return (
      <div className="container mx-auto">
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button asChild>
          <Link href={`/dashboard/profesor/cursos/${params.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Curso
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
            <Link href={`/dashboard/profesor/cursos/${params.id}`}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-blue-600">Asistencia</h1>
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

        <Tabs defaultValue="register">
          <TabsList>
            <TabsTrigger value="register">Registrar Asistencia</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>

          <TabsContent value="register">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Registro de Asistencia</CardTitle>
                  <CardDescription>
                    Fecha: {format(new Date(selectedDate), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-40"
                  />
                  <Button variant="outline" size="sm" onClick={markAllPresent}>
                    <Check className="h-4 w-4 mr-1" />
                    Todos Presentes
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportAttendance} disabled={students.length === 0}>
                    <Download className="h-4 w-4 mr-1" />
                    Exportar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No hay estudiantes asignados a este curso</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="relative w-64">
                        <Input
                          placeholder="Buscar estudiantes..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8"
                        />
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                      </div>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Filter className="h-4 w-4 mr-1" />
                            Filtrar
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56">
                          <div className="space-y-2">
                            <h4 className="font-medium">Filtrar por estado</h4>
                            <Select
                              value={filterStatus}
                              onValueChange={(value) =>
                                setFilterStatus(
                                  value as
                                    | "todos"
                                    | "presente"
                                    | "ausente"
                                    | "tardanza"
                                    | "justificado"
                                    | "no_registrado",
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Todos los estados" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="todos">Todos</SelectItem>
                                <SelectItem value="presente">Presente</SelectItem>
                                <SelectItem value="ausente">Ausente</SelectItem>
                                <SelectItem value="tardanza">Tardanza</SelectItem>
                                <SelectItem value="justificado">Justificado</SelectItem>
                                <SelectItem value="no_registrado">No registrado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Estudiante</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Hora</TableHead>
                            <TableHead>Observación</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredStudents.map((student) => (
                            <TableRow key={student.id}>
                              <TableCell>
                                <div className="font-medium">{`${student.apellidos}, ${student.nombre}`}</div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant={student.asistencia?.estado === "presente" ? "default" : "outline"}
                                    size="sm"
                                    className="h-8 px-2"
                                    onClick={() => handleAttendanceChange(student.id, "presente")}
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Presente
                                  </Button>
                                  <Button
                                    variant={student.asistencia?.estado === "ausente" ? "default" : "outline"}
                                    size="sm"
                                    className="h-8 px-2"
                                    onClick={() => handleAttendanceChange(student.id, "ausente")}
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Ausente
                                  </Button>
                                  <Button
                                    variant={student.asistencia?.estado === "tardanza" ? "default" : "outline"}
                                    size="sm"
                                    className="h-8 px-2"
                                    onClick={() => handleAttendanceChange(student.id, "tardanza")}
                                  >
                                    <Clock className="h-4 w-4 mr-1" />
                                    Tardanza
                                  </Button>
                                  <Button
                                    variant={student.asistencia?.estado === "justificado" ? "default" : "outline"}
                                    size="sm"
                                    className="h-8 px-2"
                                    onClick={() => handleAttendanceChange(student.id, "justificado")}
                                  >
                                    <Calendar className="h-4 w-4 mr-1" />
                                    Justificado
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell>
                                {student.asistencia?.hora_entrada ? (
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1 text-gray-500" />
                                    {student.asistencia.hora_entrada}
                                  </div>
                                ) : (
                                  "—"
                                )}
                              </TableCell>
                              <TableCell>
                                <Textarea
                                  placeholder="Observación (opcional)"
                                  value={student.asistencia?.observacion || ""}
                                  onChange={(e) => handleObservationChange(student.id, e.target.value)}
                                  className="h-8 min-h-8 resize-none"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={saveAttendance} disabled={saving}>
                        <Save className="h-4 w-4 mr-1" />
                        {saving ? "Guardando..." : "Guardar Asistencia"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Asistencia</CardTitle>
                <CardDescription>Últimos 7 días</CardDescription>
              </CardHeader>
              <CardContent>
                {attendanceHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No hay registros de asistencia en los últimos 7 días</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Presentes</TableHead>
                          <TableHead>Ausentes</TableHead>
                          <TableHead>Tardanzas</TableHead>
                          <TableHead>Justificados</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attendanceHistory.map((day) => (
                          <TableRow key={day.fecha}>
                            <TableCell>{format(new Date(day.fecha), "EEEE, d 'de' MMMM", { locale: es })}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                                {day.presente || 0}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                                {day.ausente || 0}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></div>
                                {day.tardanza || 0}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                                {day.justificado || 0}
                              </div>
                            </TableCell>
                            <TableCell>{day.total}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedDate(day.fecha)}
                                className="h-8"
                              >
                                Ver Detalle
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
