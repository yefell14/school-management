"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, Star, Trash, Archive, Mail } from "lucide-react"

// Datos de ejemplo
const mensajesData = {
  recibidos: [
    {
      id: "1",
      remitente: {
        id: "1",
        nombre: "Luis García",
        rol: "estudiante",
        curso: "Matemáticas - 1° Grado A",
      },
      asunto: "Consulta sobre tarea de matemáticas",
      contenido:
        "Buenos días profesor, tengo una duda sobre el ejercicio 5 de la tarea de sumas y restas. ¿Podría explicarme cómo resolverlo?",
      fecha: "2023-05-15T10:30:00",
      leido: true,
      destacado: false,
    },
    {
      id: "2",
      remitente: {
        id: "2",
        nombre: "Ana Martínez",
        rol: "estudiante",
        curso: "Matemáticas - 1° Grado A",
      },
      asunto: "Justificación de inasistencia",
      contenido:
        "Estimado profesor, le escribo para justificar mi inasistencia del día de ayer. Adjunto el certificado médico correspondiente.",
      fecha: "2023-05-14T15:45:00",
      leido: false,
      destacado: true,
    },
    {
      id: "3",
      remitente: {
        id: "3",
        nombre: "María López",
        rol: "administrador",
        curso: null,
      },
      asunto: "Reunión de profesores",
      contenido:
        "Se convoca a todos los profesores a una reunión el día viernes 19 de mayo a las 15:00 horas en la sala de profesores.",
      fecha: "2023-05-13T09:15:00",
      leido: true,
      destacado: true,
    },
    {
      id: "4",
      remitente: {
        id: "4",
        nombre: "Pedro Sánchez",
        rol: "estudiante",
        curso: "Matemáticas - 2° Grado B",
      },
      asunto: "Solicitud de entrevista",
      contenido:
        "Estimado profesor, me gustaría solicitar una entrevista para conversar sobre mi rendimiento en el curso. ¿Tiene disponibilidad esta semana?",
      fecha: "2023-05-12T14:20:00",
      leido: true,
      destacado: false,
    },
  ],
  enviados: [
    {
      id: "5",
      destinatario: {
        id: "5",
        nombre: "Estudiantes 1° Grado A",
        rol: "grupo",
        curso: "Matemáticas - 1° Grado A",
      },
      asunto: "Material de estudio para examen",
      contenido:
        "Estimados estudiantes, les comparto el material de estudio para el examen parcial del próximo lunes. Por favor, revisen los ejercicios de las páginas 25 a 30 del libro de texto.",
      fecha: "2023-05-14T16:30:00",
      leido: true,
      destacado: false,
    },
    {
      id: "6",
      destinatario: {
        id: "1",
        nombre: "Luis García",
        rol: "estudiante",
        curso: "Matemáticas - 1° Grado A",
      },
      asunto: "Re: Consulta sobre tarea de matemáticas",
      contenido:
        "Hola Luis, para resolver el ejercicio 5 debes aplicar la propiedad conmutativa de la suma. Te recomiendo revisar los ejemplos de la página 12 del libro de texto.",
      fecha: "2023-05-15T11:15:00",
      leido: false,
      destacado: false,
    },
    {
      id: "7",
      destinatario: {
        id: "6",
        nombre: "Coordinación Académica",
        rol: "administrador",
        curso: null,
      },
      asunto: "Informe de rendimiento académico",
      contenido:
        "Adjunto el informe de rendimiento académico de los estudiantes de 1° Grado A y 2° Grado B correspondiente al primer bimestre.",
      fecha: "2023-05-10T09:45:00",
      leido: true,
      destacado: true,
    },
  ],
  archivados: [
    {
      id: "8",
      remitente: {
        id: "7",
        nombre: "Javier Rodríguez",
        rol: "estudiante",
        curso: "Matemáticas - 2° Grado B",
      },
      asunto: "Recuperación de examen",
      contenido:
        "Profesor, le escribo para consultar si puedo recuperar el examen que no pude rendir la semana pasada debido a problemas de salud.",
      fecha: "2023-04-28T10:20:00",
      leido: true,
      destacado: false,
    },
    {
      id: "9",
      remitente: {
        id: "8",
        nombre: "Dirección",
        rol: "administrador",
        curso: null,
      },
      asunto: "Cronograma de actividades",
      contenido: "Se adjunta el cronograma de actividades para el primer semestre del año escolar 2023.",
      fecha: "2023-04-15T11:30:00",
      leido: true,
      destacado: false,
    },
  ],
  papelera: [
    {
      id: "10",
      remitente: {
        id: "9",
        nombre: "Sistema",
        rol: "sistema",
        curso: null,
      },
      asunto: "Bienvenido al sistema de mensajería",
      contenido:
        "Bienvenido al sistema de mensajería de la escuela María de los Ángeles. Aquí podrás comunicarte con estudiantes, profesores y personal administrativo.",
      fecha: "2023-03-01T08:00:00",
      leido: true,
      destacado: false,
    },
  ],
}

