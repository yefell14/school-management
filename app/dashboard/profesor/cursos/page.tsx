import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Search, Users, ClipboardList, CheckSquare } from "lucide-react"

export default function CursosProfesor() {
  // Datos de ejemplo
  const cursos = [
    {
      id: 1,
      nombre: "Matemáticas",
      grado: "6to Primaria",
      seccion: "A",
      estudiantes: 28,
      dias: ["Lunes", "Miércoles", "Viernes"],
      horario: "08:00 - 09:30",
    },
    {
      id: 2,
      nombre: "Ciencias Naturales",
      grado: "5to Primaria",
      seccion: "B",
      estudiantes: 25,
      dias: ["Martes", "Jueves"],
      horario: "10:00 - 11:30",
    },
    {
      id: 3,
      nombre: "Historia",
      grado: "6to Primaria",
      seccion: "A",
      estudiantes: 28,
      dias: ["Martes", "Jueves"],
      horario: "08:00 - 09:30",
    },
    {
      id: 4,
      nombre: "Lenguaje",
      grado: "5to Primaria",
      seccion: "A",
      estudiantes: 26,
      dias: ["Lunes", "Miércoles"],
      horario: "13:00 - 14:30",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-primary">Mis Cursos</h1>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Buscar cursos..." className="w-full pl-8" />
        </div>
      </div>

      <Tabs defaultValue="activos" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="activos">Cursos Activos</TabsTrigger>
          <TabsTrigger value="anteriores">Cursos Anteriores</TabsTrigger>
        </TabsList>

        <TabsContent value="activos" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cursos.map((curso) => (
              <Card key={curso.id} className="overflow-hidden">
                <CardHeader className="bg-primary/5 pb-2">
                  <CardTitle className="flex items-start justify-between">
                    <div className="flex items-center">
                      <BookOpen className="mr-2 h-5 w-5 text-primary" />
                      <span>{curso.nombre}</span>
                    </div>
                    <span className="text-sm font-normal bg-primary/10 px-2 py-1 rounded-md">
                      {curso.grado} - {curso.seccion}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{curso.estudiantes} estudiantes</span>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground">Horario:</p>
                      <p>
                        {curso.dias.join(", ")} | {curso.horario}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/profesor/cursos/${curso.id}/estudiantes`}>
                          <Users className="mr-2 h-4 w-4" />
                          Estudiantes
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/profesor/cursos/${curso.id}/asistencias`}>
                          <CheckSquare className="mr-2 h-4 w-4" />
                          Asistencias
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/profesor/cursos/${curso.id}/tareas`}>
                          <ClipboardList className="mr-2 h-4 w-4" />
                          Tareas
                        </Link>
                      </Button>
                      <Button variant="default" size="sm" asChild>
                        <Link href={`/dashboard/profesor/cursos/${curso.id}`}>Ver Detalles</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="anteriores">
          <div className="rounded-lg border border-dashed p-8 text-center">
            <h3 className="text-lg font-medium mb-2">No hay cursos anteriores</h3>
            <p className="text-muted-foreground">Los cursos de periodos académicos anteriores aparecerán aquí.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
