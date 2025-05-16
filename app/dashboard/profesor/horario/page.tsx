"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Calendar } from "lucide-react"

interface ScheduleItem {
  id: number
  grupo_id: string
  dia: string
  hora_inicio: string
  hora_fin: string
  aula: string
  curso_nombre: string
  grado_nombre: string
  seccion_nombre: string
}

const daysOrder = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]

export default function TeacherSchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) return

        // Get all groups assigned to the teacher
        const { data: teacherGroups, error: groupsError } = await supabase
          .from("grupo_profesor")
          .select("grupo_id")
          .eq("profesor_id", session.user.id)

        if (groupsError) throw groupsError

        if (!teacherGroups.length) {
          setSchedule([])
          return
        }

        const groupIds = teacherGroups.map((g) => g.grupo_id)

        // Get schedule for all groups with course, grade and section details
        const { data: scheduleData, error: scheduleError } = await supabase
          .from("horarios")
          .select(`
            id,
            grupo_id,
            dia,
            hora_inicio,
            hora_fin,
            aula,
            grupos:grupo_id (
              cursos:curso_id (nombre),
              grados:grado_id (nombre),
              secciones:seccion_id (nombre)
            )
          `)
          .in("grupo_id", groupIds)
          .order("dia", { ascending: true })
          .order("hora_inicio", { ascending: true })

        if (scheduleError) throw scheduleError

        // Format the schedule data
        const formattedSchedule = scheduleData.map((item) => ({
          id: item.id,
          grupo_id: item.grupo_id,
          dia: item.dia,
          hora_inicio: item.hora_inicio,
          hora_fin: item.hora_fin,
          aula: item.aula || "No asignada",
          curso_nombre: item.grupos.cursos.nombre,
          grado_nombre: item.grupos.grados.nombre,
          seccion_nombre: item.grupos.secciones.nombre,
        }))

        setSchedule(formattedSchedule)
      } catch (error) {
        console.error("Error fetching schedule:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSchedule()
  }, [supabase])

  // Group schedule by day
  const scheduleByDay = daysOrder.reduce(
    (acc, day) => {
      acc[day] = schedule.filter((item) => item.dia.toLowerCase() === day)
      return acc
    },
    {} as Record<string, ScheduleItem[]>,
  )

  // Format day name
  const formatDay = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center">
          <Calendar className="h-6 w-6 mr-2 text-blue-600" />
          <h1 className="text-3xl font-bold text-blue-600">Mi Horario</h1>
        </div>

        {schedule.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Calendar className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-xl text-gray-500">No tiene horarios asignados</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {daysOrder.map((day) => {
              const daySchedule = scheduleByDay[day] || []

              if (daySchedule.length === 0) return null

              return (
                <Card key={day} className="overflow-hidden">
                  <CardHeader className="bg-blue-50">
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                      {formatDay(day)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {daySchedule.map((item) => (
                        <div key={item.id} className="p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium">{item.curso_nombre}</div>
                            <div className="text-sm text-gray-500">{`${item.grado_nombre} ${item.seccion_nombre}`}</div>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 mb-1">
                            <Clock className="h-4 w-4 mr-1 text-gray-400" />
                            {`${item.hora_inicio} - ${item.hora_fin}`}
                          </div>
                          <div className="text-sm text-gray-600">Aula: {item.aula}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
