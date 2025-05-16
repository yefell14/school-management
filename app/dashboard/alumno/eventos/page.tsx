"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Search, MapPin, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

export default function EventosAlumno() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroTipo, setFiltroTipo] = useState("todos")

  // Datos de ejemplo para los eventos
  const eventosFuturos = [
    {
      id: 1,
      titulo: "Feria de Ciencias",
      descripcion: "Presentación de proyectos científicos de todos los grados",
      fecha: "15 Mayo, 2023",
      hora: "9:00 AM - 2:00 PM",
      lugar: "Patio Central",
      tipo: "Académico",
    },
    {
      id: 2,
      titulo: "Día Deportivo",
      descripcion: "Competencias deportivas entre grados",
      fecha: "22 Mayo, 2023",
      hora: "8:00 AM - 1:00 PM",
      lugar: "Canchas Deportivas",
      tipo: "Deportivo",
    },
    {
      id: 3,
      titulo: "Ceremonia de Premiación",
      descripcion: "Reconocimiento a estudiantes destacados",
      fecha: "5 Junio, 2023",
      hora: "10:00 AM - 12:00 PM",
      lugar: "Auditorio",
      tipo: "Ceremonial",
    },
    {
      id: 4,
      titulo: "Taller de Robótica",
      descripcion: "Taller práctico de introducción a la robótica",
      fecha: "10 Junio, 2023",
      hora: "3:00 PM - 5:00 PM",
      lugar: "Laboratorio de Tecnología",
      tipo: "Taller",
    },
  ]

  const eventosAnteriores = [
    {
      id: 5,
      titulo: "Día del Libro",
      descripcion: "Celebración del día internacional del libro con actividades de lectura",
      fecha: "23 Abril, 2023",
      hora: "9:00 AM - 12:00 PM",
      lugar: "Biblioteca",
      tipo: "Cultural",
    },
    {
      id: 6,
      titulo: "Torneo de Ajedrez",
      descripcion: "Competencia de ajedrez entre estudiantes de todos los grados",
      fecha: "15 Abril, 2023",
      hora: "2:00 PM - 5:00 PM",
      lugar: "Sala de Usos Múltiples",
      tipo: "Deportivo",
    },
    {
      id: 7,
      titulo: "Charla de Orientación Vocacional",
      descripcion: "Charla informativa sobre opciones universitarias y carreras",
      fecha: "10 Abril, 2023",
      hora: "11:00 AM - 12:30 PM",
      lugar: "Auditorio",
      tipo: "Académico",
    },
  ]

  // Filtrar eventos según los criterios
  const filtrarEventos = (eventos) => {
    return eventos.filter(
      (evento) =>
        (evento.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          evento.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
          evento.lugar.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filtroTipo === "todos" || evento.tipo === filtroTipo),
    )
  }

  const futurosFiltrados = filtrarEventos(eventosFuturos)
  const anterioresFiltrados = filtrarEventos(eventosAnteriores)

  // Lista de tipos de eventos para el filtro
  const tiposEventos = ["Académico", "Deportivo", "Cultural", "Ceremonial", "Taller"]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Eventos Escolares</h1>
        <p className="text-muted-foreground">Calendario de eventos y actividades escolares</p>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <Input
            placeholder="Buscar evento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
        <div className="w-[180px]">
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los tipos</SelectItem>
              {tiposEventos.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {tipo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="proximos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="proximos">Próximos Eventos ({futurosFiltrados.length})</TabsTrigger>
          <TabsTrigger value="pasados">Eventos Pasados ({anterioresFiltrados.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="proximos" className="space-y-4">
          {futurosFiltrados.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="rounded-full bg-blue-100 p-3 mb-4">
                  <Calendar className="h-6 w-6 text-blue-700" />
                </div>
                <h3 className="text-lg font-medium">No hay eventos próximos</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  No hay eventos próximos que coincidan con tus filtros.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {futurosFiltrados.map((evento) => (
                <Card key={evento.id} className="overflow-hidden hover:border-blue-300 transition-colors">
                  <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-700"></div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{evento.titulo}</CardTitle>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {evento.tipo}
                      </span>
                    </div>
                    <CardDescription>{evento.descripcion}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{evento.fecha}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{evento.hora}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{evento.lugar}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm">
                        Ver Detalles
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pasados" className="space-y-4">
          {anterioresFiltrados.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="rounded-full bg-blue-100 p-3 mb-4">
                  <Calendar className="h-6 w-6 text-blue-700" />
                </div>
                <h3 className="text-lg font-medium">No hay eventos pasados</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  No hay eventos pasados que coincidan con tus filtros.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {anterioresFiltrados.map((evento) => (
                <Card key={evento.id} className="overflow-hidden hover:border-blue-300 transition-colors opacity-80">
                  <div className="h-2 bg-gradient-to-r from-gray-400 to-gray-600"></div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{evento.titulo}</CardTitle>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        {evento.tipo}
                      </span>
                    </div>
                    <CardDescription>{evento.descripcion}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{evento.fecha}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{evento.hora}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{evento.lugar}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm">
                        Ver Detalles
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
