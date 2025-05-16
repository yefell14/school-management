"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, Plus, MoreVertical, Edit, Trash, Eye, CheckSquare } from "lucide-react"

// Datos de ejemplo
const tareasData = [
  {
    id: "1",
    titulo: "Ejercicios de sumas y restas",
    descripcion: "Completar los ejercicios de la página 15 del libro de texto.",
    curso: "Matemáticas",
    grado: "1° Grado",
    seccion: "A",
    fecha_asignacion: "2023-05-10",
    fecha_entrega: "2023-05-16",
    estado: "pendiente",
    entregas: 15,
    total_estudiantes: 30,
  },
  {
    id: "2",
    titulo: "Problemas de razonamiento matemático",
    descripcion: "Resolver los problemas de razonamiento matemático de la ficha adjunta.",
    curso: "Matemáticas",
    grado: "1° Grado",
    seccion: "A",
    fecha_asignacion: "2023-05-12",
    fecha_entrega: "2023-05-19",
    estado: "pendiente",
    entregas: 8,
    total_estudiantes: 30,
  },
  {
    id: "3",
    titulo: "Ejercicios de multiplicación",
    descripcion: "Completar la tabla de multiplicar del 1 al 5.",
    curso: "Matemáticas",
    grado: "2° Grado",
    seccion: "B",
    fecha_asignacion: "2023-05-10",
    fecha_entrega: "2023-05-17",
    estado: "pendiente",
    entregas: 20,
    total_estudiantes: 28,
  },
  {
    id: "4",
    titulo: "Examen parcial de matemáticas",
    descripcion: "Evaluación de sumas, restas y multiplicación básica.",
    curso: "Matemáticas",
    grado: "1° Grado",
    seccion: "A",
    fecha_asignacion: "2023-05-01",
    fecha_entrega: "2023-05-08",
    estado: "calificada",
    entregas: 30,
    total_estudiantes: 30,
  },
  {
    id: "5",
    titulo: "Ejercicios de fracciones",
    descripcion: "Completar los ejercicios de fracciones de la página 25 del libro de texto.",
    curso: "Matemáticas",
    grado: "3° Grado",
    seccion: "A",
    fecha_asignacion: "2023-05-05",
    fecha_entrega: "2023-05-12",
    estado: "completada",
    entregas: 27,
    total_estudiantes: 27,
  },
]

// Datos de ejemplo para selects
const cursosOptions = [
  { id: "1", nombre: "Matemáticas - 1° Grado A" },
  { id: "2", nombre: "Matemáticas - 2° Grado B" },
  { id: "3", nombre: "Matemáticas - 3° Grado A" },
  { id: "4", nombre: "Física - 4° Año A" },
  { id: "5", nombre: "Física - 5° Año B" },
]

