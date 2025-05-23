"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/dashboard/data-table"
import { DateRangePicker } from "@/components/dashboard/date-range-picker"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { Download } from "lucide-react"

// Columnas para la tabla de asistencias
const columns = [
  {
    accessorKey: "fecha",
    header: "Fecha",
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
  },
  {
    accessorKey: "rol",
    header: "Rol",
  },
  {
    accessorKey: "curso",
    header: "Curso",
  },
  {
    accessorKey: "estado",
    header: "Estado",
  },
  {
    accessorKey: "hora_entrada",
    header: "Hora Entrada",
  },
  {
    accessorKey: "hora_salida",
    header: "Hora Salida",
  },
  {
    accessorKey: "acciones",
    header: "Acciones",
  },
]

export default function AsistenciasPage() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date(),
  })
  const [asistencias, setAsistencias] = useState<any[]>([])
  const [cursos, setCursos] = useState<any[]>([])
  const [selectedCurso, setSelectedCurso] = useState("todos")
  const [selectedEstado, setSelectedEstado] = useState("todos")
  const [activeTab, setActiveTab] = useState("todos")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchCursos = async () => {
      const { data, error } = await supabase.from("cursos").select("*").eq("activo", true)
      if (error) {
        console.error("Error al cargar cursos:", error)
        return
      }
      setCursos(data || [])
    }

    fetchCursos()
  }, [])

  useEffect(() => {
    fetchAsistencias()
  }, [dateRange, selectedCurso, selectedEstado, activeTab])

  const fetchAsistencias = async () => {
    setLoading(true)
    try {
      // Primero obtenemos las asistencias
      let query = supabase
        .from("asistencias_general")
        .select("*")
        .gte("fecha", format(dateRange.from, "yyyy-MM-dd"))
        .lte("fecha", format(dateRange.to, "yyyy-MM-dd"))

      // Filtramos por rol si no es "todos"
      if (activeTab !== "todos") {
        query = query.eq("rol", activeTab === "alumnos" ? "alumno" : "profesor")
      }

      // Filtramos por estado si no es "todos"
      if (selectedEstado !== "todos") {
        query = query.eq("estado", selectedEstado)
      }

      // Ejecutamos la consulta
      const { data: asistenciasData, error: asistenciasError } = await query.order("fecha", { ascending: false })

      if (asistenciasError) {
        throw asistenciasError
      }

      // Ahora obtenemos los datos de los usuarios y grupos por separado
      const usuarioIds = asistenciasData.map((a: any) => a.usuario_id)
      const grupoIds = asistenciasData.filter((a: any) => a.grupo_id).map((a: any) => a.grupo_id)

      // Obtenemos los usuarios
      const { data: usuariosData, error: usuariosError } = await supabase
        .from("usuarios")
        .select("id, nombre, apellidos")
        .in("id", usuarioIds)

      if (usuariosError) {
        throw usuariosError
      }

      // Obtenemos los grupos con sus relaciones
      let gruposData: any[] = []
      if (grupoIds.length > 0) {
        const { data: grupos, error: gruposError } = await supabase
          .from("grupos")
          .select(
            `
            id, 
            curso:cursos(id, nombre),
            grado:grados(id, nombre),
            seccion:secciones(id, nombre)
          `,
          )
          .in("id", grupoIds)

        if (gruposError) {
          throw gruposError
        }

        gruposData = grupos || []
      }

      // Filtramos por curso si no es "todos"
      if (selectedCurso !== "todos") {
        const gruposFiltered = gruposData.filter((g) => g.curso?.id === selectedCurso)
        const grupoIdsFiltered = gruposFiltered.map((g) => g.id)
        asistenciasData.filter((a: any) => !a.grupo_id || grupoIdsFiltered.includes(a.grupo_id))
      }

      // Combinamos los datos
      const formattedData = asistenciasData.map((asistencia: any) => {
        const usuario = usuariosData.find((u: any) => u.id === asistencia.usuario_id)
        const grupo = gruposData.find((g) => g.id === asistencia.grupo_id)

        return {
          id: asistencia.id,
          fecha: format(new Date(asistencia.fecha), "dd/MM/yyyy"),
          nombre: usuario ? `${usuario.apellidos}, ${usuario.nombre}` : "Usuario desconocido",
          rol: asistencia.rol === "alumno" ? "Alumno" : "Profesor",
          curso: grupo?.curso?.nombre || "N/A",
          estado: capitalizeFirstLetter(asistencia.estado),
          hora_entrada: asistencia.hora_entrada || "N/A",
          hora_salida: asistencia.hora_salida || "N/A",
          acciones: "",
        }
      })

      setAsistencias(formattedData)
    } catch (error: any) {
      console.error("Error al cargar asistencias:", error)
      toast({
        title: "Error al cargar asistencias",
        description: error.message || "Ocurrió un error al cargar las asistencias",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  const handleExportReport = () => {
    // Crear CSV
    const headers = columns.map((col) => col.header).join(",")
    const rows = asistencias.map((row) => {
      return columns
        .map((col) => {
          const key = col.accessorKey
          if (key === "acciones") return ""
          return `"${row[key]}"`
        })
        .join(",")
    })
    const csv = [headers, ...rows].join("\n")

    // Crear blob y descargar
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `asistencias_${format(dateRange.from, "dd-MM-yyyy")}_a_${format(dateRange.to, "dd-MM-yyyy")}.csv`,
    )
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Registro de Asistencias</h2>
        <Button onClick={handleExportReport} className="gap-2">
          <Download className="h-4 w-4" />
          Exportar Reporte
        </Button>
      </div>

      <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="alumnos">Alumnos</TabsTrigger>
          <TabsTrigger value="profesores">Profesores</TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader>
            <CardTitle>Filtros de Búsqueda</CardTitle>
            <CardDescription>Filtra las asistencias por fecha, curso o estado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="date-range">Rango de Fechas</Label>
                <DateRangePicker value={dateRange} onChange={setDateRange} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="curso">Curso</Label>
                <Select value={selectedCurso} onValueChange={setSelectedCurso}>
                  <SelectTrigger id="curso">
                    <SelectValue placeholder="Seleccionar curso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {cursos.map((curso) => (
                      <SelectItem key={curso.id} value={curso.id}>
                        {curso.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="estado">Estado</Label>
                <Select value={selectedEstado} onValueChange={setSelectedEstado}>
                  <SelectTrigger id="estado">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="presente">Presente</SelectItem>
                    <SelectItem value="ausente">Ausente</SelectItem>
                    <SelectItem value="tardanza">Tardanza</SelectItem>
                    <SelectItem value="justificado">Justificado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <TabsContent value="todos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Todas las Asistencias</CardTitle>
              <CardDescription>Listado de todas las asistencias registradas</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={asistencias} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alumnos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asistencias de Alumnos</CardTitle>
              <CardDescription>Listado de asistencias de alumnos</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={asistencias} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profesores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asistencias de Profesores</CardTitle>
              <CardDescription>Listado de asistencias de profesores</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={asistencias} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
