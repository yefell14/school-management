"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, BookOpen, ClipboardList, MessageSquare, Users, CheckSquare } from "lucide-react"
import { getCursosProfesor } from "@/lib/api"
import { useSession } from "@/lib/hooks/use-session"
import type { Grupo } from "@/lib/supabase"

export default function ProfesorDashboard() {
  const { session } = useSession();
  const [cursos, setCursos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarCursos = async () => {
      if (!session?.user?.id) return;
      
      try {
        const data = await getCursosProfesor(session.user.id);
        setCursos(data);
      } catch (error) {
        console.error("Error al cargar cursos:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarCursos();
  }, [session?.user?.id]);

  const tareasRecientes = [
    { id: 1, titulo: "Ejercicios de álgebra", curso: "Matemáticas", fechaEntrega: "2023-05-20", pendientes: 5 },
    {
      id: 2,
      titulo: "Investigación sobre ecosistemas",
      curso: "Ciencias Naturales",
      fechaEntrega: "2023-05-22",
      pendientes: 8,
    },
  ]

  const proximasClases = [
    { id: 1, curso: "Matemáticas", grado: "6to Primaria", seccion: "A", hora: "08:00 - 09:30", dia: "Lunes" },
    { id: 2, curso: "Ciencias Naturales", grado: "5to Primaria", seccion: "B", hora: "10:00 - 11:30", dia: "Lunes" },
    { id: 3, curso: "Historia", grado: "6to Primaria", seccion: "A", hora: "08:00 - 09:30", dia: "Martes" },
  ]

  return (
    <div className="grid gap-4 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-4 md:p-8">
      <div className="col-span-full">
        <h1 className="text-3xl font-bold mb-2">Bienvenido, Profesor</h1>
        <p className="text-muted-foreground">Gestiona tus cursos, tareas y evaluaciones</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center">
            <BookOpen className="mr-2 h-5 w-5 text-primary" />
            Mis Cursos
          </CardTitle>
          <CardDescription>Cursos asignados actualmente</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          {loading ? (
            <div className="flex justify-center items-center h-24">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : cursos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No tienes cursos asignados actualmente.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {cursos.map((grupo) => (
                <li key={grupo.id} className="p-2 rounded-md hover:bg-muted">
                  <Link href={`/dashboard/profesor/cursos/${grupo.id}`} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{grupo.curso?.nombre}</p>
                      <p className="text-sm text-muted-foreground">
                        {grupo.grado?.nombre} - {grupo.seccion?.nombre}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Ver
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" asChild className="w-full">
            <Link href="/dashboard/profesor/cursos">Ver todos los cursos</Link>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center">
            <ClipboardList className="mr-2 h-5 w-5 text-primary" />
            Tareas Pendientes
          </CardTitle>
          <CardDescription>Tareas por revisar y calificar</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <ul className="space-y-2">
            {tareasRecientes.map((tarea) => (
              <li key={tarea.id} className="p-2 rounded-md hover:bg-muted">
                <Link href={`/dashboard/profesor/tareas/${tarea.id}`} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{tarea.titulo}</p>
                    <p className="text-sm text-muted-foreground">
                      {tarea.curso} - {tarea.pendientes} pendientes
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Ver
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" asChild className="w-full">
            <Link href="/dashboard/profesor/tareas">Ver todas las tareas</Link>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center">
            <CalendarDays className="mr-2 h-5 w-5 text-primary" />
            Próximas Clases
          </CardTitle>
          <CardDescription>Horario de clases para hoy</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <ul className="space-y-2">
            {proximasClases.map((clase) => (
              <li key={clase.id} className="p-2 rounded-md hover:bg-muted">
                <div>
                  <p className="font-medium">{clase.curso}</p>
                  <p className="text-sm text-muted-foreground">
                    {clase.grado} {clase.seccion} - {clase.hora}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" asChild className="w-full">
            <Link href="/dashboard/profesor/horario">Ver horario completo</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