export default function MensajesPage() {
  const searchParams = useSearchParams()
  const cursoParam = searchParams.get("curso")

  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("recibidos")

  // Obtener mensajes según la carpeta activa
  const mensajes = mensajesData[activeTab] || []

  // Filtrar mensajes
  const filteredMensajes = mensajes.filter((mensaje) => {
    const searchIn =
      activeTab === "enviados"
        ? `${mensaje.destinatario.nombre} ${mensaje.asunto}`
        : `${mensaje.remitente.nombre} ${mensaje.asunto}`
    return searchIn.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Filtrar por curso si se proporciona el parámetro
  const filteredByCurso = cursoParam
    ? filteredMensajes.filter((mensaje) => {
        const curso = activeTab === "enviados" ? mensaje.destinatario.curso : mensaje.remitente.curso
        return curso && curso.includes(cursoParam)
      })
    : filteredMensajes

  // Formatear fecha
  const formatFecha = (fechaString) => {
    const fecha = new Date(fechaString)
    const hoy = new Date()
    const ayer = new Date(hoy)
    ayer.setDate(ayer.getDate() - 1)

    if (fecha.toDateString() === hoy.toDateString()) {
      return fecha.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
    } else if (fecha.toDateString() === ayer.toDateString()) {
      return "Ayer"
    } else {
      return fecha.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
    }
  }

  // Obtener iniciales para el avatar
  const getInitials = (nombre) => {
    return nombre
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
  }

  // Obtener color de avatar según rol
  const getAvatarColor = (rol) => {
    switch (rol) {
      case "estudiante":
        return "bg-green-100 text-green-800"
      case "administrador":
        return "bg-purple-100 text-purple-800"
      case "grupo":
        return "bg-yellow-100 text-yellow-800"
      case "sistema":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mensajes</h1>
          <p className="text-muted-foreground">Gestiona tus mensajes y comunicaciones.</p>
        </div>
        <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700">
          <Link href="/dashboard/profesor/mensajes/nuevo">
            <Plus className="mr-2 h-4 w-4" /> Nuevo Mensaje
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Carpetas</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
              <TabsList className="flex flex-col h-auto bg-transparent p-0 w-full">
                <TabsTrigger
                  value="recibidos"
                  className="justify-start px-4 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-none"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  <span>Recibidos</span>
                  <Badge className="ml-auto bg-blue-100 text-blue-800 hover:bg-blue-100">
                    {mensajesData.recibidos.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="enviados"
                  className="justify-start px-4 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-none"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  <span>Enviados</span>
                  <Badge className="ml-auto bg-blue-100 text-blue-800 hover:bg-blue-100">
                    {mensajesData.enviados.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="archivados"
                  className="justify-start px-4 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-none"
                >
                  <Archive className="mr-2 h-4 w-4" />
                  <span>Archivados</span>
                  <Badge className="ml-auto bg-blue-100 text-blue-800 hover:bg-blue-100">
                    {mensajesData.archivados.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="papelera"
                  className="justify-start px-4 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-none"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  <span>Papelera</span>
                  <Badge className="ml-auto bg-blue-100 text-blue-800 hover:bg-blue-100">
                    {mensajesData.papelera.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>
                {activeTab === "recibidos"
                  ? "Mensajes Recibidos"
                  : activeTab === "enviados"
                    ? "Mensajes Enviados"
                    : activeTab === "archivados"
                      ? "Mensajes Archivados"
                      : "Papelera"}
              </CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar mensajes..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredByCurso.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No se encontraron mensajes en esta carpeta.</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>{activeTab === "enviados" ? "Destinatario" : "Remitente"}</TableHead>
                      <TableHead>Asunto</TableHead>
                      <TableHead className="text-right">Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredByCurso.map((mensaje) => {
                      const persona = activeTab === "enviados" ? mensaje.destinatario : mensaje.remitente
                      return (
                        <TableRow
                          key={mensaje.id}
                          className={`cursor-pointer ${
                            activeTab === "recibidos" && !mensaje.leido ? "font-medium bg-blue-50" : ""
                          }`}
                          onClick={() => {
                            window.location.href = `/dashboard/profesor/mensajes/${mensaje.id}`
                          }}
                        >
                          <TableCell className="w-12">
                            <div className="flex items-center gap-2">
                              {mensaje.destacado && <Star className="h-4 w-4 text-yellow-500" />}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={`/placeholder.svg?height=32&width=32`} alt={persona.nombre} />
                                <AvatarFallback className={getAvatarColor(persona.rol)}>
                                  {getInitials(persona.nombre)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p>{persona.nombre}</p>
                                {persona.curso && <p className="text-xs text-muted-foreground">{persona.curso}</p>}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <p>{mensaje.asunto}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-xs">{mensaje.contenido}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{formatFecha(mensaje.fecha)}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
