"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from "next/navigation"

type Horario = {
  id: number
  grupo_id: string
  dia: string
  hora_inicio: string
  hora_fin: string
  aula?: string
  grupo: {
    id: string
    curso: {
      id: string
      nombre: string
    }
    grado: {
      nombre: string
    }
    seccion: {
      nombre: string
    }
  }
}

export default function HorarioPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [horarios, setHorarios] = useState<Horario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHorarios = async () => {
      if (!user) {
        router.push('/login')
        return
      }

      try {
        // Verificar que el usuario sea alumno
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('rol')
          .eq('id', user.id)
          .single()

        if (userError) throw userError

        if (userData.rol !== 'alumno') {
          setError('No tienes permisos para acceder a esta sección')
          return
        }

        // Get student's groups
        const { data: gruposData, error: gruposError } = await supabase
          .from("grupo_alumno")
          .select("grupo_id")
          .eq("alumno_id", user.id)

        if (gruposError) throw gruposError

        const grupoIds = gruposData.map((item) => item.grupo_id)

        if (grupoIds.length > 0) {
          // Get schedules for those groups
          const { data: horariosData, error: horariosError } = await supabase
            .from("horarios")
            .select(`
              *,
              grupo:grupos(
                id,
                curso:cursos(id, nombre),
                grado:grados(nombre),
                seccion:secciones(nombre)
              )
            `)
            .in("grupo_id", grupoIds)
            .order("dia", { ascending: true })
            .order("hora_inicio", { ascending: true })

          if (horariosError) throw horariosError
          setHorarios(horariosData)
        }
      } catch (error: any) {
        console.error("Error fetching schedules:", error)
        setError(error.message || 'Error al cargar el horario')
      } finally {
        setLoading(false)
      }
    }

    fetchHorarios()
  }, [user, router])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Mi Horario</h1>
          <p className="text-muted-foreground">Consulta tu horario semanal de clases</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const diasOrden = {
    lunes: 1,
    martes: 2,
    miércoles: 3,
    jueves: 4,
    viernes: 5,
    sábado: 6,
    domingo: 7,
  }

  const formatDia = (dia: string) => {
    return dia.charAt(0).toUpperCase() + dia.slice(1)
  }

  // Group schedules by day
  const horariosPorDia = horarios.reduce(
    (acc, horario) => {
      if (!acc[horario.dia]) {
        acc[horario.dia] = []
      }
      acc[horario.dia].push(horario)
      return acc
    },
    {} as Record<string, Horario[]>,
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Mi Horario</h1>
        <p className="text-muted-foreground">Consulta tu horario semanal de clases</p>
      </div>

      <div className="grid gap-6">
        {Object.entries(horariosPorDia)
          .sort(
            ([diaA], [diaB]) => diasOrden[diaA as keyof typeof diasOrden] - diasOrden[diaB as keyof typeof diasOrden],
          )
          .map(([dia, horariosDia]) => (
            <Card key={dia}>
              <CardHeader className="bg-primary text-primary-foreground">
                <CardTitle>{formatDia(dia)}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {horariosDia.map((horario) => (
                    <div key={horario.id} className="flex items-center p-4">
                      <div className="flex w-24 flex-shrink-0 items-center justify-center">
                        <div className="text-center">
                          <p className="font-medium">{horario.hora_inicio}</p>
                          <p className="text-xs text-muted-foreground">a</p>
                          <p className="font-medium">{horario.hora_fin}</p>
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="font-medium">{horario.grupo.curso.nombre}</p>
                        <p className="text-sm text-muted-foreground">
                          {horario.grupo.grado.nombre} - {horario.grupo.seccion.nombre}
                        </p>
                        {horario.aula && <p className="text-sm text-muted-foreground">Aula: {horario.aula}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

        {Object.keys(horariosPorDia).length === 0 && (
          <div className="flex h-[300px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No hay horarios disponibles</h3>
            <p className="mt-2 text-sm text-muted-foreground">No tienes clases programadas en este momento</p>
          </div>
        )}
      </div>
    </div>
  )
}
