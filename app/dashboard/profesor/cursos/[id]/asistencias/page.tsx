"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Calendar, CheckCircle2, Clock, XCircle, QrCode } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function RegistroAsistencias({ params }: { params: { id: string } }) {
  const cursoId = params.id
  
  // Datos de ejemplo
  const curso = {
    id: Number.parseInt(cursoId),
    nombre: "Matemáticas",
    grado: "6to Primaria",
    seccion: "A",
  }
  
  const estudiantes = [
    { id: 1, nombre: "Ana García", asistencia: null },
    { id: 2, nombre: "Carlos Rodríguez", asistencia: null },
    { id: 3, nombre: "Elena Martínez", asistencia: null },
    { id: 4, nombre: "David López", asistencia: null },
    { id: 5, nombre: "Sofía Hernández", asistencia: null },
    { id: 6, nombre: "Miguel Torres", asistencia: null },
    { id: 7, nombre: "Laura Díaz", asistencia: null },
    { id: 8, nombre: "Javier Ruiz", asistencia: null },
  ]
  
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [listaEstudiantes, setListaEstudiantes] = useState(estudiantes)
  const [filtro, setFiltro] = useState('')
  
  const handleAsistenciaChange = (estudianteId: number, valor: string) => {
    setListaEstudiantes(prev => 
      prev.map(est => 
        est.id === estudianteId ? { ...est, asistencia: valor } : est
      )
    )
  }
  
  const marcarTodos = (valor: string) => {
    setListaEstudiantes(prev => 
      prev.map(est => ({ ...est, asistencia: valor }))
    )
  }
  
  const estudiantesFiltrados = listaEstudiantes.filter(est => 
    est.nombre.toLowerCase().includes(filtro.toLowerCase())
  )
  
  const guardarAsistencias = () => {
    // Aquí iría la lógica para guardar las asistencias
    alert('Asistencias guardadas correctamente')
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard/profesor/cursos" className="text-muted-foreground hover:text-primary">
              Mis Cursos
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href={`/dashboard/profesor/cursos/${cursoId}`} className="text-muted-foreground hover:text-primary">
              {curso.nombre}
            </Link>
            <span className="text-muted-foreground">/</span>
            <span>Asistencias</span>
          </div>
          <h1 className="text-3xl font-bold text-primary">Registro de Asistencias</h1>
          <p className="text-muted-foreground">{curso.nombre} - {curso.grado} Sección {curso.seccion}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/dashboard/profesor/cursos/${cursoId}/asistencias/escanear`}>
            <QrCode className="mr-2 h-4 w-4" />
            Escanear QR
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Registro Manual de Asistencias</CardTitle>
          <CardDescription>Seleccione la fecha y marque la asistencia de cada estudiante</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="w-full sm:w-auto">
              <Label htmlFor="fecha">Fecha</Label>
              <div className="flex items-center mt-1">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fecha"
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <Label htmlFor="hora">Hora</Label>
              <div className="flex items-center mt-1">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <Select defaultValue="1">
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Seleccionar hora" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">08:00 - 09:30</SelectItem>
                    <SelectItem value="2">10:00 - 11:30</SelectItem>
                    <SelectItem value="3">13:00 - 14:30</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => marcarTodos('presente')}>
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                Todos Presentes
              </Button>
              <Button variant="outline" onClick={() => marcarTodos('ausente')}>
                <XCircle className="mr-2 h-4 w-4 text-red-600" />
                Todos Ausentes
              </Button>
            </div>
          </div>
          
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar estudiantes..."
              className="w-full pl-8"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
          
          <div className="border rounded-md">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b bg-muted/50">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium">Estudiante</th>
                    <th className="h-12 px-4 text-center align-middle font-medium">Asistencia</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {estudiantesFiltrados.map(estudiante => (
                    <tr key={estudiante.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle font-medium">{estudiante.nombre}</td>
                      <td className="p-4 align-middle">
                        <RadioGroup 
                          className="flex justify-center space-x-6" 
                          value={estudiante.asistencia || ''}
                          onValueChange={(value) => handleAsistenciaChange(estudiante.id, value)}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="presente" id={`presente-${estudiante.id}`} />
                            <Label 
                              htmlFor={`presente-${estudiante.id}`}
                              className="text-green-600 font-medium cursor-pointer"
                            >
                              Presente
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="tardanza" id={`tardanza-${estudiante.id}`} />
                            <Label 
                              htmlFor={`tardanza-${estudiante.id}`}
                              className="text-amber-600 font-medium cursor-pointer"
                            >
                              Tardanza
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="ausente" id={`ausente-${estudiante.id}`} />
                            <Label 
                              htmlFor={`ausente-${estudiante.id}`}
                              className="text-red-600 font-medium cursor-pointer"
                            >
                              Ausente
                            </Label>
                          </div>
                        </RadioGroup>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/profesor/cursos/${cursoId}`}>
                Cancelar
              </Link>\
