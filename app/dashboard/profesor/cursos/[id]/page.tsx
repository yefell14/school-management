import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Users, ClipboardList, CheckSquare, Calendar, MessageSquare, FileText, BarChart } from "lucide-react"

export default function DetalleCurso({ params }: { params: { id: string } }) {
  const cursoId = params.id

  // Datos de ejemplo
  const curso = {
    id: Number.parseInt(cursoId),
    nombre: "Matemáticas",
    grado: "6to Primaria",
    seccion: "A",
    estudiantes: 28,
    dias: ["Lunes", "Miércoles", "Viernes"],
    horario: "08:00 - 09:30",
    salon: "Aula 12",
    descripcion:
      "Curso de matemáticas para sexto grado que cubre aritmética, geometría, álgebra básica y resolución de problemas.",
  }

  const tareasRecientes = [
    {
      id: 1,
      titulo: "Ejercicios de álgebra",
      fechaAsignacion: "2023-05-10",
      fechaEntrega: "2023-05-20",
      estado: "Activa",
      entregadas: 20,
      pendientes: 8,
    },
    {
      id: 2,
      titulo: "Problemas de geometría",
      fechaAsignacion: "2023-05-05",
      fechaEntrega: "2023-05-15",
      estado: "Cerrada",
      entregadas: 25,
      pendientes: 3,
    },
    {
      id: 3,
      titulo: "Examen parcial",
      fechaAsignacion: "2023-04-25",
      fechaEntrega: "2023-04-30",
      estado: "Calificada",
      entregadas: 28,
      pendientes: 0,
    },
  ]

  const proximasClases = [
    { id: 1, fecha: "2023-05-15", dia: "Lunes", hora: "08:00 - 09:30", tema: "Ecuaciones de primer grado" },
    {
      id: 2,
      fecha: "2023-05-17",
      dia: "Miércoles",
      hora: "08:00 - 09:30",
      tema: "Resolución de problemas con ecuaciones",
    },
    {
      id: 3,
      fecha: "2023-05-19",
      dia: "Viernes",
      hora: "08:00 - 09:30",
      tema: "Introducción a sistemas de ecuaciones",
    },
  ]

  const evaluaciones = [
    { id: 1, titulo: "Examen parcial 1", fecha: "2023-04-30", tipo: "Examen", promedio: 85 },
    { id: 2, titulo: "Ejercicios de álgebra", fecha: "2023-05-20", tipo: "Tarea", promedio: 78 },
    { id: 3, titulo: "Participación en clase", fecha: "2023-05-01", tipo: "Participación", promedio: 90 },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard/profesor/cursos" className="text-muted-foreground hover:text-primary">
              Mis Cursos
            </Link>
            <span className="text-muted-foreground">/</span>
            <span>{curso.nombre}</span>
          </div>
          <h1 className="text-3xl font-bold text-primary">{curso.nombre}</h1>
          <p className="text-muted-foreground">
            {curso.grado} - Sección {curso.seccion}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/profesor/cursos/${cursoId}/estudiantes`}>
              <Users className="mr-2 h-4 w-4" />
              Estudiantes
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/profesor/cursos/${cursoId}/asistencias`}>
              <CheckSquare className="mr-2 h-4 w-4" />
              Asistencias
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/profesor/cursos/${cursoId}/tareas/nueva`}>
              <ClipboardList className="mr-2 h-4 w-4" />
              Nueva Tarea
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center">
            <BookOpen className="mr-2 h-5 w-5 text-primary" />
            Información del Curso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-1">Horario</h3>
              <p>
                {curso.dias.join(", ")} | {curso.horario}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-1">Salón</h3>
              <p>{curso.salon}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-1">Estudiantes</h3>
              <p>{curso.estudiantes} estudiantes</p>
            </div>
            <div className="md:col-span-3">
              <h3 className="font-medium text-sm text-muted-foreground mb-1">Descripción</h3>
              <p>{curso.descripcion}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="tareas">Tareas</TabsTrigger>
          <TabsTrigger value="evaluaciones">Evaluaciones</TabsTrigger>
          <TabsTrigger value="asistencias">Asistencias</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-primary" />
                  Próximas Clases
                </CardTitle>
                <CardDescription>Calendario de clases programadas</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {proximasClases.map((clase) => (
                    <li key={clase.id} className="p-2 rounded-md hover:bg-muted">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{clase.tema}</p>
                          <p className="text-sm text-muted-foreground">
                            {clase.dia}, {clase.fecha}
                          </p>
                        </div>
                        <p className="text-sm font-medium">{clase.hora}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <ClipboardList className="mr-2 h-5 w-5 text-primary" />
                  Tareas Recientes
                </CardTitle>
                <CardDescription>Tareas asignadas recientemente</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {tareasRecientes.map((tarea) => (
                    <li key={tarea.id} className="p-2 rounded-md hover:bg-muted">
                      <Link href={`/dashboard/profesor/tareas/${tarea.id}`} className="block">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{tarea.titulo}</p>
                            <p className="text-sm text-muted-foreground">Entrega: {tarea.fechaEntrega}</p>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              tarea.estado === "Activa"
                                ? "bg-green-100 text-green-800"
                                : tarea.estado === "Cerrada"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {tarea.estado}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-sm">
                            <span className="text-green-600">{tarea.entregadas}</span>
                            <span className="text-muted-foreground"> entregadas</span>
                          </p>
                          {tarea.pendientes > 0 && (
                            <p className="text-sm">
                              <span className="text-amber-600">{tarea.pendientes}</span>
                              <span className="text-muted-foreground"> por calificar</span>
                            </p>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Users className="mr-2 h-5 w-5 text-primary" />
                  Estudiantes
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex justify-between items-center">
                  <p className="text-3xl font-bold">{curso.estudiantes}</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/profesor/cursos/${cursoId}/estudiantes`}>Ver Lista</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                  Mensajes
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex justify-between items-center">
                  <p className="text-3xl font-bold">5</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/profesor/mensajes?curso=${cursoId}`}>Ver Mensajes</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-primary" />
                  Material
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex justify-between items-center">
                  <p className="text-3xl font-bold">8</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/profesor/cursos/${cursoId}/material`}>Ver Material</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tareas" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Tareas y Actividades</h2>
            <Button asChild>
              <Link href={`/dashboard/profesor/cursos/${cursoId}/tareas/nueva`}>
                <ClipboardList className="mr-2 h-4 w-4" />
                Nueva Tarea
              </Link>
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium">Título</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Fecha Asignación</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Fecha Entrega</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Estado</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Entregadas</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {tareasRecientes.map((tarea) => (
                      <tr
                        key={tarea.id}
                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                      >
                        <td className="p-4 align-middle">{tarea.titulo}</td>
                        <td className="p-4 align-middle">{tarea.fechaAsignacion}</td>
                        <td className="p-4 align-middle">{tarea.fechaEntrega}</td>
                        <td className="p-4 align-middle">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              tarea.estado === "Activa"
                                ? "bg-green-100 text-green-800"
                                : tarea.estado === "Cerrada"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {tarea.estado}
                          </span>
                        </td>
                        <td className="p-4 align-middle">
                          {tarea.entregadas}/{curso.estudiantes}
                          {tarea.pendientes > 0 && (
                            <span className="text-amber-600 text-xs ml-2">({tarea.pendientes} por calificar)</span>
                          )}
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/dashboard/profesor/tareas/${tarea.id}`}>Ver</Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/dashboard/profesor/tareas/${tarea.id}/editar`}>Editar</Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluaciones" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Evaluaciones</h2>
            <Button asChild>
              <Link href={`/dashboard/profesor/cursos/${cursoId}/evaluaciones/nueva`}>
                <BarChart className="mr-2 h-4 w-4" />
                Nueva Evaluación
              </Link>
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium">Título</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Fecha</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Tipo</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Promedio</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {evaluaciones.map((evaluacion) => (
                      <tr
                        key={evaluacion.id}
                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                      >
                        <td className="p-4 align-middle">{evaluacion.titulo}</td>
                        <td className="p-4 align-middle">{evaluacion.fecha}</td>
                        <td className="p-4 align-middle">{evaluacion.tipo}</td>
                        <td className="p-4 align-middle">
                          <span
                            className={`font-medium ${
                              evaluacion.promedio >= 90
                                ? "text-green-600"
                                : evaluacion.promedio >= 70
                                  ? "text-amber-600"
                                  : "text-red-600"
                            }`}
                          >
                            {evaluacion.promedio}
                          </span>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/dashboard/profesor/evaluaciones/${evaluacion.id}`}>Ver</Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/dashboard/profesor/evaluaciones/${evaluacion.id}/editar`}>Editar</Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="asistencias" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Registro de Asistencias</h2>
            <div className="flex space-x-2">
              <Button variant="outline" asChild>
                <Link href={`/dashboard/profesor/cursos/${cursoId}/asistencias`}>
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Registro Manual
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/dashboard/profesor/cursos/${cursoId}/asistencias/escanear`}>Escanear QR</Link>
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Resumen de Asistencias</CardTitle>
              <CardDescription>Últimos 30 días</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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

                <div>
                  <h3 className="text-lg font-medium mb-2">Últimas Sesiones</h3>
                  <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                          <th className="h-12 px-4 text-left align-middle font-medium">Fecha</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Asistencias</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Tardanzas</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Ausencias</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="[&_tr:last-child]:border-0">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                          <td className="p-4 align-middle">2023-05-12</td>
                          <td className="p-4 align-middle text-green-600">26</td>
                          <td className="p-4 align-middle text-amber-600">1</td>
                          <td className="p-4 align-middle text-red-600">1</td>
                          <td className="p-4 align-middle">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/dashboard/profesor/cursos/${cursoId}/asistencias/2023-05-12`}>
                                Ver Detalles
                              </Link>
                            </Button>
                          </td>
                        </tr>
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                          <td className="p-4 align-middle">2023-05-10</td>
                          <td className="p-4 align-middle text-green-600">25</td>
                          <td className="p-4 align-middle text-amber-600">2</td>
                          <td className="p-4 align-middle text-red-600">1</td>
                          <td className="p-4 align-middle">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/dashboard/profesor/cursos/${cursoId}/asistencias/2023-05-10`}>
                                Ver Detalles
                              </Link>
                            </Button>
                          </td>
                        </tr>
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                          <td className="p-4 align-middle">2023-05-08</td>
                          <td className="p-4 align-middle text-green-600">27</td>
                          <td className="p-4 align-middle text-amber-600">0</td>
                          <td className="p-4 align-middle text-red-600">1</td>
                          <td className="p-4 align-middle">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/dashboard/profesor/cursos/${cursoId}/asistencias/2023-05-08`}>
                                Ver Detalles
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
