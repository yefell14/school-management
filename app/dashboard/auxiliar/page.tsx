import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Users,
  Clock,
  CalendarCheck,
  BarChart3,
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  UserX,
} from "lucide-react"
import Link from "next/link"

export default function AuxiliarDashboard() {
  // Datos de ejemplo para el dashboard
  const estadisticasHoy = {
    totalAlumnos: 1245,
    totalProfesores: 64,
    asistenciaAlumnos: 1180,
    asistenciaProfesores: 62,
    tardanzasAlumnos: 45,
    tardanzasProfesores: 2,
    faltasAlumnos: 20,
    faltasProfesores: 0,
  }

  // Calcular porcentajes
  const porcentajeAsistenciaAlumnos = Math.round(
    (estadisticasHoy.asistenciaAlumnos / estadisticasHoy.totalAlumnos) * 100,
  )
  const porcentajeAsistenciaProfesores = Math.round(
    (estadisticasHoy.asistenciaProfesores / estadisticasHoy.totalProfesores) * 100,
  )

  // Actividad reciente (ejemplo)
  const actividadReciente = [
    {
      id: 1,
      tipo: "asistencia",
      usuario: "María López",
      rol: "alumno",
      accion: "Registro de entrada",
      hora: "07:45 AM",
    },
    {
      id: 2,
      tipo: "asistencia",
      usuario: "Juan Pérez",
      rol: "profesor",
      accion: "Registro de entrada",
      hora: "07:30 AM",
    },
    { id: 3, tipo: "asistencia", usuario: "Carlos Gómez", rol: "alumno", accion: "Registro tardío", hora: "08:15 AM" },
    {
      id: 4,
      tipo: "justificacion",
      usuario: "Ana Martínez",
      rol: "alumno",
      accion: "Justificación registrada",
      hora: "09:00 AM",
    },
    {
      id: 5,
      tipo: "asistencia",
      usuario: "Pedro Sánchez",
      rol: "profesor",
      accion: "Registro de entrada",
      hora: "07:35 AM",
    },
  ]

  // Próximos eventos
  const proximosEventos = [
    { id: 1, titulo: "Reunión de padres", fecha: "15 Mayo, 2023", hora: "16:00", lugar: "Auditorio" },
    { id: 2, titulo: "Simulacro de evacuación", fecha: "18 Mayo, 2023", hora: "10:30", lugar: "Todo el campus" },
    { id: 3, titulo: "Día del Maestro", fecha: "20 Mayo, 2023", hora: "Todo el día", lugar: "Institución" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Auxiliar</h1>
        <p className="text-muted-foreground">
          Bienvenido al panel de control para auxiliares del sistema escolar María de los Ángeles.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asistencia Alumnos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{porcentajeAsistenciaAlumnos}%</div>
            <p className="text-xs text-muted-foreground">
              {estadisticasHoy.asistenciaAlumnos} de {estadisticasHoy.totalAlumnos} alumnos
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asistencia Profesores</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{porcentajeAsistenciaProfesores}%</div>
            <p className="text-xs text-muted-foreground">
              {estadisticasHoy.asistenciaProfesores} de {estadisticasHoy.totalProfesores} profesores
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tardanzas Hoy</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estadisticasHoy.tardanzasAlumnos + estadisticasHoy.tardanzasProfesores}
            </div>
            <p className="text-xs text-muted-foreground">
              {estadisticasHoy.tardanzasAlumnos} alumnos, {estadisticasHoy.tardanzasProfesores} profesores
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faltas Hoy</CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticasHoy.faltasAlumnos + estadisticasHoy.faltasProfesores}</div>
            <p className="text-xs text-muted-foreground">
              {estadisticasHoy.faltasAlumnos} alumnos, {estadisticasHoy.faltasProfesores} profesores
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="actividad" className="space-y-4">
        <TabsList>
          <TabsTrigger value="actividad">Actividad Reciente</TabsTrigger>
          <TabsTrigger value="eventos">Próximos Eventos</TabsTrigger>
          <TabsTrigger value="acciones">Acciones Rápidas</TabsTrigger>
        </TabsList>

        <TabsContent value="actividad" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>Últimos registros de asistencia y actividades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {actividadReciente.map((actividad) => (
                  <div key={actividad.id} className="flex items-start space-x-4 p-3 border rounded-lg">
                    {actividad.tipo === "asistencia" ? (
                      actividad.accion.includes("tardío") ? (
                        <AlertCircle className="h-5 w-5 text-yellow-500 mt-1" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                      )
                    ) : (
                      <Bell className="h-5 w-5 text-blue-500 mt-1" />
                    )}
                    <div className="space-y-1">
                      <p className="font-medium">
                        {actividad.usuario} <span className="text-sm text-muted-foreground">({actividad.rol})</span>
                      </p>
                      <p className="text-sm">{actividad.accion}</p>
                      <p className="text-xs text-muted-foreground">{actividad.hora}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-center">
                <Button variant="outline" size="sm">
                  Ver todas las actividades
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="eventos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Próximos Eventos</CardTitle>
              <CardDescription>Eventos programados en la institución</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {proximosEventos.map((evento) => (
                  <div key={evento.id} className="flex items-start space-x-4 p-3 border rounded-lg">
                    <CalendarCheck className="h-5 w-5 text-blue-500 mt-1" />
                    <div className="space-y-1">
                      <p className="font-medium">{evento.titulo}</p>
                      <p className="text-sm">
                        {evento.fecha} - {evento.hora}
                      </p>
                      <p className="text-xs text-muted-foreground">Lugar: {evento.lugar}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-center">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/auxiliar/eventos">Ver todos los eventos</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="acciones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>Accesos directos a funciones principales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-auto flex flex-col items-center justify-center p-4 space-y-2"
                  asChild
                >
                  <Link href="/dashboard/auxiliar/asistencia">
                    <UserCheck className="h-6 w-6 mb-2" />
                    <span>Registrar Asistencia</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex flex-col items-center justify-center p-4 space-y-2"
                  asChild
                >
                  <Link href="/dashboard/auxiliar/historial">
                    <Clock className="h-6 w-6 mb-2" />
                    <span>Historial de Asistencia</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex flex-col items-center justify-center p-4 space-y-2"
                  asChild
                >
                  <Link href="/dashboard/auxiliar/reportes">
                    <BarChart3 className="h-6 w-6 mb-2" />
                    <span>Reportes y Estadísticas</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex flex-col items-center justify-center p-4 space-y-2"
                  asChild
                >
                  <Link href="/dashboard/auxiliar/matriculas">
                    <Users className="h-6 w-6 mb-2" />
                    <span>Matrículas</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex flex-col items-center justify-center p-4 space-y-2"
                  asChild
                >
                  <Link href="/dashboard/auxiliar/eventos">
                    <CalendarCheck className="h-6 w-6 mb-2" />
                    <span>Eventos</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex flex-col items-center justify-center p-4 space-y-2"
                  asChild
                >
                  <Link href="/dashboard/auxiliar/mensajes">
                    <Bell className="h-6 w-6 mb-2" />
                    <span>Mensajes</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Asistencia</CardTitle>
            <CardDescription>Estadísticas de asistencia del día actual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Alumnos</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Presentes
                    </span>
                    <span className="font-medium">{estadisticasHoy.asistenciaAlumnos}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" /> Tardanzas
                    </span>
                    <span className="font-medium">{estadisticasHoy.tardanzasAlumnos}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <XCircle className="h-4 w-4 text-red-500 mr-2" /> Faltas
                    </span>
                    <span className="font-medium">{estadisticasHoy.faltasAlumnos}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Profesores</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Presentes
                    </span>
                    <span className="font-medium">{estadisticasHoy.asistenciaProfesores}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" /> Tardanzas
                    </span>
                    <span className="font-medium">{estadisticasHoy.tardanzasProfesores}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <XCircle className="h-4 w-4 text-red-500 mr-2" /> Faltas
                    </span>
                    <span className="font-medium">{estadisticasHoy.faltasProfesores}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tokens de Registro</CardTitle>
            <CardDescription>Tokens pendientes de registro</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tokens de alumnos sin usar</span>
                <span className="text-lg font-bold">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tokens de profesores sin usar</span>
                <span className="text-lg font-bold">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tokens usados esta semana</span>
                <span className="text-lg font-bold">12</span>
              </div>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/dashboard/auxiliar/matriculas">Ver detalles de matrículas</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
