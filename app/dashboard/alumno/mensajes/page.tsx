"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Search, User, Calendar, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function MensajesAlumno() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroRemitente, setFiltroRemitente] = useState("todos")

  // Datos de ejemplo para los mensajes
  const mensajesRecibidos = [
    {
      id: 1,
      remitente: "Prof. García",
      asunto: "Recordatorio: Entrega de tarea",
      contenido:
        "Estimado alumno, te recuerdo que la tarea de ecuaciones diferenciales debe ser entregada este viernes. Saludos cordiales.",
      fecha: "12 Mayo, 2023",
      hora: "10:30 AM",
      leido: false,
      curso: "Matemáticas",
    },
    {
      id: 2,
      remitente: "Prof. Rodríguez",
      asunto: "Cambio de horario",
      contenido:
        "Informo que la clase del próximo martes se adelantará a las 8:00 AM debido a una reunión de profesores programada para ese día.",
      fecha: "11 Mayo, 2023",
      hora: "2:15 PM",
      leido: true,
      curso: "Historia",
    },
    {
      id: 3,
      remitente: "Administración",
      asunto: "Información sobre evento escolar",
      contenido:
        "Se les invita a participar en la feria de ciencias que se realizará el próximo 15 de mayo. La participación es voluntaria pero se otorgarán puntos extra.",
      fecha: "10 Mayo, 2023",
      hora: "9:00 AM",
      leido: true,
      curso: "Administración",
    },
    {
      id: 4,
      remitente: "Prof. Martínez",
      asunto: "Retroalimentación de informe",
      contenido:
        "He revisado tu informe de laboratorio y tengo algunas sugerencias para mejorar la sección de metodología. Por favor revisa los comentarios adjuntos.",
      fecha: "9 Mayo, 2023",
      hora: "4:45 PM",
      leido: true,
      curso: "Ciencias",
    },
  ]

  const mensajesEnviados = [
    {
      id: 5,
      destinatario: "Prof. García",
      asunto: "Consulta sobre ejercicio 5",
      contenido:
        "Estimado profesor, tengo una duda sobre el ejercicio 5 de la tarea de ecuaciones diferenciales. ¿Podría darme alguna orientación? Gracias de antemano.",
      fecha: "11 Mayo, 2023",
      hora: "8:20 PM",
      curso: "Matemáticas",
    },
    {
      id: 6,
      destinatario: "Prof. López",
      asunto: "Solicitud de prórroga",
      contenido:
        "Estimado profesor, debido a problemas de salud, solicito una prórroga para la entrega del análisis de poema. Adjunto certificado médico. Agradezco su comprensión.",
      fecha: "8 Mayo, 2023",
      hora: "7:15 AM",
      curso: "Literatura",
    },
  ]

  // Filtrar mensajes según los criterios
  const filtrarMensajes = (mensajes, campo) => {
    return mensajes.filter(
      (mensaje) =>
        (mensaje.asunto.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mensaje[campo].toLowerCase().includes(searchTerm.toLowerCase()) ||
          mensaje.contenido.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filtroRemitente === "todos" || mensaje.curso === filtroRemitente),
    )
  }

  const recibidosFiltrados = filtrarMensajes(mensajesRecibidos, "remitente")
  const enviadosFiltrados = filtrarMensajes(mensajesEnviados, "destinatario")

  // Lista de remitentes/cursos para el filtro
  const cursos = ["Matemáticas", "Historia", "Ciencias", "Literatura", "Administración"]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mensajes</h1>
        <p className="text-muted-foreground">Gestiona tus comunicaciones con profesores y administración</p>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <Input
            placeholder="Buscar mensaje..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
        <div className="w-[200px]">
          <Select value={filtroRemitente} onValueChange={setFiltroRemitente}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por remitente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los remitentes</SelectItem>
              {cursos.map((curso) => (
                <SelectItem key={curso} value={curso}>
                  {curso}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button>Nuevo Mensaje</Button>
      </div>

      <Tabs defaultValue="recibidos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recibidos">Recibidos ({recibidosFiltrados.length})</TabsTrigger>
          <TabsTrigger value="enviados">Enviados ({enviadosFiltrados.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="recibidos" className="space-y-4">
          {recibidosFiltrados.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="rounded-full bg-blue-100 p-3 mb-4">
                  <MessageSquare className="h-6 w-6 text-blue-700" />
                </div>
                <h3 className="text-lg font-medium">No hay mensajes recibidos</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  No tienes mensajes recibidos que coincidan con tus filtros.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {recibidosFiltrados.map((mensaje) => (
                <Card
                  key={mensaje.id}
                  className={`hover:border-blue-300 transition-colors ${
                    !mensaje.leido ? "border-l-4 border-l-blue-500" : ""
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <User className="h-5 w-5 text-blue-700" />
                        </div>
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-bold text-lg">{mensaje.remitente}</h3>
                            {!mensaje.leido && <span className="ml-2 bg-blue-500 rounded-full h-2 w-2"></span>}
                          </div>
                          <p className="font-medium">{mensaje.asunto}</p>
                          <div className="flex items-center mt-1">
                            <Calendar className="h-3 w-3 text-muted-foreground mr-1" />
                            <p className="text-xs text-muted-foreground">
                              {mensaje.fecha} - {mensaje.hora}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{mensaje.contenido}</p>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 flex items-center">
                        <Button variant="outline" size="sm" className="mr-2">
                          Responder
                        </Button>
                        <Button variant="ghost" size="icon">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="enviados" className="space-y-4">
          {enviadosFiltrados.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="rounded-full bg-blue-100 p-3 mb-4">
                  <MessageSquare className="h-6 w-6 text-blue-700" />
                </div>
                <h3 className="text-lg font-medium">No hay mensajes enviados</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  No tienes mensajes enviados quee coincidan con tus filtros.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {enviadosFiltrados.map((mensaje) => (
                <Card key={mensaje.id} className="hover:border-blue-300 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="bg-green-100 p-2 rounded-full">
                          <User className="h-5 w-5 text-green-700" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">Para: {mensaje.destinatario}</h3>
                          <p className="font-medium">{mensaje.asunto}</p>
                          <div className="flex items-center mt-1">
                            <Calendar className="h-3 w-3 text-muted-foreground mr-1" />
                            <p className="text-xs text-muted-foreground">
                              {mensaje.fecha} - {mensaje.hora}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{mensaje.contenido}</p>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0">
                        <Button variant="ghost" size="icon">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
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
