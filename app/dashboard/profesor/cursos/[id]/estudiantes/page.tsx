"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { ArrowLeft, Search, Download, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Student {
  id: string
  nombre: string
  apellidos: string
  email: string
  dni: string | null
  telefono: string | null
  grado: string | null
  seccion: string | null
}

interface CourseInfo {
  nombre: string
  grado: string
  seccion: string
}

export default function CourseStudentsPage({ params }: { params: { id: string } }) {
  const [students, setStudents] = useState<Student[]>([])
  const [courseInfo, setCourseInfo] = useState<CourseInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchStudents() {
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

        // Obtener información del curso
        const { data: groupData, error: groupError } = await supabase
          .from("grupos")
          .select(`
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
          nombre: groupData.cursos.nombre,
          grado: groupData.grados.nombre,
          seccion: groupData.secciones.nombre,
        })

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
          setStudents([])
          setLoading(false)
          return
        }

        // Extraer IDs de estudiantes
        const studentIds = groupStudents.map((item) => item.alumno_id)

        // Obtener detalles de los estudiantes
        const { data: studentsData, error: detailsError } = await supabase
          .from("usuarios")
          .select("id, nombre, apellidos, email, dni, telefono, grado, seccion")
          .in("id", studentIds)
          .eq("rol", "alumno")
          .order("apellidos", { ascending: true })

        if (detailsError) {
          console.error("Error al obtener detalles de estudiantes:", detailsError)
          throw detailsError
        }

        setStudents(studentsData || [])
      } catch (error: any) {
        console.error("Error fetching students:", error)
        setError(error.message || "Error al obtener los estudiantes")
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [params.id, supabase])

  // Filtrar estudiantes según la búsqueda
  const filteredStudents = students.filter(
    (student) =>
      student.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.apellidos.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.dni && student.dni.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const exportToCSV = () => {
    if (students.length === 0) return

    // Crear contenido CSV
    const headers = ["Nombre", "Apellidos", "Email", "DNI", "Teléfono"]
    const csvContent =
      headers.join(",") +
      "\n" +
      students
        .map((student) => {
          return [student.nombre, student.apellidos, student.email, student.dni || "", student.telefono || ""].join(",")
        })
        .join("\n")

    // Crear y descargar el archivo
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `estudiantes_${courseInfo?.nombre.replace(/\s+/g, "_")}.csv`)
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
          <h1 className="text-3xl font-bold text-blue-600">Estudiantes</h1>
          {courseInfo && (
            <div className="ml-4 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md">
              {`${courseInfo.nombre} - ${courseInfo.grado} ${courseInfo.seccion}`}
            </div>
          )}
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Lista de Estudiantes</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar estudiantes..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" onClick={exportToCSV} disabled={students.length === 0}>
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
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Apellidos</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>DNI</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.nombre}</TableCell>
                        <TableCell>{student.apellidos}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.dni || "—"}</TableCell>
                        <TableCell>{student.telefono || "—"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="icon" title="Enviar correo">
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Llamar">
                              <Phone className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
