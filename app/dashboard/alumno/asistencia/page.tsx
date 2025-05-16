"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QrCode, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

export default function AsistenciaAlumno() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroCurso, setFiltroCurso] = useState("todos")
  const [filtroEstado, setFiltroEstado] = useState("todos")

  // Datos de ejemplo para la asistencia
  const registrosAsistencia = [
    { id: 1, fecha: "12 Mayo, 2023", curso: "Matemáticas", estado: "Presente", hora: "8:05 AM" },
    { id: 2, fecha: "11 Mayo, 2023", curso: "Historia", estado: "Presente", hora: "9:50 AM" },
    { id: 3, fecha: "11 Mayo, 2023", curso: "Ciencias", estado: "Presente", hora: "2:03 PM" },
    { id: 4, fecha: "10 Mayo, 2023", curso: "Literatura", estado: "Ausente", hora: "-" },
    { id: 5, fecha: "10 Mayo, 2023", curso: "Inglés", estado: "Presente", hora: "11:32 AM" },
    { id: 6, fecha: "9 Mayo, 2023", curso: "Educación Física", estado: "Tardanza", hora: "8:15 AM" },
    { id: 7, fecha: "8 Mayo, 2023", curso: "Matemáticas", estado: "Presente", hora: "8:02 AM" },
    { id: 8, fecha: "8 Mayo, 2023", curso: "Historia", estado: "Presente", hora: "9:48 AM" },
    { id: 9, fecha: "7 Mayo, 2023", curso: "Ciencias", estado: "Ausente", hora: "-" },
    { id: 10, fecha: "7 Mayo, 2023", curso: "Literatura", estado: "Presente", hora: "11:30 AM" },
  ]

  // Filtrar registros según los criterios
  const registrosFiltrados = registrosAsistencia.filter(
    (registro) =>
      (registro.fecha.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registro.curso.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filtroCurso === "todos" || registro.curso === filtroCurso) &&
      (filtroEstado === "todos" || registro.estado === filtroEstado),
  )

  // Calcular estadísticas
  const totalRegistros = registrosAsistencia.length
  const presentes = registrosAsistencia.filter((r) => r.estado === "Presente").length
  const ausentes = registrosAsistencia.filter((r) => r.estado === "Ausente").length
  const tardanzas = registrosAsistencia.filter((r) => r.estado === "Tardanza").length

  const porcentajeAsistencia = Math.round((presentes / totalRegistros) * 100)

  // Lista de cursos para el filtro
  const cursos = ["Matemáticas", "Historia", "Ciencias", "Literatura", "Inglés", "Educación Física"]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi Asistencia</h1>
        <p className="text-muted-foreground">Gestiona y visualiza tu registro de asistencia</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Asistencia Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{porcentajeAsistencia}%</div>
            <div className="mt-1 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${porcentajeAsistencia}%` }}></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Últimos 30 días</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Presentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{presentes}</div>
            <p className="text-xs text-muted-foreground">de {totalRegistros} clases</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ausencias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{ausentes}</div>
            <p className="text-xs text-muted-foreground">de {totalRegistros} clases</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tardanzas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{tardanzas}</div>
            <p className="text-xs text-muted-foreground">de {totalRegistros} clases</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="historial" className="space-y-4">
        <TabsList>
          <TabsTrigger value="historial">Historial de Asistencia</TabsTrigger>
          <TabsTrigger value="qr">Mi Código QR</TabsTrigger>
        </TabsList>

        <TabsContent value="historial" className="space-y-4">
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Input
                placeholder="Buscar por fecha o curso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex space-x-4">
              <div className="w-[180px]">
                <Select value={filtroCurso} onValueChange={setFiltroCurso}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por curso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los cursos</SelectItem>
                    {cursos.map((curso) => (
                      <SelectItem key={curso} value={curso}>
                        {curso}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[180px]">
                <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="Presente">Presente</SelectItem>
                    <SelectItem value="Ausente">Ausente</SelectItem>
                    <SelectItem value="Tardanza">Tardanza</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Historial de Asistencia</CardTitle>
              <CardDescription>Registro detallado de tu asistencia a clases</CardDescription>
            </CardHeader>
            <CardContent>
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
                    {registrosFiltrados.map((registro) => (
                      <tr key={registro.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{registro.fecha}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{registro.curso}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              registro.estado === "Presente"
                                ? "bg-green-100 text-green-800"
                                : registro.estado === "Ausente"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {registro.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{registro.hora}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qr" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mi Código QR Personal</CardTitle>
              <CardDescription>Utiliza este código para registrar tu asistencia en clases</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="bg-white p-6 rounded-lg shadow-md border-2 border-blue-200 w-64 text-center mb-6">
                <h3 className="font-bold text-lg mb-2">Juan Pérez</h3>
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
                <p className="text-sm mt-2">ID: ALU-2023-001</p>
                <p className="text-sm text-muted-foreground">Secundaria - 3° A</p>
              </div>

              <div className="space-y-4 w-full max-w-md">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium flex items-center">
                    <QrCode className="h-4 w-4 mr-2 text-blue-700" />
                    Instrucciones de uso
                  </h4>
                  <ul className="mt-2 space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                        1
                      </span>
                      <span>Muestra este código QR al profesor al inicio de cada clase.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                        2
                      </span>
                      <span>El profesor escaneará el código con la aplicación de asistencia.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                        3
                      </span>
                      <span>Tu asistencia quedará registrada automáticamente en el sistema.</span>
                    </li>
                  </ul>
                </div>

                <Button className="w-full">Descargar Código QR</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
