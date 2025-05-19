"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase, type Asistencia, type Grupo } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, CheckCircle2, XCircle, Clock, QrCode } from "lucide-react"
import { QRScanner } from "@/components/qr-scanner"

export default function AsistenciaPage() {
  const { user } = useAuth()
  const [asistencias, setAsistencias] = useState<Asistencia[]>([])
  const [cursos, setCursos] = useState<(Grupo & { curso: { nombre: string } })[]>([])
  const [selectedCurso, setSelectedCurso] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [qrScannerOpen, setQrScannerOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        // Fetch student's courses
        const { data: gruposData, error: gruposError } = await supabase
          .from("grupo_alumno")
          .select(`
            grupo_id,
            grupo:grupos(
              id,
              curso:cursos(id, nombre)
            )
          `)
          .eq("alumno_id", user.id)

        if (gruposError) throw gruposError

        const gruposFormatted = gruposData.map((item) => ({
          id: item.grupo.id,
          curso_id: item.grupo.curso.id,
          curso: item.grupo.curso,
          grado_id: "",
          seccion_id: "",
          año_escolar: "",
          activo: true,
        }))

        setCursos(gruposFormatted)

        // Fetch attendance records
        const { data: asistenciasData, error: asistenciasError } = await supabase
          .from("asistencias")
          .select(`
            *,
            grupo:grupo_id(
              curso:cursos(nombre)
            )
          `)
          .eq("estudiante_id", user.id)
          .order("fecha", { ascending: false })

        if (asistenciasError) throw asistenciasError
        setAsistencias(asistenciasData)
      } catch (error) {
        console.error("Error fetching attendance data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const filteredAsistencias =
    selectedCurso === "all" ? asistencias : asistencias.filter((asistencia) => asistencia.grupo_id === selectedCurso)

  // Group attendance by month
  const asistenciasPorMes = filteredAsistencias.reduce(
    (acc, asistencia) => {
      const fecha = new Date(asistencia.fecha)
      const mes = fecha.toLocaleString("es-ES", { month: "long", year: "numeric" })

      if (!acc[mes]) {
        acc[mes] = []
      }

      acc[mes].push(asistencia)
      return acc
    },
    {} as Record<string, Asistencia[]>,
  )

  // Calculate statistics
  const totalAsistencias = filteredAsistencias.length
  const presentes = filteredAsistencias.filter((a) => a.estado === "presente").length
  const ausentes = filteredAsistencias.filter((a) => a.estado === "ausente").length
  const tardanzas = filteredAsistencias.filter((a) => a.estado === "tardanza").length
  const justificados = filteredAsistencias.filter((a) => a.estado === "justificado").length

  const porcentajeAsistencia = totalAsistencias > 0 ? Math.round((presentes / totalAsistencias) * 100) : 0

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "presente":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "ausente":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "tardanza":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "justificado":
        return <CheckCircle2 className="h-5 w-5 text-blue-500" />
      default:
        return null
    }
  }

  const getEstadoText = (estado: string) => {
    switch (estado) {
      case "presente":
        return "Presente"
      case "ausente":
        return "Ausente"
      case "tardanza":
        return "Tardanza"
      case "justificado":
        return "Justificado"
      default:
        return estado
    }
  }

  const handleQRSuccess = (data: string) => {
    console.log("QR Code scanned:", data)
    // The QRScanner component will handle the attendance registration
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Mi Asistencia</h1>
        <p className="text-muted-foreground">Consulta tu registro de asistencia a clases</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className="w-full sm:w-64">
          <label htmlFor="curso-filter" className="text-sm font-medium">
            Filtrar por curso
          </label>
          <Select value={selectedCurso} onValueChange={setSelectedCurso}>
            <SelectTrigger id="curso-filter" className="mt-1">
              <SelectValue placeholder="Todos los cursos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los cursos</SelectItem>
              {cursos.map((curso) => (
                <SelectItem key={curso.id} value={curso.id}>
                  {curso.curso.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 w-full">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Marcar asistencia</CardTitle>
              <CardDescription>Escanea el código QR para registrar tu asistencia</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Button className="gap-2" onClick={() => setQrScannerOpen(true)}>
                <QrCode className="h-4 w-4" />
                Escanear QR
              </Button>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Solicita a tu profesor que genere un código QR para marcar tu asistencia a la clase
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={qrScannerOpen} onOpenChange={setQrScannerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Escanear código QR</DialogTitle>
            <DialogDescription>
              Escanea el código QR proporcionado por tu profesor para registrar tu asistencia
            </DialogDescription>
          </DialogHeader>
          {user && <QRScanner userId={user.id} onSuccess={handleQRSuccess} onClose={() => setQrScannerOpen(false)} />}
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Asistencia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{porcentajeAsistencia}%</div>
            <p className="text-xs text-muted-foreground">Porcentaje de asistencia</p>
            <div className="mt-4 h-2 w-full rounded-full bg-muted">
              <div className="h-2 rounded-full bg-primary" style={{ width: `${porcentajeAsistencia}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Presente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{presentes}</div>
            <p className="text-xs text-muted-foreground">Total de asistencias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ausente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ausentes}</div>
            <p className="text-xs text-muted-foreground">Total de ausencias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tardanzas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tardanzas}</div>
            <p className="text-xs text-muted-foreground">Total de tardanzas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de asistencia</CardTitle>
          <CardDescription>Registro detallado de tu asistencia a clases</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(asistenciasPorMes).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(asistenciasPorMes).map(([mes, asistenciasMes]) => (
                <div key={mes}>
                  <h3 className="mb-4 font-semibold capitalize">{mes}</h3>
                  <div className="space-y-2">
                    {asistenciasMes.map((asistencia) => (
                      <div key={asistencia.id} className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center space-x-4">
                          {getEstadoIcon(asistencia.estado)}
                          <div>
                            <p className="font-medium">{asistencia.grupo?.curso?.nombre || "Curso no disponible"}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(asistencia.fecha)}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              asistencia.estado === "presente"
                                ? "bg-green-100 text-green-800"
                                : asistencia.estado === "ausente"
                                  ? "bg-red-100 text-red-800"
                                  : asistencia.estado === "tardanza"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {getEstadoText(asistencia.estado)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Calendar className="h-10 w-10 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No hay registros de asistencia</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                No se encontraron registros de asistencia para el filtro seleccionado
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
