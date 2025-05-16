"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, MoreVertical, Edit, Trash, Loader2 } from "lucide-react"
import { getUsuarios, getGrados, getSecciones, createUsuario } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import type { Usuario, Grado, Seccion } from "@/lib/supabase"

export default function InscripcionesPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("alumnos")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newAlumno, setNewAlumno] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    contraseña: "",
    rol: "alumno",
    dni: "",
    telefono: "",
    direccion: "",
    grado: "",
    seccion: "",
    activo: true,
  })
  const [alumnos, setAlumnos] = useState<Usuario[]>([])
  const [grados, setGrados] = useState<Grado[]>([])
  const [secciones, setSecciones] = useState<Seccion[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Cargar alumnos
  useEffect(() => {
    const fetchAlumnos = async () => {
      try {
        setLoading(true)
        const data = await getUsuarios({ rol: "alumno", busqueda: searchTerm })
        setAlumnos(data)
      } catch (error) {
        console.error("Error al cargar alumnos:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los alumnos",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAlumnos()
  }, [searchTerm, toast])

  // Cargar grados y secciones
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [gradosData, seccionesData] = await Promise.all([getGrados(), getSecciones()])
        setGrados(gradosData)
        setSecciones(seccionesData)
      } catch (error) {
        console.error("Error al cargar opciones:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar algunas opciones",
          variant: "destructive",
        })
      }
    }

    fetchOptions()
  }, [toast])

  // Manejar creación de alumno
  const handleCreateAlumno = async () => {
    if (!newAlumno.nombre || !newAlumno.apellidos || !newAlumno.email || !newAlumno.contraseña) {
      toast({
        title: "Error",
        description: "Por favor complete los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      // Preparar el objeto de usuario con fecha de registro
      const alumnoToCreate = {
        ...newAlumno,
        fecha_registro: new Date().toISOString(),
      }

      const createdAlumno = await createUsuario(alumnoToCreate)

      // Recargar la lista de alumnos
      const updatedAlumnos = await getUsuarios({ rol: "alumno", busqueda: "" })
      setAlumnos(updatedAlumnos)

      setIsCreateDialogOpen(false)

      toast({
        title: "Alumno inscrito",
        description: `Alumno ${createdAlumno.nombre} ${createdAlumno.apellidos} inscrito exitosamente`,
      })

      // Resetear el formulario
      setNewAlumno({
        nombre: "",
        apellidos: "",
        email: "",
        contraseña: "",
        rol: "alumno",
        dni: "",
        telefono: "",
        direccion: "",
        grado: "",
        seccion: "",
        activo: true,
      })
    } catch (error) {
      console.error("Error al inscribir alumno:", error)
      toast({
        title: "Error",
        description: "No se pudo inscribir al alumno",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inscripciones</h1>
          <p className="text-muted-foreground">Gestiona las inscripciones de alumnos y profesores.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="alumnos">Alumnos</TabsTrigger>
          <TabsTrigger value="profesores">Profesores</TabsTrigger>
        </TabsList>

        <TabsContent value="alumnos" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-1 items-center space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar alumnos..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-600 to-blue-700">
                      <Plus className="mr-2 h-4 w-4" /> Inscribir Alumno
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Inscribir Alumno</DialogTitle>
                      <DialogDescription>
                        Completa el formulario para inscribir un nuevo alumno en el sistema.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="nombre">Nombre</Label>
                          <Input
                            id="nombre"
                            value={newAlumno.nombre}
                            onChange={(e) => setNewAlumno({ ...newAlumno, nombre: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="apellidos">Apellidos</Label>
                          <Input
                            id="apellidos"
                            value={newAlumno.apellidos}
                            onChange={(e) => setNewAlumno({ ...newAlumno, apellidos: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newAlumno.email}
                          onChange={(e) => setNewAlumno({ ...newAlumno, email: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="contraseña">Contraseña</Label>
                        <Input
                          id="contraseña"
                          type="password"
                          value={newAlumno.contraseña}
                          onChange={(e) => setNewAlumno({ ...newAlumno, contraseña: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="dni">DNI</Label>
                        <Input
                          id="dni"
                          value={newAlumno.dni}
                          onChange={(e) => setNewAlumno({ ...newAlumno, dni: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="grado">Grado</Label>
                          <Select
                            value={newAlumno.grado}
                            onValueChange={(value) => setNewAlumno({ ...newAlumno, grado: value })}
                          >
                            <SelectTrigger id="grado">
                              <SelectValue placeholder="Seleccionar grado" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sin_grado">Sin grado</SelectItem>
                              {grados.map((grado) => (
                                <SelectItem key={grado.id} value={grado.id}>
                                  {grado.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="seccion">Sección</Label>
                          <Select
                            value={newAlumno.seccion}
                            onValueChange={(value) => setNewAlumno({ ...newAlumno, seccion: value })}
                          >
                            <SelectTrigger id="seccion">
                              <SelectValue placeholder="Seleccionar sección" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sin_seccion">Sin sección</SelectItem>
                              {secciones.map((seccion) => (
                                <SelectItem key={seccion.id} value={seccion.id}>
                                  {seccion.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="telefono">Teléfono</Label>
                        <Input
                          id="telefono"
                          value={newAlumno.telefono}
                          onChange={(e) => setNewAlumno({ ...newAlumno, telefono: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="direccion">Dirección</Label>
                        <Input
                          id="direccion"
                          value={newAlumno.direccion}
                          onChange={(e) => setNewAlumno({ ...newAlumno, direccion: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={submitting}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateAlumno} disabled={submitting}>
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Inscribiendo...
                          </>
                        ) : (
                          "Inscribir Alumno"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>DNI</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Grado</TableHead>
                      <TableHead>Sección</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex justify-center items-center">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            <span>Cargando alumnos...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : alumnos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No se encontraron alumnos con los criterios de búsqueda.
                        </TableCell>
                      </TableRow>
                    ) : (
                      alumnos.map((alumno) => (
                        <TableRow key={alumno.id}>
                          <TableCell className="font-medium">
                            {alumno.nombre} {alumno.apellidos}
                          </TableCell>
                          <TableCell>{alumno.dni || "-"}</TableCell>
                          <TableCell>{alumno.email}</TableCell>
                          <TableCell>{alumno.grado || "-"}</TableCell>
                          <TableCell>{alumno.seccion || "-"}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                alumno.activo
                                  ? "bg-green-100 text-green-800 border-green-300"
                                  : "bg-red-100 text-red-800 border-red-300"
                              }
                            >
                              {alumno.activo ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Abrir menú</span>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" /> Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Trash className="mr-2 h-4 w-4" /> Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profesores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inscripción de Profesores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                La inscripción de profesores estará disponible próximamente.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
