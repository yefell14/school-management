"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { ArrowLeft, Plus, Search, Download, Edit, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"

interface Student {
  id: string
  nombre: string
  apellidos: string
}

interface Grade {
  id: string
  alumno_id: string
  tipo: string
  descripcion: string
  nota: number
  ponderacion: number
  comentario: string | null
  fecha: string
  periodo: string
}

interface CourseInfo {
  id: string
  curso_id: string
  nombre: string
  grado: string
  seccion: string
}

export default function CourseGradesPage({ params }: { params: { id: string } }) {
  const [students, setStudents] = useState<Student[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [courseInfo, setCourseInfo] = useState<CourseInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPeriod, setSelectedPeriod] = useState<string>("Trimestre 1")
  const [selectedGradeType, setSelectedGradeType] = useState<string>("examen")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null)
  const [editMode, setEditMode] = useState<boolean>(false)
  const [editingGrades, setEditingGrades] = useState<Record<string, number>>({})
  const [newGrade, setNewGrade] = useState({
    tipo: "examen",
    descripcion: "",
    ponderacion: 1,
    periodo: "Trimestre 1",
    fecha: format(new Date(), "yyyy-MM-dd"),
  })
  const supabase = createClientComponentClient()

  const periods = ["Trimestre 1", "Trimestre 2", "Trimestre 3", "Final"]
  const gradeTypes = [
    { value: "examen", label: "Examen" },
    { value: "tarea", label: "Tarea" },
    { value: "proyecto", label: "Proyecto" },
    { value: "participacion", label: "Participación" },
    { value: "practica", label: "Práctica" },
  ]

  useEffect(() => {
    async function fetchStudentsAndGrades() {
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
            curso_id,
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
          curso_id: groupData.curso_id,
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

        setStudents(studentsData)

        // Obtener calificaciones para el periodo seleccionado
        const { data: gradesData, error: gradesError } = await supabase
          .from("calificaciones")
          .select("*")
          .eq("grupo_id", params.id)
          .eq("periodo", selectedPeriod)
          .in("alumno_id", studentIds)
          .order("fecha", { ascending: false })

        if (gradesError) {
          console.error("Error al obtener calificaciones:", gradesError)
          throw gradesError
        }

        setGrades(gradesData || [])
      } catch (error: any) {
        console.error("Error:", error)
        setError(error.message || "Error al cargar los datos")
      } finally {
        setLoading(false)
      }
    }

    fetchStudentsAndGrades()
  }, [params.id, selectedPeriod, supabase])

  const handleCreateGrade = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      if (!newGrade.descripcion) {
        setError("Por favor ingrese una descripción para la calificación")
        return
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setError("No hay sesión activa")
        return
      }

      if (!courseInfo) {
        setError("No se ha cargado la información del curso")
        return
      }

      // Crear calificaciones para todos los estudiantes
      const gradesToCreate = students.map((student) => ({
        alumno_id: student.id,
        grupo_id: params.id,
        curso_id: courseInfo.curso_id,
        tipo: newGrade.tipo,
        descripcion: newGrade.descripcion,
        nota: 0, // Nota inicial
        ponderacion: newGrade.ponderacion,
        fecha: newGrade.fecha,
        periodo: newGrade.periodo,
        registrado_por: session.user.id,
      }))

      const { error: insertError } = await supabase.from("calificaciones").insert(gradesToCreate)

      if (insertError) {
        console.error("Error al crear calificaciones:", insertError)
        throw insertError
      }

      setSuccess("Calificaciones creadas correctamente")
      setIsDialogOpen(false)

      // Recargar calificaciones
      const { data: gradesData, error: gradesError } = await supabase
        .from("calificaciones")
        .select("*")
        .eq("grupo_id", params.id)
        .eq("periodo", selectedPeriod)
        .in(
          "alumno_id",
          students.map((s) => s.id),
        )
        .order("fecha", { ascending: false })

      if (gradesError) {
        console.error("Error al recargar calificaciones:", gradesError)
        throw gradesError
      }

      setGrades(gradesData || [])

      // Resetear formulario
      setNewGrade({
        tipo: "examen",
        descripcion: "",
        ponderacion: 1,
        periodo: selectedPeriod,
        fecha: format(new Date(), "yyyy-MM-dd"),
      })
    } catch (error: any) {
      console.error("Error:", error)
      setError(error.message || "Error al crear las calificaciones")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteGrade = async () => {
    if (!selectedGrade) return

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      // Eliminar todas las calificaciones con la misma descripción y tipo
      const { error: deleteError } = await supabase
        .from("calificaciones")
        .delete()
        .eq("grupo_id", params.id)
        .eq("descripcion", selectedGrade.descripcion)
        .eq("tipo", selectedGrade.tipo)
        .eq("periodo", selectedPeriod)

      if (deleteError) {
        console.error("Error al eliminar calificaciones:", deleteError)
        throw deleteError
      }

      setSuccess("Calificaciones eliminadas correctamente")
      setIsDeleteDialogOpen(false)
      setSelectedGrade(null)

      // Recargar calificaciones
      const { data: gradesData, error: gradesError } = await supabase
        .from("calificaciones")
        .select("*")
        .eq("grupo_id", params.id)
        .eq("periodo", selectedPeriod)
        .in(
          "alumno_id",
          students.map((s) => s.id),
        )
        .order("fecha", { ascending: false })

      if (gradesError) {
        console.error("Error al recargar calificaciones:", gradesError)
        throw gradesError
      }

      setGrades(gradesData || [])
    } catch (error: any) {
      console.error("Error:", error)
      setError(error.message || "Error al eliminar las calificaciones")
    } finally {
      setSaving(false)
    }
  }

  const handleEditGrade = (studentId: string, gradeId: string, value: string) => {
    const numValue = Number.parseFloat(value)
    if (isNaN(numValue) || numValue < 0 || numValue > 20) return

    setEditingGrades((prev) => ({
      ...prev,
      [gradeId]: numValue,
    }))
  }

  const saveGrades = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const gradesToUpdate = Object.entries(editingGrades).map(([id, nota]) => ({
        id,
        nota,
      }))

      if (gradesToUpdate.length === 0) {
        setError("No hay calificaciones para guardar")
        return
      }

      // Actualizar calificaciones
      for (const grade of gradesToUpdate) {
        const { error: updateError } = await supabase
          .from("calificaciones")
          .update({ nota: grade.nota })
          .eq("id", grade.id)

        if (updateError) {
          console.error("Error al actualizar calificación:", updateError)
          throw updateError
        }
      }

      setSuccess("Calificaciones guardadas correctamente")
      setEditMode(false)
      setEditingGrades({})

      // Recargar calificaciones
      const { data: gradesData, error: gradesError } = await supabase
        .from("calificaciones")
        .select("*")
        .eq("grupo_id", params.id)
        .eq("periodo", selectedPeriod)
        .in(
          "alumno_id",
          students.map((s) => s.id),
        )
        .order("fecha", { ascending: false })

      if (gradesError) {
        console.error("Error al recargar calificaciones:", gradesError)
        throw gradesError
      }

      setGrades(gradesData || [])
    } catch (error: any) {
      console.error("Error:", error)
      setError(error.message || "Error al guardar las calificaciones")
    } finally {
      setSaving(false)
    }
  }

  const exportGrades = () => {
    // Agrupar calificaciones por tipo y descripción
    const gradesByType = grades.reduce((acc: any, grade) => {
      const key = `${grade.tipo}-${grade.descripcion}`
      if (!acc[key]) {
        acc[key] = {
          tipo: grade.tipo,
          descripcion: grade.descripcion,
          ponderacion: grade.ponderacion,
          fecha: grade.fecha,
        }
      }
      return acc
    }, {})

    const gradeTypes = Object.values(gradesByType)

    // Crear encabezados
    const headers = ["Alumno", ...gradeTypes.map((g: any) => g.descripcion), "Promedio"]

    // Crear filas para cada estudiante
    const rows = students.map((student) => {
      const studentGrades = grades.filter((g) => g.alumno_id === student.id)
      const gradeValues = gradeTypes.map((type: any) => {
        const grade = studentGrades.find((g) => g.tipo === type.tipo && g.descripcion === type.descripcion)
        return grade ? grade.nota : "-"
      })

      // Calcular promedio
      const validGrades = studentGrades.filter((g) => g.nota > 0)
      const weightedSum = validGrades.reduce((sum, g) => sum + g.nota * g.ponderacion, 0)
      const totalWeight = validGrades.reduce((sum, g) => sum + g.ponderacion, 0)
      const average = totalWeight > 0 ? (weightedSum / totalWeight).toFixed(2) : "-"

      return [`${student.apellidos}, ${student.nombre}`, ...gradeValues, average]
    })

    // Crear contenido CSV
    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")

    // Crear y descargar el archivo
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `calificaciones_${courseInfo?.nombre.replace(/\s+/g, "_")}_${selectedPeriod.replace(/\s+/g, "_")}.csv`,
    )
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Filtrar estudiantes según la búsqueda
  const filteredStudents = students.filter((student) =>
    `${student.nombre} ${student.apellidos}`.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Agrupar calificaciones por tipo y descripción
  const gradesByTypeAndDesc = grades.reduce((acc: any, grade) => {
    const key = `${grade.tipo}-${grade.descripcion}`
    if (!acc[key]) {
      acc[key] = {
        tipo: grade.tipo,
        descripcion: grade.descripcion,
        ponderacion: grade.ponderacion,
        fecha: grade.fecha,
        grades: [],
      }
    }
    acc[key].grades.push(grade)
    return acc
  }, {})

  const gradeColumns = Object.values(gradesByTypeAndDesc).sort((a: any, b: any) => {
    return new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  })

  // Calcular promedios por estudiante
  const studentAverages = students.reduce((acc: Record<string, number>, student) => {
    const studentGrades = grades.filter((g) => g.alumno_id === student.id)
    const validGrades = studentGrades.filter((g) => g.nota > 0)
    const weightedSum = validGrades.reduce((sum, g) => sum + g.nota * g.ponderacion, 0)
    const totalWeight = validGrades.reduce((sum, g) => sum + g.ponderacion, 0)
    acc[student.id] = totalWeight > 0 ? weightedSum / totalWeight : 0
    return acc
  }, {})

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
          <h1 className="text-3xl font-bold text-blue-600">Calificaciones</h1>
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

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Seleccionar periodo" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period} value={period}>
                    {period}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar estudiantes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={exportGrades} disabled={grades.length === 0}>
              <Download className="h-4 w-4 mr-1" />
              Exportar
            </Button>

            {editMode ? (
              <Button onClick={saveGrades} disabled={saving}>
                <Save className="h-4 w-4 mr-1" />
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            ) : (
              <Button onClick={() => setEditMode(true)} disabled={grades.length === 0}>
                <Edit className="h-4 w-4 mr-1" />
                Editar Notas
              </Button>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-1" />
                  Nueva Calificación
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Nueva Calificación</DialogTitle>
                  <DialogDescription>
                    Complete los detalles para crear una nueva calificación para todos los estudiantes.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tipo">Tipo</Label>
                      <Select
                        value={newGrade.tipo}
                        onValueChange={(value) => setNewGrade({ ...newGrade, tipo: value })}
                      >
                        <SelectTrigger id="tipo">
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {gradeTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="periodo">Periodo</Label>
                      <Select
                        value={newGrade.periodo}
                        onValueChange={(value) => setNewGrade({ ...newGrade, periodo: value })}
                      >
                        <SelectTrigger id="periodo">
                          <SelectValue placeholder="Seleccionar periodo" />
                        </SelectTrigger>
                        <SelectContent>
                          {periods.map((period) => (
                            <SelectItem key={period} value={period}>
                              {period}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Input
                      id="descripcion"
                      value={newGrade.descripcion}
                      onChange={(e) => setNewGrade({ ...newGrade, descripcion: e.target.value })}
                      placeholder="Ej: Examen Parcial, Tarea 1, etc."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ponderacion">Ponderación</Label>
                      <Input
                        id="ponderacion"
                        type="number"
                        min="0.1"
                        max="10"
                        step="0.1"
                        value={newGrade.ponderacion}
                        onChange={(e) =>
                          setNewGrade({ ...newGrade, ponderacion: Number.parseFloat(e.target.value) || 1 })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="fecha">Fecha</Label>
                      <Input
                        id="fecha"
                        type="date"
                        value={newGrade.fecha}
                        onChange={(e) => setNewGrade({ ...newGrade, fecha: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateGrade} disabled={saving}>
                    {saving ? "Creando..." : "Crear Calificación"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Confirmar Eliminación</DialogTitle>
                  <DialogDescription>
                    ¿Está seguro que desea eliminar esta calificación para todos los estudiantes? Esta acción no se
                    puede deshacer.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteGrade} disabled={saving}>
                    {saving ? "Eliminando..." : "Eliminar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registro de Calificaciones - {selectedPeriod}</CardTitle>
            <CardDescription>
              {editMode
                ? "Modo edición: Ingrese las calificaciones y guarde los cambios."
                : "Visualización de calificaciones por estudiante."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay estudiantes asignados a este curso</p>
              </div>
            ) : gradeColumns.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay calificaciones registradas para este periodo</p>
                <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Crear Primera Calificación
                </Button>
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 bg-white z-10">Estudiante</TableHead>
                      {gradeColumns.map((column: any, index) => (
                        <TableHead key={index} className="min-w-[120px]">
                          <div className="flex flex-col">
                            <div className="font-medium">{column.descripcion}</div>
                            <div className="text-xs text-gray-500 flex items-center justify-between">
                              <span>
                                {gradeTypes.find((t) => t.value === column.tipo)?.label || column.tipo} (
                                {column.ponderacion})
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                onClick={() => {
                                  setSelectedGrade({
                                    id: column.grades[0].id,
                                    alumno_id: column.grades[0].alumno_id,
                                    tipo: column.tipo,
                                    descripcion: column.descripcion,
                                    nota: column.grades[0].nota,
                                    ponderacion: column.ponderacion,
                                    comentario: column.grades[0].comentario,
                                    fecha: column.fecha,
                                    periodo: column.grades[0].periodo,
                                  })
                                  setIsDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5 text-gray-500 hover:text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </TableHead>
                      ))}
                      <TableHead className="min-w-[100px]">Promedio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="sticky left-0 bg-white font-medium">
                          {`${student.apellidos}, ${student.nombre}`}
                        </TableCell>
                        {gradeColumns.map((column: any, index) => {
                          const studentGrade = column.grades.find((g: Grade) => g.alumno_id === student.id)
                          return (
                            <TableCell key={index}>
                              {editMode ? (
                                <Input
                                  type="number"
                                  min="0"
                                  max="20"
                                  step="0.1"
                                  className="w-20 h-8"
                                  value={
                                    studentGrade && studentGrade.id in editingGrades
                                      ? editingGrades[studentGrade.id]
                                      : studentGrade?.nota || 0
                                  }
                                  onChange={(e) =>
                                    studentGrade && handleEditGrade(student.id, studentGrade.id, e.target.value)
                                  }
                                />
                              ) : (
                                <div
                                  className={`font-medium ${
                                    studentGrade && studentGrade.nota < 10.5 ? "text-red-500" : "text-green-600"
                                  }`}
                                >
                                  {studentGrade ? studentGrade.nota.toFixed(1) : "—"}
                                </div>
                              )}
                            </TableCell>
                          )
                        })}
                        <TableCell>
                          <div
                            className={`font-medium ${
                              studentAverages[student.id] < 10.5 ? "text-red-500" : "text-green-600"
                            }`}
                          >
                            {studentAverages[student.id] ? studentAverages[student.id].toFixed(1) : "—"}
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
