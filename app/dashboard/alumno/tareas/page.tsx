"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase, type Tarea } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Search, Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function TareasPage() {
  const { user } = useAuth()
  const [tareas, setTareas] = useState<(Tarea & { grupo: { curso: { nombre: string } } })[]>([])
  const [filteredTareas, setFilteredTareas] = useState<(Tarea & { grupo: { curso: { nombre: string } } })[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTareas = async () => {
      if (!user) return

      try {
        // Get student's groups
        const { data: gruposData, error: gruposError } = await supabase
          .from("grupo_alumno")
          .select("grupo_id")
          .eq("alumno_id", user.id)

        if (gruposError) throw gruposError

        const grupoIds = gruposData.map((item) => item.grupo_id)

        if (grupoIds.length > 0) {
          // Get tasks for those groups
          const { data: tareasData, error: tareasError } = await supabase
            .from("tareas")
            .select(`
              *,
              grupo:grupos(
                curso:cursos(nombre)
              )
            `)
            .in("grupo_id", grupoIds)
            .order("fecha_entrega", { ascending: false })

          if (tareasError) throw tareasError
          setTareas(tareasData)
          setFilteredTareas(tareasData)
        }
      } catch (error) {
        console.error("Error fetching tasks:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTareas()
  }, [user])

  useEffect(() => {
    // Apply filters
    let result = tareas

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (tarea) =>
          tarea.titulo.toLowerCase().includes(term) ||
          (tarea.descripcion && tarea.descripcion.toLowerCase().includes(term)) ||
          tarea.grupo.curso.nombre.toLowerCase().includes(term),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((tarea) => tarea.estado === statusFilter)
    }

    setFilteredTareas(result)
  }, [searchTerm, statusFilter, tareas])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
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

  const isOverdue = (dateString: string) => {
    const dueDate = new Date(dateString)
    const today = new Date()
    return dueDate < today && dueDate.toDateString() !== today.toDateString()
  }

  const getStatusBadge = (estado: string, fechaEntrega: string) => {
    if (estado === "pendiente" && isOverdue(fechaEntrega)) {
      return (
        <Badge variant="destructive" className="ml-2">
          <AlertCircle className="mr-1 h-3 w-3" />
          Vencida
        </Badge>
      )
    }

    switch (estado) {
      case "pendiente":
        return (
          <Badge variant="outline" className="ml-2">
            <Clock className="mr-1 h-3 w-3" />
            Pendiente
          </Badge>
        )
      case "completada":
        return (
          <Badge variant="secondary" className="ml-2">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Completada
          </Badge>
        )
      case "calificada":
        return (
          <Badge variant="default" className="ml-2">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Calificada
          </Badge>
        )
      default:
        return null
    }
  }

  // Group tasks by month
  const tareasPorMes = filteredTareas.reduce(
    (acc, tarea) => {
      const fecha = new Date(tarea.fecha_entrega)
      const mes = fecha.toLocaleString("es-ES", { month: "long", year: "numeric" })

      if (!acc[mes]) {
        acc[mes] = []
      }

      acc[mes].push(tarea)
      return acc
    },
    {} as Record<string, (Tarea & { grupo: { curso: { nombre: string } } })[]>,
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Mis Tareas</h1>
        <p className="text-muted-foreground">Gestiona todas tus tareas asignadas</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar tareas..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pendiente">Pendientes</SelectItem>
            <SelectItem value="completada">Completadas</SelectItem>
            <SelectItem value="calificada">Calificadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="calendar">Calendario</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {Object.keys(tareasPorMes).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(tareasPorMes).map(([mes, tareasMes]) => (
                <div key={mes}>
                  <h3 className="mb-4 font-semibold capitalize">{mes}</h3>
                  <div className="space-y-3">
                    {tareasMes.map((tarea) => (
                      <Card
                        key={tarea.id}
                        className={`overflow-hidden ${isOverdue(tarea.fecha_entrega) && tarea.estado === "pendiente" ? "border-red-200" : ""}`}
                      >
                        <CardContent className="p-0">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4">
                            <div className="space-y-1 mb-2 sm:mb-0">
                              <div className="flex items-center">
                                <h4 className="font-semibold">{tarea.titulo}</h4>
                                {getStatusBadge(tarea.estado, tarea.fecha_entrega)}
                              </div>
                              <p className="text-sm text-muted-foreground">{tarea.grupo.curso.nombre}</p>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="mr-1 h-4 w-4" />
                                <span>Fecha de entrega: {formatDate(tarea.fecha_entrega)}</span>
                              </div>
                            </div>
                            <Link href={`/dashboard/alumno/tareas/${tarea.id}`}>
                              <Button variant="outline" size="sm">
                                Ver detalles
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="h-10 w-10 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No hay tareas</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchTerm || statusFilter !== "all"
                  ? "No se encontraron tareas que coincidan con los filtros aplicados"
                  : "No tienes tareas asignadas en este momento"}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vista de calendario</CardTitle>
              <CardDescription>Visualiza tus tareas en formato de calendario</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-10 w-10 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Vista de calendario próximamente</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Estamos trabajando en implementar una vista de calendario para tus tareas
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
