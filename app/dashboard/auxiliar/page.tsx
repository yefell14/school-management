"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Overview } from "@/components/dashboard/overview"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { DashboardStats } from "@/components/dashboard/stats"
import { getSupabaseBrowser } from "@/lib/supabase-browser"
import { toast } from "@/components/ui/use-toast"

interface DashboardData {
  totalAlumnos: number
  totalProfesores: number
  asistenciasHoy: number
  asistenciasSemana: number
  asistenciasPorDia: {
    fecha: string
    presentes: number
    ausentes: number
    tardanzas: number
    justificados: number
  }[]
  actividadesRecientes: {
    id: string
    tipo: string
    descripcion: string
    fecha: string
    usuario: {
      nombre: string
      apellidos: string
      avatar: string
    }
  }[]
}

export default function AuxiliarDashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const supabase = getSupabaseBrowser()

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Obtener total de alumnos
        const { count: totalAlumnos } = await supabase
          .from('usuarios')
          .select('*', { count: 'exact', head: true })
          .eq('rol', 'alumno')

        // Obtener total de profesores
        const { count: totalProfesores } = await supabase
          .from('usuarios')
          .select('*', { count: 'exact', head: true })
          .eq('rol', 'profesor')

        // Obtener asistencias de hoy
        const hoy = new Date().toISOString().split('T')[0]
        const { count: asistenciasHoy } = await supabase
          .from('asistencias_general')
          .select('*', { count: 'exact', head: true })
          .eq('fecha', hoy)

        // Obtener asistencias de la semana
        const inicioSemana = new Date()
        inicioSemana.setDate(inicioSemana.getDate() - 7)
        const { count: asistenciasSemana } = await supabase
          .from('asistencias_general')
          .select('*', { count: 'exact', head: true })
          .gte('fecha', inicioSemana.toISOString().split('T')[0])

        // Obtener asistencias por día de la última semana
        const { data: asistenciasPorDia } = await supabase
          .from('asistencias_general')
          .select('fecha, estado')
          .gte('fecha', inicioSemana.toISOString().split('T')[0])
          .order('fecha', { ascending: true })

        // Procesar asistencias por día
        const asistenciasProcesadas = asistenciasPorDia?.reduce((acc: any, curr) => {
          const fecha = curr.fecha
          if (!acc[fecha]) {
            acc[fecha] = {
              fecha,
              presentes: 0,
              ausentes: 0,
              tardanzas: 0,
              justificados: 0
            }
          }
          acc[fecha][curr.estado]++
          return acc
        }, {})

        // Obtener actividades recientes
        const { data: actividadesRecientes } = await supabase
          .from('actividades_auxiliar')
          .select(`
            id,
            tipo,
            detalles,
            created_at,
            auxiliar:usuarios (
              nombre,
              apellidos,
              avatar
            )
          `)
          .order('created_at', { ascending: false })
          .limit(5)

        setData({
          totalAlumnos: totalAlumnos || 0,
          totalProfesores: totalProfesores || 0,
          asistenciasHoy: asistenciasHoy || 0,
          asistenciasSemana: asistenciasSemana || 0,
          asistenciasPorDia: Object.values(asistenciasProcesadas || {}),
          actividadesRecientes: actividadesRecientes?.map(act => ({
            id: act.id,
            tipo: act.tipo,
            descripcion: act.detalles,
            fecha: act.created_at,
            usuario: {
              nombre: act.auxiliar.nombre,
              apellidos: act.auxiliar.apellidos,
              avatar: act.auxiliar.avatar
            }
          })) || []
        })
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del dashboard",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Auxiliar</h2>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="analytics">Analíticas</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <DashboardStats 
            totalAlumnos={data?.totalAlumnos || 0}
            totalProfesores={data?.totalProfesores || 0}
            asistenciasHoy={data?.asistenciasHoy || 0}
            asistenciasSemana={data?.asistenciasSemana || 0}
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Resumen de Asistencias</CardTitle>
                <CardDescription>Registro de asistencias en los últimos 7 días</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview data={data?.asistenciasPorDia || []} />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>Últimas acciones realizadas</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentActivity activities={data?.actividadesRecientes || []} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analíticas de Asistencia</CardTitle>
              <CardDescription>Estadísticas detalladas de asistencia por curso y sección</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[400px]">
                {/* Aquí irían los gráficos de analíticas */}
                <p className="text-center text-muted-foreground pt-20">Gráficos de analíticas se cargarán aquí</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reportes Generados</CardTitle>
              <CardDescription>Listado de reportes generados recientemente</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[400px]">
                {/* Aquí iría la lista de reportes */}
                <p className="text-center text-muted-foreground pt-20">Lista de reportes se cargará aquí</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