export default function TareasPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [cursoFilter, setCursoFilter] = useState("todos")
  const [estadoFilter, setEstadoFilter] = useState("todos")
  const [activeTab, setActiveTab] = useState("pendientes")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentTarea, setCurrentTarea] = useState(null)
  const [nuevaTarea, setNuevaTarea] = useState({
    titulo: "",
    descripcion: "",
    curso_id: "",
    fecha_entrega: "",
  })

  // Filtrar tareas
  const filteredTareas = tareasData.filter((tarea) => {
    const matchesSearch = tarea.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCurso =
      cursoFilter === "todos" || `${tarea.curso} - ${tarea.grado} ${tarea.seccion}`.includes(cursoFilter)
    const matchesEstado =
      estadoFilter === "todos" ||
      (estadoFilter === "pendientes" && tarea.estado === "pendiente") ||
      (estadoFilter === "completadas" && tarea.estado === "completada") ||
      (estadoFilter === "calificadas" && tarea.estado === "calificada")
    const matchesTab =
      (activeTab === "pendientes" && tarea.estado === "pendiente") ||
      (activeTab === "completadas" && tarea.estado === "completada") ||
      (activeTab === "calificadas" && tarea.estado === "calificada") ||
      activeTab === "todas"

    return matchesSearch && matchesCurso && matchesEstado && matchesTab
  })

  // Manejar creación de tarea
  const handleCreateTarea = () => {
    // Aquí iría la lógica para crear la tarea en la base de datos
    console.log("Creando tarea:", nuevaTarea)
    setIsCreateDialogOpen(false)
    // Resetear el formulario
    setNuevaTarea({
      titulo: "",
      descripcion: "",
      curso_id: "",
      fecha_entrega: "",
    })
  }

  // Manejar eliminación de tarea
  const handleDeleteTarea = () => {
    // Aquí iría la lógica para eliminar la tarea en la base de datos
    console.log("Eliminando tarea:", currentTarea)
    setIsDeleteDialogOpen(false)
  }

  // Formatear fecha
  const formatFecha = (fechaString) => {
    const fecha = new Date(fechaString)
    return fecha.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tareas</h1>
          <p className="text-muted-foreground">Gestiona las tareas asignadas a tus cursos.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
          <TabsTrigger value="completadas">Completadas</TabsTrigger>
          <TabsTrigger value="calificadas">Calificadas</TabsTrigger>
          <TabsTrigger value="todas">Todas</TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>
                {activeTab === "pendientes"
                  ? "Tareas Pendientes"
                  : activeTab === "completadas"
                    ? "Tareas Completadas"
                    : activeTab === "calificadas"
                      ? "Tareas Calificadas"
                      : "Todas las Tareas"}
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar tareas..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={cursoFilter} onValueChange={setCursoFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filtrar por curso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los cursos</SelectItem>
                    {cursosOptions.map((curso) => (
                      <SelectItem key={curso.id} value={curso.nombre}>
                        {curso.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-600 to-blue-700">
                      <Plus className="mr-2 h-4 w-4" /> Crear Tarea
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Crear Nueva Tarea</DialogTitle>
                      <DialogDescription>Crea una nueva tarea para asignar a tus estudiantes.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="titulo">Título</Label>
                        <Input
                          id="titulo"
                          value={nuevaTarea.titulo}
                          onChange={(e) => setNuevaTarea({ ...nuevaTarea, titulo: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="descripcion">Descripción</Label>
                        <Textarea
                          id="descripcion"
                          value={nuevaTarea.descripcion}
                          onChange={(e) => setNuevaTarea({ ...nuevaTarea, descripcion: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="curso">Curso</Label>
                        <Select
                          value={nuevaTarea.curso_id}
                          onValueChange={(value) => setNuevaTarea({ ...nuevaTarea, curso_id: value })}
                        >
                          <SelectTrigger id="curso">
                            <SelectValue placeholder="Seleccionar curso" />
                          </SelectTrigger>
                          <SelectContent>
                            {cursosOptions.map((curso) => (
                              <SelectItem key={curso.id} value={curso.id}>
                                {curso.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="fecha_entrega">Fecha de Entrega</Label>
                        <Input
                          id="fecha_entrega"
                          type="date"
                          value={nuevaTarea.fecha_entrega}
                          onChange={(e) => setNuevaTarea({ ...nuevaTarea, fecha_entrega: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateTarea}>Crear Tarea</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Curso</TableHead>
                    <TableHead>Fecha de Entrega</TableHead>
                    <TableHead>Entregas</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTareas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No se encontraron tareas con los criterios de búsqueda.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTareas.map((tarea) => (
                      <TableRow key={tarea.id}>
                        <TableCell className="font-medium">{tarea.titulo}</TableCell>
                        <TableCell>
                          {tarea.curso} - {tarea.grado} {tarea.seccion}
                        </TableCell>
                        <TableCell>{formatFecha(tarea.fecha_entrega)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span
                              className={
                                tarea.entregas === tarea.total_estudiantes
                                  ? "text-green-600"
                                  : tarea.entregas >= tarea.total_estudiantes / 2
                                    ? "text-yellow-600"
                                    : "text-red-600"
                              }
                            >
                              {tarea.entregas}
                            </span>
                            <span>/</span>
                            <span>{tarea.total_estudiantes}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              tarea.estado === "pendiente"
                                ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                : tarea.estado === "completada"
                                  ? "bg-blue-100 text-blue-800 border-blue-300"
                                  : "bg-green-100 text-green-800 border-green-300"
                            }
                          >
                            {tarea.estado === "pendiente"
                              ? "Pendiente"
                              : tarea.estado === "completada"
                                ? "Completada"
                                : "Calificada"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menú</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/profesor/tareas/${tarea.id}`}>
                                  <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                                </Link>
                              </DropdownMenuItem>
                              {tarea.estado === "completada" && (
                                <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/profesor/tareas/${tarea.id}/calificar`}>
                                    <CheckSquare className="mr-2 h-4 w-4" /> Calificar
                                  </Link>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/profesor/tareas/${tarea.id}/editar`}>
                                  <Edit className="mr-2 h-4 w-4" /> Editar
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setCurrentTarea(tarea)
                                  setIsDeleteDialogOpen(true)
                                }}
                                className="text-red-600"
                              >
                                <Trash className="mr-2 h-4 w-4" /> Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </Tabs>

      {/* Diálogo de eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Tarea</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {currentTarea && (
            <div className="py-4">
              <p>
                Estás a punto de eliminar la tarea <strong>{currentTarea.titulo}</strong> del curso{" "}
                <strong>
                  {currentTarea.curso} - {currentTarea.grado} {currentTarea.seccion}
                </strong>
                .
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteTarea}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
