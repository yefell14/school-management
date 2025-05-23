"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"
import { format, subDays, subMonths } from "date-fns"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

type EstadisticasAsistencia = {
  fecha: string
  total: number
  presentes: number
  ausentes: number
  tardanzas: number
  justificados: number
}

type EstadisticasPorRol = {
  rol: string
  total: number
  porcentaje: number
}

type EstadisticasPorEstado = {
  estado: string
  total: number
  porcentaje: number
}

export default function EstadisticasPage() {
  const [periodo, setPeriodo] = useState<"7dias" | "30dias" | "3meses" | "6meses">("30dias")
  const [asistenciasPorDia, setAsistenciasPorDia] = useState<EstadisticasAsistencia[]>([])
  const [asistenciasPorRol, setAsistenciasPorRol] = useState<EstadisticasPorRol[]>([])
  const [asistenciasPorEstado, setAsistenciasPorEstado] = useState<EstadisticasPorEstado[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [periodo])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Calcular fecha de inicio según el periodo seleccionado
      let fechaInicio = new Date()
      switch (periodo) {
        case "7dias":
          fechaInicio = subDays(new Date(), 7)
          break
        case "30dias":
          fechaInicio = subDays(new Date(), 30)
          break
        case "3meses":
          fechaInicio = subMonths(new Date(), 3)
          break
        case "6meses":
          fechaInicio = subMonths(new Date(), 6)
          break
      }

      const fechaInicioStr = format(fechaInicio, "yyyy-MM-dd")

      // Obtener todas las asistencias en el periodo
      const { data: asistenciasData, error: asistenciasError } = await supabase
        .from("asistencias_general")
        .select("fecha, estado, rol")
        .gte("fecha", fechaInicioStr)
        .order("fecha", { ascending: true })

      if (asistenciasError) throw asistenciasError

      // Procesar datos para gráficos
      processAsistenciasPorDia(asistenciasData || [])
      processAsistenciasPorRol(asistenciasData || [])
      processAsistenciasPorEstado(asistenciasData || [])
    } catch (error: any) {
      console.error("Error al cargar estadísticas:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const processAsistenciasPorDia = (asistencias: any[]) => {
    // Agrupar asistencias por día
    const asistenciasPorDia: Record<string, EstadisticasAsistencia> = {}

    asistencias.forEach((asistencia) => {
      const fecha = asistencia.fecha

      if (!asistenciasPorDia[fecha]) {
        asistenciasPorDia[fecha] = {
          fecha,
          total: 0,
          presentes: 0,
          ausentes: 0,
          tardanzas: 0,
          justificados: 0,
        }
      }

      asistenciasPorDia[fecha].total += 1

      switch (asistencia.estado) {
        case "presente":
          asistenciasPorDia[fecha].presentes += 1
          break
        case "ausente":
          asistenciasPorDia[fecha].ausentes += 1
          break
        case "tardanza":
          asistenciasPorDia[fecha].tardanzas += 1
          break
        case "justificado":
          asistenciasPorDia[fecha].justificados += 1
          break
      }
    })

    // Convertir a array y ordenar por fecha
    const result = Object.values(asistenciasPorDia).sort(
      (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
    )

    // Limitar a los últimos 10 días para mejor visualización
    setAsistenciasPorDia(result.slice(-10))
  }

  const processAsistenciasPorRol = (asistencias: any[]) => {
    // Contar asistencias por rol
    const conteo: Record<string, number> = {
      alumno: 0,
      profesor: 0,
    }

    asistencias.forEach((asistencia) => {
      conteo[asistencia.rol] = (conteo[asistencia.rol] || 0) + 1
    })

    // Calcular total
    const total = Object.values(conteo).reduce((sum, count) => sum + count, 0)

    // Convertir a array con porcentajes
    const result = Object.entries(conteo).map(([rol, count]) => ({
      rol: rol === "alumno" ? "Alumnos" : "Profesores",
      total: count,
      porcentaje: total > 0 ? Math.round((count / total) * 100) : 0,
    }))

    setAsistenciasPorRol(result)
  }

  const processAsistenciasPorEstado = (asistencias: any[]) => {
    // Contar asistencias por estado
    const conteo: Record<string, number> = {
      presente: 0,
      ausente: 0,
      tardanza: 0,
      justificado: 0,
    }

    asistencias.forEach((asistencia) => {
      conteo[asistencia.estado] = (conteo[asistencia.estado] || 0) + 1
    })

    // Calcular total
    const total = Object.values(conteo).reduce((sum, count) => sum + count, 0)

    // Convertir a array con porcentajes
    const result = Object.entries(conteo).map(([estado, count]) => ({
      estado: estado.charAt(0).toUpperCase() + estado.slice(1),
      total: count,
      porcentaje: total > 0 ? Math.round((count / total) * 100) : 0,
    }))

    setAsistenciasPorEstado(result)
  }

  // Colores para los gráficos
  const COLORS = ["#2563eb", "#f97316", "#ef4444", "#10b981"]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Estadísticas</h2>
        <Select value={periodo} onValueChange={(value: "7dias" | "30dias" | "3meses" | "6meses") => setPeriodo(value)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Periodo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7dias">Últimos 7 días</SelectItem>
            <SelectItem value="30dias">Últimos 30 días</SelectItem>
            <SelectItem value="3meses">Últimos 3 meses</SelectItem>
            <SelectItem value="6meses">Últimos 6 meses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="asistencias" className="space-y-4">
        <TabsList>
          <TabsTrigger value="asistencias">Asistencias</TabsTrigger>
          <TabsTrigger value="roles">Por Rol</TabsTrigger>
          <TabsTrigger value="estados">Por Estado</TabsTrigger>
        </TabsList>

        <TabsContent value="asistencias" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asistencias por Día</CardTitle>
              <CardDescription>Registro de asistencias diarias</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">Cargando estadísticas...</div>
              ) : asistenciasPorDia.length === 0 ? (
                <div className="flex justify-center py-12 text-muted-foreground">No hay datos disponibles</div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={asistenciasPorDia} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="fecha" angle={-45} textAnchor="end" tick={{ fontSize: 12 }} height={60} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="presentes" name="Presentes" fill="#2563eb" />
                      <Bar dataKey="tardanzas" name="Tardanzas" fill="#f97316" />
                      <Bar dataKey="ausentes" name="Ausentes" fill="#ef4444" />
                      <Bar dataKey="justificados" name="Justificados" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asistencias por Rol</CardTitle>
              <CardDescription>Distribución de asistencias entre alumnos y profesores</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">Cargando estadísticas...</div>
              ) : asistenciasPorRol.length === 0 ? (
                <div className="flex justify-center py-12 text-muted-foreground">No hay datos disponibles</div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={asistenciasPorRol}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="total"
                        nameKey="rol"
                      >
                        {asistenciasPorRol.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} asistencias`, "Total"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estados" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asistencias por Estado</CardTitle>
              <CardDescription>Distribución de asistencias según su estado</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">Cargando estadísticas...</div>
              ) : asistenciasPorEstado.length === 0 ? (
                <div className="flex justify-center py-12 text-muted-foreground">No hay datos disponibles</div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={asistenciasPorEstado}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="total"
                        nameKey="estado"
                      >
                        {asistenciasPorEstado.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} asistencias`, "Total"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Resumen de Estadísticas</CardTitle>
          <CardDescription>Información general sobre las asistencias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border p-3">
              <div className="text-sm font-medium text-muted-foreground">Total Asistencias</div>
              <div className="text-2xl font-bold">
                {loading ? "..." : asistenciasPorDia.reduce((sum, day) => sum + day.total, 0)}
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-sm font-medium text-muted-foreground">Presentes</div>
              <div className="text-2xl font-bold text-blue-600">
                {loading ? "..." : asistenciasPorDia.reduce((sum, day) => sum + day.presentes, 0)}
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-sm font-medium text-muted-foreground">Tardanzas</div>
              <div className="text-2xl font-bold text-orange-500">
                {loading ? "..." : asistenciasPorDia.reduce((sum, day) => sum + day.tardanzas, 0)}
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-sm font-medium text-muted-foreground">Ausencias</div>
              <div className="text-2xl font-bold text-red-500">
                {loading ? "..." : asistenciasPorDia.reduce((sum, day) => sum + day.ausentes, 0)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
