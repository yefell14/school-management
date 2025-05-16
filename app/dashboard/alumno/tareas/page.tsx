"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, CheckSquare, Clock, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

export default function TareasAlumno() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [filtroCurso, setFiltroCurso] = useState("todos")

  // Datos de ejemplo para las tareas
  const tareasPendientes = [
    {
      id: 1,
      titulo: "Ecuaciones Diferenciales",
      curso: "Matemáticas",
      fechaEntrega: "15 Mayo, 2023",
      estado: "pendiente",
      prioridad: "alta",
    },
    {
      id: 2,
      titulo: "Ensayo sobre la Revolución Industrial",
      curso: "Historia",
      fechaEntrega: "17 Mayo, 2023",
      estado: "pendiente",
      prioridad: "media",
    },
    {
      id: 3,
      titulo: "Informe de Laboratorio",
      curso: "Ciencias",
      fechaEntrega: "19 Mayo, 2023",
      estado: "pendiente",
      prioridad: "alta",
    },
    {
      id: 4,
      titulo: "Análisis de Poema",
      curso: "Literatura",
      fechaEntrega: "21 Mayo, 2023",
      estado: "pendiente",
      prioridad: "baja",
    },
  ]

  const tareasCompletadas = [
    {
      id: 5,
      titulo: "Ensayo sobre literatura inglesa",
      curso: "Inglés",
      fechaEntrega: "10 Mayo, 2023",
      fechaEntregado: "9 Mayo, 2023",
      calificacion: "95/100",
      retroalimentacion: "Excelente trabajo, muy bien estructurado y con buenas referencias.",
      estado: "completada",
    },
    {
      id: 6,
      titulo: "Ejercicios de álgebra",
      curso: "Matemáticas",
      fechaEntrega: "8 Mayo, 2023",
      fechaEntregado: "7 Mayo, 2023",
      calificacion: "85/100",
      retroalimentacion: "Buen trabajo, pero hay algunos errores en los ejercicios 3 y 5.",
      estado: "completada",
    },
    {
      id: 7,
      titulo: "Línea de tiempo histórica",
      curso: "Historia",
      fechaEntrega: "5 Mayo, 2023",
      fechaEntregado: "4 Mayo, 2023",
      calificacion: "90/100",
      retroalimentacion: "Muy completo y bien presentado. Faltaron algunos eventos importantes.",
      estado: "completada",
    },
  ]

  // Filtrar tareas según los criterios
  const filtrarTareas = (tareas, estado) => {
    return tareas.filter(
      (tarea) =>
        (tarea.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tarea.curso.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filtroCurso === "todos" || tarea.curso === filtroCurso) &&
        (filtroEstado === "todos" || tarea.estado === filtroEstado),
    )
  }

  const pendientesFiltradas = filtrarTareas(tareasPendientes, "pendiente")
  const completadasFiltradas = filtrarTareas(tareasCompletadas, "completada")

  // Lista de cursos para el filtro
  const cursos = ["Matemáticas", "Historia", "Ciencias", "Literatura", "Inglés", "Educación Física"]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mis Tareas</h1>
        <p className="text-muted-foreground">Gestiona tus tareas pendientes y completadas</p>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <Input
            placeholder="Buscar tarea..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex space-x-4">
          <div className="w-[180px]">
            <Select value={filtroCurso} onValueChange={setFiltroCurso}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por curso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los cursos</SelectItem>
                {cursos.map((curso) => (
                  <SelectItem key={curso} value={curso}>
                    {curso}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-[180px]">
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendientes</SelectItem>
                <SelectItem value="completada">Completadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs defaultValue="pendientes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pendientes">Pendientes ({pendientesFiltradas.length})</TabsTrigger>
          <TabsTrigger value="completadas">Completadas ({completadasFiltradas.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pendientes" className="space-y-4">
          {pendientesFiltradas.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="rounded-full bg-blue-100 p-3 mb-4">
                  <CheckSquare className="h-6 w-6 text-blue-700" />
                </div>
                <h3 className="text-lg font-medium">No hay tareas pendientes</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  No tienes tareas pendientes que coincidan con tus filtros.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendientesFiltradas.map((tarea) => (
                <Card key={tarea.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start space-x-4">
                        <div
                          className={`p-2 rounded-full ${
                            tarea.prioridad === "alta"
                              ? "bg-red-100"
                              : tarea.prioridad === "media"
                                ? "bg-yellow-100"
                                : "bg-green-100"
                          }`}
                        >
                          <FileText
                            className={`h-5 w-5 ${
                              tarea.prioridad === "alta"
                                ? "text-red-700"
                                : tarea.prioridad === "media"
                                  ? "text-yellow-700"
                                  : "text-green-700"
                            }`}
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{tarea.titulo}</h3>
                          <p className="text-sm text-muted-foreground">Curso: {tarea.curso}</p>
                          <div className="flex items-center mt-2">
                            <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                            <p className="text-sm text-red-500">Entrega: {tarea.fechaEntrega}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0">
                        <Button>Entregar Tarea</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completadas" className="space-y-4">
          {completadasFiltradas.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="rounded-full bg-blue-100 p-3 mb-4">
                  <FileText className="h-6 w-6 text-blue-700" />
                </div>
                <h3 className="text-lg font-medium">No hay tareas completadas</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  No tienes tareas completadas que coincidan con tus filtros.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {completadasFiltradas.map((tarea) => (
                <Card key={tarea.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="bg-green-100 p-2 rounded-full">
                          <CheckSquare className="h-5 w-5 text-green-700" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{tarea.titulo}</h3>
                          <p className="text-sm text-muted-foreground">Curso: {tarea.curso}</p>
                          <div className="flex items-center mt-2">
                            <p className="text-sm text-muted-foreground">Entregado: {tarea.fechaEntregado}</p>
                          </div>
                          <p className="text-sm font-medium text-green-600 mt-1">Calificación: {tarea.calificacion}</p>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 md:ml-4 md:max-w-xs">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <h4 className="text-sm font-medium mb-1">Retroalimentación:</h4>
                          <p className="text-sm text-muted-foreground">{tarea.retroalimentacion}</p>
                        </div>
                        <Button variant="outline" size="sm" className="mt-2">
                          Ver Detalles
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
