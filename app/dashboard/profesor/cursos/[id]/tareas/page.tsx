"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { ArrowLeft, FileText, Plus, Calendar, Search, Edit, Trash2, Eye, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Badge } from "@/components/ui/badge"
import { format, parseISO, isAfter } from "date-fns"
import { es } from "date-fns/locale"

interface Task {
  id: string
  titulo: string
  descripcion: string
  fecha_asignacion: string
  fecha_entrega: string
  estado: "pendiente" | "completada" | "calificada"
  entregas_count?: number
}

interface CourseInfo {
  id: string
  nombre: string
  grado: string
  seccion: string
}

export default function CourseTasksPage({ params }: { params: { id: string } }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [courseInfo, setCourseInfo] = useState<CourseInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string | null>("pendiente") // Updated default value
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [newTask, setNewTask] = useState({
    titulo: "",
    descripcion: "",
    fecha_entrega: format(new Date(new Date().setDate(new Date().getDate() + 7)), "yyyy-MM-dd'T'HH:mm"),
  })
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchTasks() {
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

        // Obtener tareas del grupo
        const { data: tasksData, error: tasksError } = await supabase
          .from("tareas")
          .select("*")
          .eq("grupo_id", params.id)
          .order("fecha_entrega", { ascending: false })

        if (tasksError) {
          console.error("Error al obtener tareas:", tasksError)
          throw tasksError
        }

        // Obtener conteo de entregas para cada tarea
        const tasksWithCounts = await Promise.all(
          tasksData.map(async (task) => {
            const { count, error: countError } = await supabase
              .from("entregas_tareas")
              .select("*", { count: "exact", head: true })
              .eq("tarea_id", task.id)

            if (countError) {
              console.error("Error al obtener conteo de entregas:", countError)
            }

            return {
              ...task,
              entregas_count: count || 0,
            }
          }),
        )

        setTasks(tasksWithCounts)
      } catch (error: any) {
        console.error("Error:", error)
        setError(error.message || "Error al cargar las tareas")
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [params.id, supabase])

  const handleCreateTask = async () => {
    try {
      setError(null)
      setSuccess(null)

      if (!newTask.titulo || !newTask.descripcion || !newTask.fecha_entrega) {
        setError("Por favor complete todos los campos")
        return
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setError("No hay sesión activa")
        return
      }

      const taskData = {
        grupo_id: params.id,
        titulo: newTask.titulo,
        descripcion: newTask.descripcion,
        fecha_entrega: newTask.fecha_entrega,
        creado_por: session.user.id,
      }

      if (selectedTask) {
        // Actualizar tarea existente
        const { error: updateError } = await supabase.from("tareas").update(taskData).eq("id", selectedTask.id)

        if (updateError) {
          console.error("Error al actualizar tarea:", updateError)
          throw updateError
        }

        setSuccess("Tarea actualizada correctamente")
      } else {
        // Crear nueva tarea
        const { error: insertError } = await supabase.from("tareas").insert(taskData)

        if (insertError) {
          console.error("Error al crear tarea:", insertError)
          throw insertError
        }

        setSuccess("Tarea creada correctamente")
      }

      // Resetear formulario y recargar tareas
      setNewTask({
        titulo: "",
        descripcion: "",
        fecha_entrega: format(new Date(new Date().setDate(new Date().getDate() + 7)), "yyyy-MM-dd'T'HH:mm"),
      })
      setSelectedTask(null)
      setIsDialogOpen(false)

      // Recargar tareas
      window.location.reload()
    } catch (error: any) {
      console.error("Error:", error)
      setError(error.message || "Error al guardar la tarea")
    }
  }

  const handleEditTask = (task: Task) => {
    setSelectedTask(task)
    setNewTask({
      titulo: task.titulo,
      descripcion: task.descripcion,
      fecha_entrega: task.fecha_entrega,
    })
    setIsDialogOpen(true)
  }

  const handleDeleteTask = async () => {
    if (!selectedTask) return

    try {
      setError(null)
      setSuccess(null)

      // Eliminar tarea
      const { error: deleteError } = await supabase.from("tareas").delete().eq("id", selectedTask.id)

      if (deleteError) {
        console.error("Error al eliminar tarea:", deleteError)
        throw deleteError
      }

      setSuccess("Tarea eliminada correctamente")
      setSelectedTask(null)
      setIsDeleteDialogOpen(false)

      // Recargar tareas
      window.location.reload()
    } catch (error: any) {
      console.error("Error:", error)
      setError(error.message || "Error al eliminar la tarea")
    }
  }

  const exportTasks = () => {
    // Crear contenido CSV
    const headers = ["Título", "Descripción", "Fecha Asignación", "Fecha Entrega", "Estado", "Entregas"]
    const csvContent =
      headers.join(",") +
      "\n" +
      tasks
        .map((task) => {
          return [
            task.titulo,
            task.descripcion.replace(/,/g, ";"),
            format(parseISO(task.fecha_asignacion), "dd/MM/yyyy"),
            format(parseISO(task.fecha_entrega), "dd/MM/yyyy HH:mm"),
            task.estado,
            task.entregas_count || 0,
          ].join(",")
        })
        .join("\n")

    // Crear y descargar el archivo
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `tareas_${courseInfo?.nombre.replace(/\s+/g, "_")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Filtrar tareas según la búsqueda y el estado
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.descripcion.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = filterStatus ? task.estado === filterStatus : true

    return matchesSearch && matchesFilter
  })

  // Separar tareas en pendientes y completadas
  const pendingTasks = filteredTasks.filter(
    (task) => task.estado === "pendiente" && isAfter(parseISO(task.fecha_entrega), new Date()),
  )
  const lateTasks = filteredTasks.filter(
    (task) => task.estado === "pendiente" && !isAfter(parseISO(task.fecha_entrega), new Date()),
  )
  const completedTasks = filteredTasks.filter((task) => task.estado !== "pendiente")

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error && !tasks.length) {
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
          <h1 className="text-3xl font-bold text-blue-600">Tareas</h1>
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
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar tareas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={filterStatus || ""} onValueChange={(value) => setFilterStatus(value === "" ? null : value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="completada">Completada</SelectItem>
                <SelectItem value="calificada">Calificada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={exportTasks} disabled={tasks.length === 0}>
              <Download className="h-4 w-4 mr-1" />
              Exportar
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-1" />
                  Nueva Tarea
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>{selectedTask ? "Editar Tarea" : "Nueva Tarea"}</DialogTitle>
                  <DialogDescription>
                    {selectedTask
                      ? "Modifique los detalles de la tarea y guarde los cambios."
                      : "Complete los detalles para crear una nueva tarea."}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="titulo">Título</Label>
                    <Input
                      id="titulo"
                      value={newTask.titulo}
                      onChange={(e) => setNewTask({ ...newTask, titulo: e.target.value })}
                      placeholder="Título de la tarea"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Textarea
                      id="descripcion"
                      value={newTask.descripcion}
                      onChange={(e) => setNewTask({ ...newTask, descripcion: e.target.value })}
                      placeholder="Descripción detallada de la tarea"
                      rows={5}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="fecha_entrega">Fecha de Entrega</Label>
                    <Input
                      id="fecha_entrega"
                      type="datetime-local"
                      value={newTask.fecha_entrega}
                      onChange={(e) => setNewTask({ ...newTask, fecha_entrega: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateTask}>{selectedTask ? "Guardar Cambios" : "Crear Tarea"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Confirmar Eliminación</DialogTitle>
                  <DialogDescription>
                    ¿Está seguro que desea eliminar esta tarea? Esta acción no se puede deshacer.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteTask}>
                    Eliminar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pendientes ({pendingTasks.length})</TabsTrigger>
            <TabsTrigger value="late">Atrasadas ({lateTasks.length})</TabsTrigger>
            <TabsTrigger value="completed">Completadas ({completedTasks.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {pendingTasks.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <FileText className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-xl text-gray-500">No hay tareas pendientes</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingTasks.map((task) => (
                  <Card key={task.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{task.titulo}</CardTitle>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          Pendiente
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1 text-gray-500" />
                        Entrega: {format(parseISO(task.fecha_entrega), "d MMM yyyy, HH:mm", { locale: es })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 line-clamp-3">{task.descripcion}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">{task.entregas_count || 0}</span> entregas
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/profesor/cursos/${params.id}/tareas/${task.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditTask(task)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTask(task)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="late">
            {lateTasks.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <FileText className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-xl text-gray-500">No hay tareas atrasadas</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lateTasks.map((task) => (
                  <Card key={task.id} className="overflow-hidden border-red-200">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{task.titulo}</CardTitle>
                        <Badge variant="destructive">Atrasada</Badge>
                      </div>
                      <CardDescription className="flex items-center text-red-500">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        Venció: {format(parseISO(task.fecha_entrega), "d MMM yyyy, HH:mm", { locale: es })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 line-clamp-3">{task.descripcion}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">{task.entregas_count || 0}</span> entregas
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/profesor/cursos/${params.id}/tareas/${task.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditTask(task)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTask(task)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {completedTasks.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <FileText className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-xl text-gray-500">No hay tareas completadas</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedTasks.map((task) => (
                  <Card key={task.id} className="overflow-hidden opacity-80">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{task.titulo}</CardTitle>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          {task.estado === "completada" ? "Completada" : "Calificada"}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1 text-gray-500" />
                        Entregada: {format(parseISO(task.fecha_entrega), "d MMM yyyy", { locale: es })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 line-clamp-3">{task.descripcion}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">{task.entregas_count || 0}</span> entregas
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/profesor/cursos/${params.id}/tareas/${task.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Link>
                        </Button>
                      </div>
                    </CardFooter>
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
