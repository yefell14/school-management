"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, Clock } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function CursosAlumno() {
  const [searchTerm, setSearchTerm] = useState("")

  const cursos = [
    {
      id: 1,
      nombre: "Matemáticas",
      profesor: "Prof. García",
      grado: "Secundaria",
      seccion: "A",
      horario: "Lunes y Miércoles, 8:00 AM - 9:30 AM",
      aula: "101",
      progreso: 75,
    },
    {
      id: 2,
      nombre: "Historia",
      profesor: "Prof. Rodríguez",
      grado: "Secundaria",
      seccion: "A",
      horario: "Martes y Jueves, 9:45 AM - 11:15 AM",
      aula: "203",
      progreso: 60,
    },
    {
      id: 3,
      nombre: "Ciencias",
      profesor: "Prof. Martínez",
      grado: "Secundaria",
      seccion: "A",
      horario: "Viernes, 2:00 PM - 3:30 PM",
      aula: "Lab 2",
      progreso: 85,
    },
    {
      id: 4,
      nombre: "Literatura",
      profesor: "Prof. López",
      grado: "Secundaria",
      seccion: "A",
      horario: "Lunes y Miércoles, 11:30 AM - 1:00 PM",
      aula: "205",
      progreso: 70,
    },
    {
      id: 5,
      nombre: "Inglés",
      profesor: "Prof. Smith",
      grado: "Secundaria",
      seccion: "A",
      horario: "Martes y Jueves, 11:30 AM - 1:00 PM",
      aula: "301",
      progreso: 90,
    },
    {
      id: 6,
      nombre: "Educación Física",
      profesor: "Prof. Torres",
      grado: "Secundaria",
      seccion: "A",
      horario: "Viernes, 8:00 AM - 9:30 AM",
      aula: "Gimnasio",
      progreso: 95,
    },
  ]

  const filteredCursos = cursos.filter(
    (curso) =>
      curso.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curso.profesor.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Cursos</h1>
          <p className="text-muted-foreground">Visualiza todos tus cursos asignados</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Input
            placeholder="Buscar por nombre o profesor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <BookOpen className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCursos.map((curso) => (
          <Card key={curso.id} className="overflow-hidden border-2 hover:border-blue-300 transition-colors">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-700"></div>
            <CardHeader className="pb-2">
              <CardTitle>{curso.nombre}</CardTitle>
              <CardDescription>
                {curso.grado} - Sección {curso.seccion}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{curso.profesor}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{curso.horario}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">Aula:</span> {curso.aula}
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
              <Button variant="outline" size="sm" className="w-full">
                <Link href={`/dashboard/alumno/cursos/${curso.id}`} className="w-full">
                  Ver Detalles
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
