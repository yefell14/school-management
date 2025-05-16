"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Calendar, Users } from "lucide-react"
import { useSession } from "@/lib/hooks/use-session"
import { supabase } from "@/lib/supabase"

export default function AsistenciasCurso({ params }: { params: { id: string } }) {
  const { session } = useSession()
  const [loading, setLoading] = useState(true)
  const [curso, setCurso] = useState<any>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Primero obtenemos el ID del usuario de la tabla usuarios
  useEffect(() => {
    const obtenerUsuarioId = async () => {
      if (!session?.user?.id) return

      try {
        const { data: usuario, error } = await supabase
          .from("usuarios")
          .select("id")
          .eq("auth_id", session.user.id)
          .single()

        if (error) throw error
        if (usuario) setUserId(usuario.id)
      } catch (error) {
        console.error("Error al obtener usuario:", error)
      }
    }

    obtenerUsuarioId()
  }, [session?.user?.id])

  // Luego cargamos el curso usando el ID correcto del usuario
  useEffect(() => {
    const cargarCurso = async () => {
      if (!userId || !params.id) return

      try {
        const { data: grupo, error } = await supabase
          .from("grupos")
          .select(`
            *,
            curso:cursos(*),
            grado:grados(*),
            seccion:secciones(*)
          `)
          .eq("id", params.id)
          .single()

        if (error) throw error
        if (grupo) setCurso({
          ...grupo,
          nombre: grupo.curso?.nombre,
          grado: grupo.grado?.nombre,
          seccion: grupo.seccion?.nombre
        })
      } catch (error) {
        console.error("Error al cargar curso:", error)
      } finally {
        setLoading(false)
      }
    }

    cargarCurso()
  }, [userId, params.id])

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard/profesor/cursos" className="text-muted-foreground hover:text-primary">
              Mis Cursos
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link
              href={`/dashboard/profesor/cursos/${params.id}`}
              className="text-muted-foreground hover:text-primary"
            >
              {curso?.nombre || "Cargando..."}
            </Link>
            <span className="text-muted-foreground">/</span>
            <span>Asistencias</span>
          </div>
          <h1 className="text-3xl font-bold text-primary">Control de Asistencias</h1>
          <p className="text-muted-foreground">
            {curso ? `${curso.grado} - ${curso.seccion}` : "Cargando..."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Registrar Asistencia
          </Button>
          <Button>
            <Users className="mr-2 h-4 w-4" />
            Ver Lista
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Asistencias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Asistencias</p>
                  <p className="text-3xl font-bold text-green-700">92%</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg">
                  <p className="text-sm text-amber-600 font-medium">Tardanzas</p>
                  <p className="text-3xl font-bold text-amber-700">5%</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-600 font-medium">Ausencias</p>
                  <p className="text-3xl font-bold text-red-700">3%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registro de Asistencias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Próximamente: Historial de asistencias y registros detallados
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
