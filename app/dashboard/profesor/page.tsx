import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, BookOpen, ClipboardList, MessageSquare, Users, CheckSquare } from "lucide-react"

export default function ProfesorDashboard() {
  // Datos de ejemplo
  const cursos = [
    { id: 1, nombre: "Matemáticas", grado: "6to Primaria", seccion: "A" },
    { id: 2, nombre: "Ciencias Naturales", grado: "5to Primaria", seccion: "B" },
    { id: 3, nombre: "Historia", grado: "6to Primaria", seccion: "A" },
  ]

  const tareasRecientes = [
    { id: 1, titulo: "Ejercicios de álgebra", curso: "Matemáticas", fechaEntrega: "2023-05-20", pendientes: 5 },
    {
      id: 2,
      titulo: "Investigación sobre ecosistemas",
      curso: "Ciencias Naturales",
      fechaEntrega: "2023-05-22",
      pendientes: 8,
    },
  ]

  const proximasClases = [
    { id: 1, curso: "Matemáticas", grado: "6to Primaria", seccion: "A", hora: "08:00 - 09:30", dia: "Lunes" },
    { id: 2, curso: "Ciencias Naturales", grado: "5to Primaria", seccion: "B", hora: "10:00 - 11:30", dia: "Lunes" },
    { id: 3, curso: "Historia", grado: "6to Primaria", seccion: "A", hora: "08:00 - 09:30", dia: "Martes" },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Panel del Profesor</h1>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/profesor/mensajes">
              <MessageSquare className="mr-2 h-4 w-4" />
              Mensajes
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/profesor/tareas">
              <ClipboardList className="mr-2 h-4 w-4" />
              Tareas
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <BookOpen className="mr-2 h-5 w-5 text-primary" />
              Mis Cursos
            </CardTitle>
            <CardDescription>Cursos asignados actualmente</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <ul className="space-y-2">
              {cursos.map((curso) => (
                <li key={curso.id} className="p-2 rounded-md hover:bg-muted">
                  <Link href={`/dashboard/profesor/cursos/${curso.id}`} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{curso.nombre}</p>
                      <p className="text-sm text-muted-foreground">
                        {curso.grado} - {curso.seccion}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Ver
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href="/dashboard/profesor/cursos">Ver todos los cursos</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <ClipboardList className="mr-2 h-5 w-5 text-primary" />
              Tareas Recientes
            </CardTitle>
            <CardDescription>Tareas asignadas recientemente</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <ul className="space-y-2">
              {tareasRecientes.map((tarea) => (
                <li key={tarea.id} className="p-2 rounded-md hover:bg-muted">
                  <Link href={`/dashboard/profesor/tareas/${tarea.id}`} className="block">
                    <p className="font-medium">{tarea.titulo}</p>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">{tarea.curso}</p>
                      <p className="text-sm text-muted-foreground">Entrega: {tarea.fechaEntrega}</p>
                    </div>
                    <p className="text-sm text-amber-600">{tarea.pendientes} pendientes por calificar</p>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href="/dashboard/profesor/tareas">Ver todas las tareas</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <CalendarDays className="mr-2 h-5 w-5 text-primary" />
              Próximas Clases
            </CardTitle>
            <CardDescription>Horario de clases próximas</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <ul className="space-y-2">
              {proximasClases.map((clase) => (
                <li key={clase.id} className="p-2 rounded-md hover:bg-muted">
                  <p className="font-medium">{clase.curso}</p>
                  <p className="text-sm text-muted-foreground">
                    {clase.grado} - {clase.seccion}
                  </p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm font-medium text-primary">{clase.dia}</p>
                    <p className="text-sm text-muted-foreground">{clase.hora}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <div className="flex space-x-2 w-full">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link href="/dashboard/profesor/asistencias">
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Asistencias
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link href="/dashboard/profesor/cursos">
                  <Users className="mr-2 h-4 w-4" />
                  Estudiantes
                </Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <CheckSquare className="mr-2 h-5 w-5 text-primary" />
              Registro de Asistencias
            </CardTitle>
            <CardDescription>Registra asistencias para tus clases</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Puedes registrar asistencias de forma manual o escaneando el código QR de los estudiantes.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" asChild>
                <Link href="/dashboard/profesor/asistencias">Registro Manual</Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard/profesor/asistencias/escanear">Escanear QR</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-primary" />
              Comunicación
            </CardTitle>
            <CardDescription>Mantente en contacto con tus estudiantes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Envía mensajes a tus estudiantes y revisa los mensajes recibidos.</p>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" asChild>
                <Link href="/dashboard/profesor/mensajes">Ver Mensajes</Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard/profesor/mensajes/nuevo">Nuevo Mensaje</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
