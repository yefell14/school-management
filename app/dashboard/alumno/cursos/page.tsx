"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase, type Grupo } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookOpen, Calendar, Search } from "lucide-react"
import Link from "next/link"

export default function CursosPage() {
  const { user } = useAuth()
  const [cursos, setCursos] = useState<
    (Grupo & {
      curso: { nombre: string; descripcion: string | null }
      grado: { nombre: string }
      seccion: { nombre: string }
    })[]
  >([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCursos = async () => {
      if (!user) return

      try {
        const { data: gruposData, error: gruposError } = await supabase
          .from("grupo_alumno")
          .select(`
            grupo_id,
            grupo:grupos(
              id,
              año_escolar,
              curso:cursos(id, nombre, descripcion),
              grado:grados(id, nombre),
              seccion:secciones(id, nombre)
            )
          `)
          .eq("alumno_id", user.id)

        if (gruposError) throw gruposError

        const gruposFormatted = gruposData.map((item) => ({
          id: item.grupo.id,
          año_escolar: item.grupo.año_escolar,
          curso_id: item.grupo.curso.id,
          grado_id: item.grupo.grado.id,
          seccion_id: item.grupo.seccion.id,
          curso: item.grupo.curso,
          grado: item.grupo.grado,
          seccion: item.grupo.seccion,
          activo: true,
        }))

        setCursos(gruposFormatted)
      } catch (error) {
        console.error("Error fetching courses:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCursos()
  }, [user])

  const filteredCursos = cursos.filter((curso) => curso.curso.nombre.toLowerCase().includes(searchTerm.toLowerCase()))

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Mis Cursos</h1>
        <p className="text-muted-foreground">Explora todos tus cursos inscritos en este periodo académico</p>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar cursos..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredCursos.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCursos.map((curso) => (
            <Card key={curso.id} className="overflow-hidden">
              <CardHeader className="bg-primary text-primary-foreground">
                <CardTitle>{curso.curso.nombre}</CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  {curso.grado.nombre} - {curso.seccion.nombre}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {curso.curso.descripcion || "Sin descripción disponible"}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                    <span>{curso.año_escolar}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 p-4">
                <Link href={`/dashboard/alumno/cursos/${curso.id}`} className="w-full">
                  <Button className="w-full">Ver detalles</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex h-[300px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No se encontraron cursos</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchTerm
              ? "No hay cursos que coincidan con tu búsqueda"
              : "No estás inscrito en ningún curso actualmente"}
          </p>
        </div>
      )}
    </div>
  )
}
