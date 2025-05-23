"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DateRangePicker } from "@/components/dashboard/date-range-picker"
import { toast } from "@/components/ui/use-toast"

export default function ReportesPage() {
  const [dateRange, setDateRange] = useState({ from: new Date(), to: new Date() })

  const handleGenerateReport = () => {
    // Aquí iría la lógica para generar el reporte
    toast({
      title: "Reporte generado",
      description: "El reporte ha sido generado y enviado correctamente",
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Generación de Reportes</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Generar Nuevo Reporte</CardTitle>
            <CardDescription>Configura y genera un nuevo reporte de asistencias</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="report-type">Tipo de Reporte</Label>
              <Select>
                <SelectTrigger id="report-type">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asistencia">Asistencia</SelectItem>
                  <SelectItem value="asistencia-curso">Asistencia por Curso</SelectItem>
                  <SelectItem value="asistencia-profesor">Asistencia de Profesores</SelectItem>
                  <SelectItem value="tardanzas">Tardanzas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date-range">Rango de Fechas</Label>
              <DateRangePicker value={dateRange} onChange={setDateRange} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="curso">Curso (Opcional)</Label>
              <Select>
                <SelectTrigger id="curso">
                  <SelectValue placeholder="Seleccionar curso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="matematicas">Matemáticas</SelectItem>
                  <SelectItem value="ciencias">Ciencias</SelectItem>
                  <SelectItem value="historia">Historia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="format">Formato</Label>
              <Select defaultValue="pdf">
                <SelectTrigger id="format">
                  <SelectValue placeholder="Seleccionar formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="recipients">Destinatarios (Opcional)</Label>
              <Input id="recipients" placeholder="Correos separados por comas" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notas Adicionales</Label>
              <Textarea id="notes" placeholder="Escribe notas adicionales para el reporte" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Cancelar</Button>
            <Button onClick={handleGenerateReport}>Generar Reporte</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reportes Recientes</CardTitle>
            <CardDescription>Listado de reportes generados recientemente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h4 className="font-medium">Reporte de Asistencia - Mayo 2023</h4>
                    <p className="text-sm text-muted-foreground">Generado el 22/05/2023</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Ver
                    </Button>
                    <Button variant="outline" size="sm">
                      Descargar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Ver Todos los Reportes
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
