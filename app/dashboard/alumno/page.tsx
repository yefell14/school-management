"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Calendar, MessageSquare, CheckSquare, FileText } from "lucide-react"

export default function AlumnoDashboard() {
  const stats = [
    {
      title: "Cursos Activos",
      value: "4",
      description: "Cursos en los que estás inscrito",
      icon: BookOpen,
    },
    {
      title: "Próximas Clases",
      value: "3",
      description: "Clases programadas para hoy",
      icon: Calendar,
    },
    {
      title: "Mensajes Nuevos",
      value: "2",
      description: "Mensajes sin leer",
      icon: MessageSquare,
    },
    {
      title: "Tareas Pendientes",
      value: "5",
      description: "Tareas por entregar",
      icon: FileText,
    },
    {
      title: "Asistencia",
      value: "95%",
      description: "Porcentaje de asistencia",
      icon: CheckSquare,
    },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Bienvenido a tu Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
