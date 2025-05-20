"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase, type Grupo, type Tarea } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Calendar, FileText, Users } from "lucide-react"
import Link from "next/link"

export default function AlumnoDashboard() {
  const { user } = useAuth()
  const [cursos, setCursos] = useState<(Grupo & { curso: { nombre: string } })[]>([])
  const [tareasPendientes, setTareasPendientes] = useState<(Tarea & { grupo: { curso: { nombre: string } } })[]>([])
  const [proximasClases, setProximasClases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        // Fetch student's courses
        const { data: gruposData, error: gruposError } = await supabase
          .from("grupo_alumno")
          .select(`
            grupo_id,
            grupo:grupos(
              id,
              curso:cursos(id, nombre),
              grado:grados(id, nombre),
              seccion:secciones(id, nombre)
            )
          `)
          .eq("alumno_id", user.id)

        if (gruposError) throw gruposError

        const gruposFormatted = gruposData.map((item) => ({
          id: item.grupo.id,
          curso_id: item.grupo.curso.id,
          curso: item.grupo.curso,
          grado: item.grupo.grado,
          seccion: item.grupo.seccion,
        }))

        setCursos(gruposFormatted)

        // Fetch pending tasks
        const grupoIds = gruposData.map((item) => item.grupo_id)

        if (grupoIds.length > 0) {
          const { data: tareasData, error: tareasError } = await supabase
            .from("tareas")
            .select(`
              *,
              grupo:grupos(
                curso:cursos(nombre)
              )
            `)
            .in("grupo_id", grupoIds)
            .eq("estado", "pendiente")
            .gte("fecha_entrega", new Date().toISOString())
            .order("fecha_entrega", { ascending: true })
            .limit(5)

          if (tareasError) throw tareasError
          setTareasPendientes(tareasData)

          // Fetch upcoming classes
          const today = new Date()
          const dayOfWeek = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][today.getDay()]

          const { data: horariosData, error: horariosError } = await supabase
            .from("horarios")
            .select(`
              *,
              grupo:grupos(
                curso:cursos(nombre),
                grado:grados(nombre),
                seccion:secciones(nombre)
              )
            `)
            .in("grupo_id", grupoIds)
            .eq("dia", dayOfWeek)
            .gte("hora_inicio", today.toTimeString().slice(0, 5))
            .order("hora_inicio", { ascending: true })
            .limit(3)

          if (horariosError) throw horariosError
          setProximasClases(horariosData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--header-bg))]">Bienvenido, {user?.nombre}</h1>
        <p className="text-muted-foreground">Aquí tienes un resumen de tus actividades académicas</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="courses">Mis Cursos</TabsTrigger>
          <TabsTrigger value="tasks">Tareas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cursos Inscritos</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cursos.length}</div>
                <p className="text-xs text-muted-foreground">Cursos activos en este periodo</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tareas Pendientes</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tareasPendientes.length}</div>
                <p className="text-xs text-muted-foreground">Tareas por entregar</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Próximas Clases</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{proximasClases.length}</div>
                <p className="text-xs text-muted-foreground">Clases programadas para hoy</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compañeros</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cursos.length > 0 ? "25+" : "0"}</div>
                <p className="text-xs text-muted-foreground">Compañeros de clase</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Próximas Clases</CardTitle>
                <CardDescription>Clases programadas para hoy</CardDescription>
              </CardHeader>
              <CardContent>
                {proximasClases.length > 0 ? (
                  <div className="space-y-4">
                    {proximasClases.map((clase) => (
                      <div key={clase.id} className="flex items-center space-x-4">
                        <div className="rounded-full bg-primary/10 p-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{clase.grupo.curso.nombre}</p>
                          <p className="text-xs text-muted-foreground">
                            {clase.hora_inicio} - {clase.hora_fin} | Aula: {clase.aula || "No especificada"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No tienes más clases programadas para hoy</p>
                )}
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Tareas Pendientes</CardTitle>
                <CardDescription>Próximas entregas</CardDescription>
              </CardHeader>
              <CardContent>
                {tareasPendientes.length > 0 ? (
                  <div className="space-y-4">
                    {tareasPendientes.map((tarea) => (
                      <div key={tarea.id} className="flex items-center space-x-4">
                        <div className="rounded-full bg-primary/10 p-2">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{tarea.titulo}</p>
                          <p className="text-xs text-muted-foreground">
                            {tarea.grupo.curso.nombre} | Entrega: {formatDate(tarea.fecha_entrega)}
                          </p>
                        </div>
                        <Link href={`/alumno/tareas/${tarea.id}`}>
                          <Button variant="ghost" size="sm">
                            Ver
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No tienes tareas pendientes</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cursos.map((curso) => (
              <Card key={curso.id} className="overflow-hidden">
                <CardHeader className="bg-[hsl(var(--sidebar-bg))] text-white">
                  <CardTitle>{curso.curso.nombre}</CardTitle>
                  <CardDescription className="text-white/80">
                    {curso.grado.nombre} - {curso.seccion.nombre}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="mt-2 flex justify-end">
                    <Link href={`/alumno/cursos/${curso.id}`}>
                      <Button>Ver detalles</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tareas Pendientes</CardTitle>
              <CardDescription>Todas tus tareas por entregar</CardDescription>
            </CardHeader>
            <CardContent>
              {tareasPendientes.length > 0 ? (
                <div className="space-y-4">
                  {tareasPendientes.map((tarea) => (
                    <div key={tarea.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-1">
                        <p className="font-medium">{tarea.titulo}</p>
                        <p className="text-sm text-muted-foreground">
                          {tarea.grupo.curso.nombre} | Entrega: {formatDate(tarea.fecha_entrega)}
                        </p>
                      </div>
                      <Link href={`/alumno/tareas/${tarea.id}`}>
                        <Button variant="outline" size="sm">
                          Ver tarea
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No tienes tareas pendientes</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
