"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Clock, Calendar, CheckSquare, FileText, MessageSquare } from "lucide-react"
import Link from "next/link"

export default function AlumnoDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Estudiante</h1>
        <p className="text-muted-foreground">Bienvenido al sistema escolar María de los Ángeles.</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="courses">Mis Cursos</TabsTrigger>
          <TabsTrigger value="assignments">Tareas</TabsTrigger>
          <TabsTrigger value="attendance">Asistencia</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cursos Activos</CardTitle>
                <BookOpen className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">6</div>
                <p className="text-xs text-muted-foreground">Semestre actual</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-yellow-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tareas Pendientes</CardTitle>
                <FileText className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4</div>
                <p className="text-xs text-muted-foreground">Esta semana</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Asistencia</CardTitle>
                <CheckSquare className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">95%</div>
                <p className="text-xs text-muted-foreground">Este mes</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-orange-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mensajes</CardTitle>
                <MessageSquare className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">No leídos</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Próximas Tareas</CardTitle>
                <CardDescription>Tareas pendientes para esta semana</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { course: "Matemáticas", title: "Ecuaciones Diferenciales", due: "Mañana, 11:59 PM" },
                    { course: "Historia", title: "Ensayo sobre la Revolución Industrial", due: "Miércoles, 11:59 PM" },
                    { course: "Ciencias", title: "Informe de Laboratorio", due: "Viernes, 3:00 PM" },
                    { course: "Literatura", title: "Análisis de Poema", due: "Domingo, 11:59 PM" },
                  ].map((task, i) => (
                    <div key={i} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <FileText className="h-4 w-4 text-blue-700" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.course}</p>
                        <p className="text-xs font-medium text-red-500">Entrega: {task.due}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Horario de Hoy</CardTitle>
                <CardDescription>Clases programadas para hoy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { time: "8:00 AM - 9:30 AM", course: "Matemáticas", room: "Aula 101" },
                    { time: "9:45 AM - 11:15 AM", course: "Historia", room: "Aula 203" },
                    { time: "11:30 AM - 1:00 PM", course: "Educación Física", room: "Gimnasio" },
                    { time: "2:00 PM - 3:30 PM", course: "Ciencias", room: "Laboratorio 2" },
                  ].map((class_, i) => (
                    <div key={i} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Clock className="h-4 w-4 text-blue-700" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{class_.course}</p>
                        <p className="text-xs text-muted-foreground">{class_.time}</p>
                        <p className="text-xs text-muted-foreground">{class_.room}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Próximos Eventos</CardTitle>
              <CardDescription>Eventos escolares programados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { date: "15 Mayo", title: "Feria de Ciencias", description: "Presentación de proyectos científicos" },
                  { date: "22 Mayo", title: "Día Deportivo", description: "Competencias deportivas entre grados" },
                  {
                    date: "5 Junio",
                    title: "Ceremonia de Premiación",
                    description: "Reconocimiento a estudiantes destacados",
                  },
                ].map((event, i) => (
                  <div key={i} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Calendar className="h-4 w-4 text-blue-700" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.description}</p>
                      <p className="text-xs font-medium text-blue-600">{event.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mis Cursos</CardTitle>
              <CardDescription>Cursos en los que estás matriculado este semestre</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { name: "Matemáticas", teacher: "Prof. García", progress: 75 },
                  { name: "Historia", teacher: "Prof. Rodríguez", progress: 60 },
                  { name: "Ciencias", teacher: "Prof. Martínez", progress: 85 },
                  { name: "Literatura", teacher: "Prof. López", progress: 70 },
                  { name: "Inglés", teacher: "Prof. Smith", progress: 90 },
                  { name: "Educación Física", teacher: "Prof. Torres", progress: 95 },
                ].map((course, i) => (
                  <Card key={i} className="overflow-hidden border-2 hover:border-blue-300 transition-colors">
                    <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-700"></div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-1">{course.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{course.teacher}</p>
                      <div className="space-y-1">
                        <div className="text-sm flex justify-between">
                          <span>Progreso</span>
                          <span>{course.progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Button variant="outline" size="sm" className="w-full">
                          <Link href={`/dashboard/alumno/cursos/${i}`} className="w-full">
                            Ver Detalles
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tareas Asignadas</CardTitle>
              <CardDescription>Todas tus tareas pendientes y completadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Pendientes</h3>
                  <div className="space-y-3">
                    {[
                      { course: "Matemáticas", title: "Ecuaciones Diferenciales", due: "Mañana, 11:59 PM" },
                      {
                        course: "Historia",
                        title: "Ensayo sobre la Revolución Industrial",
                        due: "Miércoles, 11:59 PM",
                      },
                      { course: "Ciencias", title: "Informe de Laboratorio", due: "Viernes, 3:00 PM" },
                      { course: "Literatura", title: "Análisis de Poema", due: "Domingo, 11:59 PM" },
                    ].map((task, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-start space-x-3">
                          <div className="bg-yellow-100 p-2 rounded-full">
                            <FileText className="h-4 w-4 text-yellow-700" />
                          </div>
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="text-sm text-muted-foreground">{task.course}</p>
                            <p className="text-sm text-red-500">Entrega: {task.due}</p>
                          </div>
                        </div>
                        <Button size="sm">Entregar</Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Completadas</h3>
                  <div className="space-y-3">
                    {[
                      { course: "Inglés", title: "Ensayo sobre literatura inglesa", grade: "95/100" },
                      { course: "Matemáticas", title: "Ejercicios de álgebra", grade: "85/100" },
                      { course: "Historia", title: "Línea de tiempo histórica", grade: "90/100" },
                    ].map((task, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                        <div className="flex items-start space-x-3">
                          <div className="bg-green-100 p-2 rounded-full">
                            <CheckSquare className="h-4 w-4 text-green-700" />
                          </div>
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="text-sm text-muted-foreground">{task.course}</p>
                            <p className="text-sm text-green-600">Calificación: {task.grade}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Ver Detalles
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mi Asistencia</CardTitle>
              <CardDescription>Registro de asistencia a clases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-center p-4">
                  <div className="bg-white p-6 rounded-lg shadow-md border-2 border-blue-200 w-64 text-center">
                    <h3 className="font-bold text-lg mb-2">Mi Código QR</h3>
                    <div className="bg-gray-200 w-48 h-48 mx-auto flex items-center justify-center">
                      <svg viewBox="0 0 100 100" className="w-40 h-40">
                        <path d="M30,30 L30,45 L45,45 L45,30 Z" fill="#000" />
                        <path d="M50,30 L50,45 L65,45 L65,30 Z" fill="#000" />
                        <path d="M70,30 L70,45 L85,45 L85,30 Z" fill="#000" />
                        <path d="M30,50 L30,65 L45,65 L45,50 Z" fill="#000" />
                        <path d="M50,50 L50,65 L65,65 L65,50 Z" fill="#000" />
                        <path d="M70,50 L70,65 L85,65 L85,50 Z" fill="#000" />
                        <path d="M30,70 L30,85 L45,85 L45,70 Z" fill="#000" />
                        <path d="M50,70 L50,85 L65,85 L65,70 Z" fill="#000" />
                        <path d="M70,70 L70,85 L85,85 L85,70 Z" fill="#000" />
                      </svg>
                    </div>
                    <p className="text-sm mt-2">Muestra este código para registrar tu asistencia</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Historial de Asistencia</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Fecha
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Curso
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Estado
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Hora
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {[
                          { date: "12 Mayo, 2023", course: "Matemáticas", status: "Presente", time: "8:05 AM" },
                          { date: "11 Mayo, 2023", course: "Historia", status: "Presente", time: "9:50 AM" },
                          { date: "11 Mayo, 2023", course: "Ciencias", status: "Presente", time: "2:03 PM" },
                          { date: "10 Mayo, 2023", course: "Literatura", status: "Ausente", time: "-" },
                          { date: "10 Mayo, 2023", course: "Inglés", status: "Presente", time: "11:32 AM" },
                          { date: "9 Mayo, 2023", course: "Educación Física", status: "Tardanza", time: "8:15 AM" },
                        ].map((record, i) => (
                          <tr key={i}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{record.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{record.course}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  record.status === "Presente"
                                    ? "bg-green-100 text-green-800"
                                    : record.status === "Ausente"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {record.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{record.time}</td>
                          </tr>
                        ))}
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
