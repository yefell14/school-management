"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Search, Users, ClipboardList, CheckSquare } from "lucide-react"
import { getCursosProfesor } from "@/lib/api"
import { useSession } from "@/lib/hooks/use-session"
import type { Grupo } from "@/lib/supabase"

export default function CursosProfesor() {
  const { session } = useSession()
  const [searchTerm, setSearchTerm] = useState("")
  const [cursos, setCursos] = useState<Grupo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarCursos = async () => {
      if (!session?.user?.id) return

      try {
        const data = await getCursosProfesor(session.user.id)
        setCursos(data)
      } catch (error) {
        console.error("Error al cargar cursos:", error)
      } finally {
        setLoading(false)
      }
    }

    cargarCursos()
  }, [session?.user?.id])

  // Filtrar cursos basado en el término de búsqueda
  const cursosFiltrados = cursos.filter((grupo) => {
    const searchTermLower = searchTerm.toLowerCase()
    return (
      grupo.curso?.nombre.toLowerCase().includes(searchTermLower) ||
      grupo.grado?.nombre.toLowerCase().includes(searchTermLower) ||
      grupo.seccion?.nombre.toLowerCase().includes(searchTermLower)
    )
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-primary">Mis Cursos</h1>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Buscar cursos..." 
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="activos" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="activos">Cursos Activos</TabsTrigger>
          <TabsTrigger value="anteriores">Cursos Anteriores</TabsTrigger>
        </TabsList>

        <TabsContent value="activos" className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : cursosFiltrados.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                {searchTerm ? "No se encontraron cursos que coincidan con la búsqueda." : "No tienes cursos asignados actualmente."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cursosFiltrados.map((grupo) => (
                <Card key={grupo.id} className="overflow-hidden">
                  <CardHeader className="bg-primary/5 pb-2">
                    <CardTitle className="flex items-start justify-between">
                      <div className="flex items-center">
                        <BookOpen className="mr-2 h-5 w-5 text-primary" />
                        <span>{grupo.curso?.nombre}</span>
                      </div>
                      <span className="text-sm font-normal bg-primary/10 px-2 py-1 rounded-md">
                        {grupo.grado?.nombre} - {grupo.seccion?.nombre}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/profesor/cursos/${grupo.id}/estudiantes`}>
                          <Users className="mr-2 h-4 w-4" />
                          Estudiantes
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/profesor/cursos/${grupo.id}/asistencias`}>
                          <CheckSquare className="mr-2 h-4 w-4" />
                          Asistencias
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/profesor/cursos/${grupo.id}/tareas`}>
                          <ClipboardList className="mr-2 h-4 w-4" />
                          Tareas
                        </Link>
                      </Button>
                      <Button variant="default" size="sm" asChild>
                        <Link href={`/dashboard/profesor/cursos/${grupo.id}`}>Ver Detalles</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="anteriores">
          <div className="rounded-lg border border-dashed p-8 text-center">
            <h3 className="text-lg font-medium mb-2">No hay cursos anteriores</h3>
            <p className="text-muted-foreground">Los cursos de periodos académicos anteriores aparecerán aquí.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
