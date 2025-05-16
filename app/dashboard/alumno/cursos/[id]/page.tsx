"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Users, Clock, FileText } from "lucide-react"
import Link from "next/link"

export default function DetalleCurso({ params }: { params: { id: string } }) {
  const cursoId = Number.parseInt(params.id)

  // Datos de ejemplo para el curso
  const curso = {
    id: cursoId,
    nombre: "Matemáticas",
    profesor: "Prof. García",
    grado: "Secundaria",
    seccion: "A",
    horario: "Lunes y Miércoles, 8:00 AM - 9:30 AM",
    aula: "101",
    progreso: 75,
    descripcion: "Curso de matemáticas avanzadas que cubre álgebra, geometría y cálculo básico.",
    temas: [
      "Ecuaciones lineales y cuadráticas",
      "Funciones y gráficas",
      "Geometría analítica",
      "Trigonometría",
      "Introducción al cálculo",
    ],
    tareas: [
      { id: 1, titulo: "Ecuaciones Diferenciales", fecha: "15 Mayo, 2023", estado: "Pendiente" },
      { id: 2, titulo: "Ejercicios de Álgebra", fecha: "5 Mayo, 2023", estado: "Completada", nota: "85/100" },
      { id: 3, titulo: "Problemas de Geometría", fecha: "28 Abril, 2023", estado: "Completada", nota: "90/100" },
      { id: 4, titulo: "Examen Parcial", fecha: "20 Abril, 2023", estado: "Completada", nota: "88/100" },
    ],
    materiales: [
      { id: 1, titulo: "Libro de Texto: Matemáticas Avanzadas", tipo: "PDF" },
      { id: 2, titulo: "Presentación: Ecuaciones Diferenciales", tipo: "PPT" },
      { id: 3, titulo: "Ejercicios Prácticos", tipo: "PDF" },
      { id: 4, titulo: "Video: Resolución de Problemas", tipo: "Video" },
    ],
    anuncios: [
      {
        id: 1,
        titulo: "Cambio de horario",
        fecha: "10 Mayo, 2023",
        contenido: "La clase del miércoles 17 de mayo se adelantará a las 7:30 AM.",
      },
      {
        id: 2,
        titulo: "Examen Final",
        fecha: "5 Mayo, 2023",
        contenido: "El examen final se realizará el 15 de junio a las 9:00 AM en el aula 101.",
      },
    ],
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{curso.nombre}</h1>
          <p className="text-muted-foreground">
            {curso.grado} - Sección {curso.seccion}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/alumno/cursos">Volver a Cursos</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Información del Curso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{curso.profesor}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{curso.horario}</span>
            </div>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span>Aula: {curso.aula}</span>
            </div>
            <div className="space-y-1">
              <div className="text-sm flex justify-between">
                <span>Progreso</span>
                <span>{curso.progreso}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full"
                  style={{ width: `${curso.progreso}%` }}
                ></div>
              </div>
            </div>
            <div className="pt-2">
              <h4 className="font-medium mb-2">Descripción</h4>
              <p className="text-sm text-muted-foreground">{curso.descripcion}</p>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Tabs defaultValue="temas" className="space-y-4">
            <TabsList>
              <TabsTrigger value="temas">Temas</TabsTrigger>
              <TabsTrigger value="tareas">Tareas</TabsTrigger>
              <TabsTrigger value="materiales">Materiales</TabsTrigger>
              <TabsTrigger value="anuncios">Anuncios</TabsTrigger>
            </TabsList>

            <TabsContent value="temas" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Temas del Curso</CardTitle>
                  <CardDescription>Contenido que se cubrirá durante el semestre</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {curso.temas.map((tema, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        <span>{tema}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tareas" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tareas del Curso</CardTitle>
                  <CardDescription>Tareas asignadas y completadas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {curso.tareas.map((tarea) => (
                      <div key={tarea.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-start space-x-3">
                          <div
                            className={`p-2 rounded-full ${
                              tarea.estado === "Pendiente" ? "bg-yellow-100" : "bg-green-100"
                            }`}
                          >
                            <FileText
                              className={`h-4 w-4 ${
                                tarea.estado === "Pendiente" ? "text-yellow-700" : "text-green-700"
                              }`}
                            />
                          </div>
                          <div>
                            <p className="font-medium">{tarea.titulo}</p>
                            <p className="text-sm text-muted-foreground">Fecha: {tarea.fecha}</p>
                            {tarea.nota && <p className="text-sm text-green-600">Calificación: {tarea.nota}</p>}
                          </div>
                        </div>
                        <Button size="sm" variant={tarea.estado === "Pendiente" ? "default" : "outline"}>
                          {tarea.estado === "Pendiente" ? "Entregar" : "Ver Detalles"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="materiales" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Materiales del Curso</CardTitle>
                  <CardDescription>Recursos de aprendizaje disponibles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {curso.materiales.map((material) => (
                      <div key={material.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-start space-x-3">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <BookOpen className="h-4 w-4 text-blue-700" />
                          </div>
                          <div>
                            <p className="font-medium">{material.titulo}</p>
                            <p className="text-sm text-muted-foreground">Tipo: {material.tipo}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Descargar
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="anuncios" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Anuncios del Curso</CardTitle>
                  <CardDescription>Comunicados importantes del profesor</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {curso.anuncios.map((anuncio) => (
                      <div key={anuncio.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold">{anuncio.titulo}</h3>
                          <span className="text-sm text-muted-foreground">{anuncio.fecha}</span>
                        </div>
                        <p className="text-sm">{anuncio.contenido}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
