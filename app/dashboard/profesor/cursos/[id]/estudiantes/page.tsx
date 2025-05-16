import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ArrowUpDown, Mail, Phone, CheckSquare, ClipboardList, BarChart } from "lucide-react"

export default function EstudiantesCurso({ params }: { params: { id: string } }) {
  const cursoId = params.id

  // Datos de ejemplo
  const curso = {
    id: Number.parseInt(cursoId),
    nombre: "Matemáticas",
    grado: "6to Primaria",
    seccion: "A",
  }

  const estudiantes = [
    {
      id: 1,
      nombre: "Ana García",
      email: "ana.garcia@ejemplo.com",
      telefono: "123-456-7890",
      asistencia: 95,
      promedio: 92,
    },
    {
      id: 2,
      nombre: "Carlos Rodríguez",
      email: "carlos.rodriguez@ejemplo.com",
      telefono: "123-456-7891",
      asistencia: 88,
      promedio: 85,
    },
    {
      id: 3,
      nombre: "Elena Martínez",
      email: "elena.martinez@ejemplo.com",
      telefono: "123-456-7892",
      asistencia: 100,
      promedio: 95,
    },
    {
      id: 4,
      nombre: "David López",
      email: "david.lopez@ejemplo.com",
      telefono: "123-456-7893",
      asistencia: 92,
      promedio: 78,
    },
    {
      id: 5,
      nombre: "Sofía Hernández",
      email: "sofia.hernandez@ejemplo.com",
      telefono: "123-456-7894",
      asistencia: 85,
      promedio: 88,
    },
    {
      id: 6,
      nombre: "Miguel Torres",
      email: "miguel.torres@ejemplo.com",
      telefono: "123-456-7895",
      asistencia: 90,
      promedio: 82,
    },
    {
      id: 7,
      nombre: "Laura Díaz",
      email: "laura.diaz@ejemplo.com",
      telefono: "123-456-7896",
      asistencia: 98,
      promedio: 90,
    },
    {
      id: 8,
      nombre: "Javier Ruiz",
      email: "javier.ruiz@ejemplo.com",
      telefono: "123-456-7897",
      asistencia: 93,
      promedio: 87,
    },
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
            <Link href={`/dashboard/profesor/cursos/${cursoId}`} className="text-muted-foreground hover:text-primary">
              {curso.nombre}
            </Link>
            <span className="text-muted-foreground">/</span>
            <span>Estudiantes</span>
          </div>
          <h1 className="text-3xl font-bold text-primary">Estudiantes</h1>
          <p className="text-muted-foreground">
            {curso.nombre} - {curso.grado} Sección {curso.seccion}
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Buscar estudiantes..." className="w-full pl-8" />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Lista de Estudiantes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    <div className="flex items-center space-x-1">
                      <span>Nombre</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Contacto</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    <div className="flex items-center space-x-1">
                      <span>Asistencia</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    <div className="flex items-center space-x-1">
                      <span>Promedio</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {estudiantes.map((estudiante) => (
                  <tr
                    key={estudiante.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle font-medium">{estudiante.nombre}</td>
                    <td className="p-4 align-middle">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{estudiante.email}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{estudiante.telefono}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center">
                        <span
                          className={`font-medium ${
                            estudiante.asistencia >= 90
                              ? "text-green-600"
                              : estudiante.asistencia >= 80
                                ? "text-amber-600"
                                : "text-red-600"
                          }`}
                        >
                          {estudiante.asistencia}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center">
                        <span
                          className={`font-medium ${
                            estudiante.promedio >= 90
                              ? "text-green-600"
                              : estudiante.promedio >= 70
                                ? "text-amber-600"
                                : "text-red-600"
                          }`}
                        >
                          {estudiante.promedio}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/profesor/estudiantes/${estudiante.id}/asistencias?curso=${cursoId}`}>
                            <CheckSquare className="mr-2 h-4 w-4" />
                            Asistencias
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/profesor/estudiantes/${estudiante.id}/tareas?curso=${cursoId}`}>
                            <ClipboardList className="mr-2 h-4 w-4" />
                            Tareas
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            href={`/dashboard/profesor/estudiantes/${estudiante.id}/calificaciones?curso=${cursoId}`}
                          >
                            <BarChart className="mr-2 h-4 w-4" />
                            Calificaciones
                          </Link>
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

      <div className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href={`/dashboard/profesor/cursos/${cursoId}`}>Volver al Curso</Link>
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/profesor/cursos/${cursoId}/asistencias`}>
              <CheckSquare className="mr-2 h-4 w-4" />
              Registrar Asistencias
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/profesor/mensajes/nuevo?curso=${cursoId}`}>Enviar Mensaje</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
