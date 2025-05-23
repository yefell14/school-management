"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getSupabaseBrowser } from "@/lib/supabase-browser"
import { toast } from "@/components/ui/use-toast"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from "date-fns"
import { es } from "date-fns/locale"

type Evento = {
  id: string
  titulo: string
  descripcion: string
  fecha_inicio: string
  fecha_fin: string
  tipo: string
}

type Asistencia = {
  id: string
  fecha: string
  usuario_id: string
  estado: string
  usuario: {
    nombre: string
    apellidos: string
  } | null
}

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [eventos, setEventos] = useState<Evento[]>([])
  const [asistencias, setAsistencias] = useState<Asistencia[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedView, setSelectedView] = useState<"mes" | "semana" | "dia">("mes")
  const supabase = getSupabaseBrowser()

  useEffect(() => {
    fetchData()
  }, [currentDate])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Obtener el primer y último día del mes
      const firstDay = startOfMonth(currentDate)
      const lastDay = endOfMonth(currentDate)

      // Formatear fechas para la consulta
      const firstDayStr = format(firstDay, "yyyy-MM-dd")
      const lastDayStr = format(lastDay, "yyyy-MM-dd")

      // Obtener eventos
      const { data: eventosData, error: eventosError } = await supabase
        .from("eventos")
        .select("*")
        .gte("fecha_inicio", firstDayStr)
        .lte("fecha_inicio", lastDayStr)
        .order("fecha_inicio", { ascending: true })

      if (eventosError) throw eventosError

      // Obtener asistencias con la relación correcta
      const { data: asistenciasData, error: asistenciasError } = await supabase
        .from("asistencias_general")
        .select(`
          id,
          fecha,
          usuario_id,
          estado,
          usuario:usuarios!asistencias_general_usuario_id_fkey (
            nombre,
            apellidos
          )
        `)
        .gte("fecha", firstDayStr)
        .lte("fecha", lastDayStr)
        .order("fecha", { ascending: true })

      if (asistenciasError) throw asistenciasError

      setEventos(eventosData || [])
      setAsistencias((asistenciasData || []).map(asistencia => ({
        ...asistencia,
        usuario: asistencia.usuario?.[0] || null
      })) as Asistencia[])
    } catch (error: any) {
      console.error("Error al cargar datos del calendario:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del calendario",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  // Generar días del mes actual
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  })

  // Obtener el día de la semana del primer día del mes (0 = domingo, 1 = lunes, etc.)
  const firstDayOfMonth = getDay(startOfMonth(currentDate))

  // Nombres de los días de la semana
  const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  // Función para obtener eventos y asistencias para un día específico
  const getEventsForDay = (day: Date) => {
    const dayStr = format(day, "yyyy-MM-dd")
    return {
      eventos: eventos.filter((evento) => evento.fecha_inicio.startsWith(dayStr)),
      asistencias: asistencias.filter((asistencia) => asistencia.fecha === dayStr),
    }
  }

  return (
    <div className="flex flex-col gap-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Calendario</h2>
        <div className="flex items-center gap-2">
          <Select value={selectedView} onValueChange={(value: "mes" | "semana" | "dia") => setSelectedView(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Vista" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mes">Mes</SelectItem>
              <SelectItem value="semana">Semana</SelectItem>
              <SelectItem value="dia">Día</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <CardTitle className="text-xl">{format(currentDate, "MMMM yyyy", { locale: es })}</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {selectedView === "mes" && (
            <div className="grid grid-cols-7 gap-1">
              {/* Días de la semana */}
              {weekDays.map((day) => (
                <div key={day} className="text-center text-sm font-medium py-2 text-muted-foreground">
                  {day}
                </div>
              ))}

              {/* Espacios vacíos para alinear el primer día */}
              {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                <div key={`empty-${index}`} className="h-20 p-1 border rounded-md bg-muted/10"></div>
              ))}

              {/* Días del mes */}
              {daysInMonth.map((day) => {
                const { eventos: dayEvents, asistencias: dayAsistencias } = getEventsForDay(day)
                const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")

                return (
                  <div
                    key={day.toString()}
                    className={`h-20 p-1 border rounded-md overflow-hidden ${
                      isToday ? "bg-primary/5 border-primary/20" : ""
                    }`}
                  >
                    <div className="font-medium text-sm">{format(day, "d")}</div>
                    <div className="text-xs space-y-0.5 mt-1 overflow-y-auto max-h-12">
                      {dayEvents.length > 0 && (
                        <div className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-[10px] truncate">
                          {dayEvents.length} evento(s)
                        </div>
                      )}
                      {dayAsistencias.length > 0 && (
                        <div className="bg-green-100 text-green-800 px-1 py-0.5 rounded text-[10px] truncate">
                          {dayAsistencias.length} asistencia(s)
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {selectedView === "semana" && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Vista semanal en desarrollo</p>
            </div>
          )}

          {selectedView === "dia" && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Vista diaria en desarrollo</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-xl">Próximos Eventos</CardTitle>
          <CardDescription>Eventos programados para este mes</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Cargando eventos...</div>
          ) : eventos.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No hay eventos programados para este mes</div>
          ) : (
            <div className="space-y-3">
              {eventos.slice(0, 5).map((evento) => (
                <div key={evento.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <h4 className="font-medium text-sm">{evento.titulo}</h4>
                    <p className="text-xs text-muted-foreground">{evento.descripcion}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(evento.fecha_inicio), "dd/MM/yyyy HH:mm")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
