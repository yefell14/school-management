"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, GraduationCap, BookOpen, Calendar } from "lucide-react"
import { getEstadisticasDashboard } from "@/lib/api"

export default function AdminDashboard() {
  const [estadisticas, setEstadisticas] = useState<any>({
    usuariosPorRol: [],
    cursosActivos: 0,
    gruposActivos: 0,
    eventosProximos: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        const data = await getEstadisticasDashboard()
        setEstadisticas(data)
      } catch (error) {
        console.error("Error al cargar estadísticas:", error)
      } finally {
        setLoading(false)
      }
    }

    cargarEstadisticas()
  }, [])

  // Calcular totales
  const totalEstudiantes = estadisticas.usuariosPorRol.find((item: any) => item.rol === "alumno")?.count || 0
  const totalProfesores = estadisticas.usuariosPorRol.find((item: any) => item.rol === "profesor")?.count || 0
  const totalAuxiliares = estadisticas.usuariosPorRol.find((item: any) => item.rol === "auxiliar")?.count || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
        <p className="text-muted-foreground">
          Bienvenido al panel de administración del sistema escolar María de los Ángeles.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="analytics">Estadísticas</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : totalEstudiantes}</div>
                <p className="text-xs text-muted-foreground">Alumnos activos en el sistema</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-yellow-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Profesores</CardTitle>
                <GraduationCap className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : totalProfesores}</div>
                <p className="text-xs text-muted-foreground">Profesores activos en el sistema</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cursos Activos</CardTitle>
                <BookOpen className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : estadisticas.cursosActivos}</div>
                <p className="text-xs text-muted-foreground">Cursos disponibles</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-orange-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Grupos Activos</CardTitle>
                <Calendar className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : estadisticas.gruposActivos}</div>
                <p className="text-xs text-muted-foreground">Grupos académicos</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Distribución de Usuarios</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[200px] flex items-end justify-between gap-2 p-4">
                  {loading ? (
                    <div className="flex items-center justify-center w-full h-full">
                      <p>Cargando datos...</p>
                    </div>
                  ) : (
                    <>
                      <div className="relative flex flex-col items-center">
                        <div
                          className="bg-blue-500 rounded-t-md w-12"
                          style={{
                            height: `${totalEstudiantes ? (totalEstudiantes * 100) / Math.max(totalEstudiantes, totalProfesores, totalAuxiliares, 1) : 0}px`,
                          }}
                        ></div>
                        <span className="text-xs mt-2">Alumnos</span>
                        <span className="absolute top-0 -translate-y-7 text-xs font-bold">{totalEstudiantes}</span>
                      </div>
                      <div className="relative flex flex-col items-center">
                        <div
                          className="bg-yellow-500 rounded-t-md w-12"
                          style={{
                            height: `${totalProfesores ? (totalProfesores * 100) / Math.max(totalEstudiantes, totalProfesores, totalAuxiliares, 1) : 0}px`,
                          }}
                        ></div>
                        <span className="text-xs mt-2">Profesores</span>
                        <span className="absolute top-0 -translate-y-7 text-xs font-bold">{totalProfesores}</span>
                      </div>
                      <div className="relative flex flex-col items-center">
                        <div
                          className="bg-green-500 rounded-t-md w-12"
                          style={{
                            height: `${totalAuxiliares ? (totalAuxiliares * 100) / Math.max(totalEstudiantes, totalProfesores, totalAuxiliares, 1) : 0}px`,
                          }}
                        ></div>
                        <span className="text-xs mt-2">Auxiliares</span>
                        <span className="absolute top-0 -translate-y-7 text-xs font-bold">{totalAuxiliares}</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Eventos Próximos</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-40">
                    <p>Cargando eventos...</p>
                  </div>
                ) : estadisticas.eventosProximos.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No hay eventos próximos programados.</div>
                ) : (
                  <div className="space-y-4">
                    {estadisticas.eventosProximos.map((evento: any) => (
                      <div key={evento.id} className="flex items-start space-x-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Calendar className="h-4 w-4 text-blue-700" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{evento.titulo}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(evento.fecha_inicio).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Las estadísticas detalladas estarán disponibles próximamente.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reportes del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Los reportes generados se mostrarán aquí.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Las notificaciones se mostrarán aquí.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
