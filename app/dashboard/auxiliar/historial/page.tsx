"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Download, Search, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function HistorialAsistenciaPage() {
  const [date, setDate] = useState(new Date())
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroRol, setFiltroRol] = useState("todos")
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [selectedTab, setSelectedTab] = useState("alumnos")

  // Datos de ejemplo para el historial de asistencia
  const asistenciasAlumnos = [
    {
      id: 1,
      nombre: "Juan Pérez",
      dni: "12345678",
      grado: "3°",
      seccion: "A",
      fecha: "12/05/2023",
      hora: "07:45",
      estado: "presente",
    },
    {
      id: 2,
      nombre: "María López",
      dni: "23456789",
      grado: "3°",
      seccion: "A",
      fecha: "12/05/2023",
      hora: "07:50",
      estado: "presente",
    },
    {
      id: 3,
      nombre: "Carlos Gómez",
      dni: "34567890",
      grado: "3°",
      seccion: "B",
      fecha: "12/05/2023",
      hora: "08:15",
      estado: "tardanza",
    },
    {
      id: 4,
      nombre: "Ana Martínez",
      dni: "45678901",
      grado: "4°",
      seccion: "A",
      fecha: "12/05/2023",
      hora: "-",
      estado: "ausente",
    },
    {
      id: 5,
      nombre: "Luis Rodríguez",
      dni: "56789012",
      grado: "4°",
      seccion: "B",
      fecha: "12/05/2023",
      hora: "07:48",
      estado: "presente",
    },
    {
      id: 6,
      nombre: "Elena Torres",
      dni: "67890123",
      grado: "5°",
      seccion: "A",
      fecha: "12/05/2023",
      hora: "-",
      estado: "justificado",
    },
    {
      id: 7,
      nombre: "Roberto Sánchez",
      dni: "78901234",
      grado: "5°",
      seccion: "B",
      fecha: "12/05/2023",
      hora: "07:55",
      estado: "presente",
    },
    {
      id: 8,
      nombre: "Carmen Flores",
      dni: "89012345",
      grado: "6°",
      seccion: "A",
      fecha: "12/05/2023",
      hora: "08:10",
      estado: "tardanza",
    },
    {
      id: 9,
      nombre: "Miguel Vargas",
      dni: "90123456",
      grado: "6°",
      seccion: "B",
      fecha: "12/05/2023",
      hora: "07:40",
      estado: "presente",
    },
    {
      id: 10,
      nombre: "Sofía Mendoza",
      dni: "01234567",
      grado: "3°",
      seccion: "A",
      fecha: "12/05/2023",
      hora: "-",
      estado: "ausente",
    },
  ]

  const asistenciasProfesores = [
    {
      id: 1,
      nombre: "Pedro Sánchez",
      dni: "12345678",
      especialidad: "Matemáticas",
      fecha: "12/05/2023",
      hora: "07:30",
      estado: "presente",
    },
    {
      id: 2,
      nombre: "Laura Ramírez",
      dni: "23456789",
      especialidad: "Historia",
      fecha: "12/05/2023",
      hora: "07:35",
      estado: "presente",
    },
    {
      id: 3,
      nombre: "Jorge Mendoza",
      dni: "34567890",
      especialidad: "Ciencias",
      fecha: "12/05/2023",
      hora: "07:45",
      estado: "presente",
    },
    {
      id: 4,
      nombre: "Claudia Vargas",
      dni: "45678901",
      especialidad: "Literatura",
      fecha: "12/05/2023",
      hora: "08:05",
      estado: "tardanza",
    },
    {
      id: 5,
      nombre: "Ricardo Torres",
      dni: "56789012",
      especialidad: "Inglés",
      fecha: "12/05/2023",
      hora: "-",
      estado: "ausente",
    },
    {
      id: 6,
      nombre: "Mónica Flores",
      dni: "67890123",
      especialidad: "Arte",
      fecha: "12/05/2023",
      hora: "07:40",
      estado: "presente",
    },
  ]

  // Filtrar asistencias según los criterios
  const filtrarAsistencias = (asistencias) => {
    return asistencias.filter(
      (asistencia) =>
        (asistencia.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || asistencia.dni.includes(searchTerm)) &&
        (filtroEstado === "todos" || asistencia.estado === filtroEstado),
    )
  }

  const asistenciasAlumnosFiltradas = filtrarAsistencias(asistenciasAlumnos)
  const asistenciasProfesoresFiltradas = filtrarAsistencias(asistenciasProfesores)

  // Calcular estadísticas para alumnos
  const totalAlumnos = asistenciasAlumnos.length
  const presentesAlumnos = asistenciasAlumnos.filter((a) => a.estado === "presente").length
  const tardanzasAlumnos = asistenciasAlumnos.filter((a) => a.estado === "tardanza").length
  const ausentesAlumnos = asistenciasAlumnos.filter((a) => a.estado === "ausente").length
  const justificadosAlumnos = asistenciasAlumnos.filter((a) => a.estado === "justificado").length

  // Calcular estadísticas para profesores
  const totalProfesores = asistenciasProfesores.length
  const presentesProfesores = asistenciasProfesores.filter((a) => a.estado === "presente").length
  const tardanzasProfesores = asistenciasProfesores.filter((a) => a.estado === "tardanza").length
  const ausentesProfesores = asistenciasProfesores.filter((a) => a.estado === "ausente").length
  const justificadosProfesores = asistenciasProfesores.filter((a) => a.estado === "justificado").length

  // Función para renderizar el estado con icono
  const renderEstado = (estado) => {
    switch (estado) {
      case "presente":
        return (
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
            <span>Presente</span>
          </div>
        )
      case "tardanza":
        return (
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-yellow-500 mr-1" />
            <span>Tardanza</span>
          </div>
        )
      case "ausente":
        return (
          <div className="flex items-center">
            <XCircle className="h-4 w-4 text-red-500 mr-1" />
            <span>Ausente</span>
          </div>
        )
      case "justificado":
        return (
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-blue-500 mr-1" />
            <span>Justificado</span>
          </div>
        )
      default:
        return estado
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Historial de Asistencia</h1>
        <p className="text-muted-foreground">Consulta el historial de asistencia de alumnos y profesores</p>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <div className="flex-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={es} />
            </PopoverContent>
          </Popover>
        </div>
        <div className="relative flex-1">
          <Input
            placeholder="Buscar por nombre o DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
        <div className="w-full md:w-[180px]">
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="presente">Presente</SelectItem>
              <SelectItem value="tardanza">Tardanza</SelectItem>
              <SelectItem value="ausente">Ausente</SelectItem>
              <SelectItem value="justificado">Justificado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Presentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {selectedTab === "alumnos" ? presentesAlumnos : presentesProfesores}
            </div>
            <p className="text-xs text-muted-foreground">
              de {selectedTab === "alumnos" ? totalAlumnos : totalProfesores} {selectedTab}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tardanzas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {selectedTab === "alumnos" ? tardanzasAlumnos : tardanzasProfesores}
            </div>
            <p className="text-xs text-muted-foreground">
              de {selectedTab === "alumnos" ? totalAlumnos : totalProfesores} {selectedTab}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ausentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {selectedTab === "alumnos" ? ausentesAlumnos : ausentesProfesores}
            </div>
            <p className="text-xs text-muted-foreground">
              de {selectedTab === "alumnos" ? totalAlumnos : totalProfesores} {selectedTab}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Justificados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {selectedTab === "alumnos" ? justificadosAlumnos : justificadosProfesores}
            </div>
            <p className="text-xs text-muted-foreground">
              de {selectedTab === "alumnos" ? totalAlumnos : totalProfesores} {selectedTab}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="alumnos">Alumnos</TabsTrigger>
          <TabsTrigger value="profesores">Profesores</TabsTrigger>
        </TabsList>

        <TabsContent value="alumnos" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Asistencia de Alumnos</CardTitle>
                <CardDescription>{format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" /> Exportar
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Alumno
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Grado/Sección
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Hora
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {asistenciasAlumnosFiltradas.map((asistencia) => (
                        <tr key={asistencia.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{asistencia.nombre}</div>
                                <div className="text-sm text-gray-500">DNI: {asistencia.dni}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="outline">
                              {asistencia.grado} {asistencia.seccion}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asistencia.hora}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                asistencia.estado === "presente"
                                  ? "bg-green-100 text-green-800"
                                  : asistencia.estado === "tardanza"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : asistencia.estado === "ausente"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {renderEstado(asistencia.estado)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profesores" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Asistencia de Profesores</CardTitle>
                <CardDescription>{format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" /> Exportar
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Profesor
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Especialidad
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Hora
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {asistenciasProfesoresFiltradas.map((asistencia) => (
                        <tr key={asistencia.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{asistencia.nombre}</div>
                                <div className="text-sm text-gray-500">DNI: {asistencia.dni}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="outline">{asistencia.especialidad}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asistencia.hora}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                asistencia.estado === "presente"
                                  ? "bg-green-100 text-green-800"
                                  : asistencia.estado === "tardanza"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : asistencia.estado === "ausente"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {renderEstado(asistencia.estado)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
