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
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Search, Plus, MoreVertical, Edit, Trash, Loader2 } from "lucide-react"
import { getCursos, createCurso, updateCurso, toggleCursoActivo, deleteCurso } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import type { Curso } from "@/lib/supabase"

export default function CursosPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [nivelFilter, setNivelFilter] = useState("todos")
  const [estadoFilter, setEstadoFilter] = useState("todos")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentCurso, setCurrentCurso] = useState<Curso | null>(null)
  const [newCurso, setNewCurso] = useState({
    nombre: "",
    descripcion: "",
    nivel: "primaria",
    activo: true,
  })
  const [cursos, setCursos] = useState<Curso[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Cargar cursos
  useEffect(() => {
    const fetchCursos = async () => {
      try {
        setLoading(true)
        const data = await getCursos({
          nivel: nivelFilter !== "todos" ? nivelFilter : undefined,
          activo: estadoFilter === "todos" ? undefined : estadoFilter === "activos",
          busqueda: searchTerm,
        })
        setCursos(data)
      } catch (error) {
        console.error("Error al cargar cursos:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los cursos",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCursos()
  }, [searchTerm, nivelFilter, estadoFilter, toast])

  // Manejar creación de curso
  const handleCreateCurso = async () => {
    if (!newCurso.nombre) {
      toast({
        title: "Error",
        description: "Por favor ingrese un nombre para el curso",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      const createdCurso = await createCurso(newCurso)

      setCursos([createdCurso, ...cursos])
      setIsCreateDialogOpen(false)

      toast({
        title: "Curso creado",
        description: `Curso ${createdCurso.nombre} creado exitosamente`,
      })

      // Resetear el formulario
      setNewCurso({
        nombre: "",
        descripcion: "",
        nivel: "primaria",
        activo: true,
      })
    } catch (error) {
      console.error("Error al crear curso:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el curso",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Manejar edición de curso
  const handleEditCurso = async () => {
    if (!currentCurso || !currentCurso.nombre) {
      toast({
        title: "Error",
        description: "Por favor ingrese un nombre para el curso",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      const updatedCurso = await updateCurso(currentCurso.id, currentCurso)

      // Actualizar la lista de cursos
      setCursos(cursos.map((curso) => (curso.id === updatedCurso.id ? updatedCurso : curso)))

      setIsEditDialogOpen(false)

      toast({
        title: "Curso actualizado",
        description: `Curso ${updatedCurso.nombre} actualizado exitosamente`,
      })
    } catch (error) {
      console.error("Error al actualizar curso:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el curso",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Manejar eliminación de curso
  const handleDeleteCurso = async () => {
    if (!currentCurso) return

    try {
      setSubmitting(true)
      await deleteCurso(currentCurso.id)

      // Actualizar la lista de cursos
      setCursos(cursos.filter((curso) => curso.id !== currentCurso.id))

      setIsDeleteDialogOpen(false)

      toast({
        title: "Curso eliminado",
        description: `Curso ${currentCurso.nombre} eliminado exitosamente`,
      })
    } catch (error) {
      console.error("Error al eliminar curso:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el curso. Puede que tenga relaciones con otros registros.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Manejar cambio de estado de curso
  const handleToggleCursoStatus = async (cursoId, currentStatus) => {
    try {
      await toggleCursoActivo(cursoId, !currentStatus)

      // Actualizar la lista de cursos
      setCursos(cursos.map((curso) => (curso.id === cursoId ? { ...curso, activo: !currentStatus } : curso)))

      toast({
        title: "Estado actualizado",
        description: `Curso ${currentStatus ? "desactivado" : "activado"} exitosamente`,
      })
    } catch (error) {
      console.error("Error al cambiar estado del curso:", error)
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del curso",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Cursos</h1>
          <p className="text-muted-foreground">Administra los cursos académicos del sistema.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-1 items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar cursos..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={nivelFilter} onValueChange={setNivelFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por nivel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los niveles</SelectItem>
                  <SelectItem value="inicial">Inicial</SelectItem>
                  <SelectItem value="primaria">Primaria</SelectItem>
                  <SelectItem value="secundaria">Secundaria</SelectItem>
                </SelectContent>
              </Select>
              <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="activos">Activos</SelectItem>
                  <SelectItem value="inactivos">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700">
                  <Plus className="mr-2 h-4 w-4" /> Crear Curso
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Curso</DialogTitle>
                  <DialogDescription>Crea un nuevo curso académico en el sistema.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      value={newCurso.nombre}
                      onChange={(e) => setNewCurso({ ...newCurso, nombre: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="nivel">Nivel</Label>
                    <Select
                      value={newCurso.nivel}
                      onValueChange={(value) => setNewCurso({ ...newCurso, nivel: value })}
                    >
                      <SelectTrigger id="nivel">
                        <SelectValue placeholder="Seleccionar nivel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inicial">Inicial</SelectItem>
                        <SelectItem value="primaria">Primaria</SelectItem>
                        <SelectItem value="secundaria">Secundaria</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Textarea
                      id="descripcion"
                      value={newCurso.descripcion}
                      onChange={(e) => setNewCurso({ ...newCurso, descripcion: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="activo"
                      checked={newCurso.activo}
                      onCheckedChange={(checked) => setNewCurso({ ...newCurso, activo: checked })}
                    />
                    <Label htmlFor="activo">Activo</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={submitting}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateCurso} disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...
                      </>
                    ) : (
                      "Crear Curso"
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
                  <TableHead>Nivel</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Cargando cursos...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : cursos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No se encontraron cursos con los criterios de búsqueda.
                    </TableCell>
                  </TableRow>
                ) : (
                  cursos.map((curso) => (
                    <TableRow key={curso.id}>
                      <TableCell className="font-medium">{curso.nombre}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            curso.nivel === "inicial"
                              ? "bg-purple-100 text-purple-800 border-purple-300"
                              : curso.nivel === "primaria"
                                ? "bg-blue-100 text-blue-800 border-blue-300"
                                : "bg-green-100 text-green-800 border-green-300"
                          }
                        >
                          {curso.nivel === "inicial"
                            ? "Inicial"
                            : curso.nivel === "primaria"
                              ? "Primaria"
                              : "Secundaria"}
                        </Badge>
                      </TableCell>
                      <TableCell>{curso.descripcion || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            curso.activo
                              ? "bg-green-100 text-green-800 border-green-300"
                              : "bg-red-100 text-red-800 border-red-300"
                          }
                        >
                          {curso.activo ? "Activo" : "Inactivo"}
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
                            <DropdownMenuItem
                              onClick={() => {
                                setCurrentCurso(curso)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleCursoStatus(curso.id, curso.activo)}
                              className={curso.activo ? "text-red-600" : "text-green-600"}
                            >
                              {curso.activo ? "Desactivar" : "Activar"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setCurrentCurso(curso)
                                setIsDeleteDialogOpen(true)
                              }}
                              className="text-red-600"
                            >
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

      {/* Diálogo de edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Curso</DialogTitle>
            <DialogDescription>Modifica la información del curso seleccionado.</DialogDescription>
          </DialogHeader>
          {currentCurso && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-nombre">Nombre</Label>
                <Input
                  id="edit-nombre"
                  value={currentCurso.nombre}
                  onChange={(e) => setCurrentCurso({ ...currentCurso, nombre: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-nivel">Nivel</Label>
                <Select
                  value={currentCurso.nivel || "primaria"}
                  onValueChange={(value) => setCurrentCurso({ ...currentCurso, nivel: value })}
                >
                  <SelectTrigger id="edit-nivel">
                    <SelectValue placeholder="Seleccionar nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inicial">Inicial</SelectItem>
                    <SelectItem value="primaria">Primaria</SelectItem>
                    <SelectItem value="secundaria">Secundaria</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-descripcion">Descripción</Label>
                <Textarea
                  id="edit-descripcion"
                  value={currentCurso.descripcion || ""}
                  onChange={(e) => setCurrentCurso({ ...currentCurso, descripcion: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-activo"
                  checked={currentCurso.activo}
                  onCheckedChange={(checked) => setCurrentCurso({ ...currentCurso, activo: checked })}
                />
                <Label htmlFor="edit-activo">Activo</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={handleEditCurso} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Curso</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este curso? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {currentCurso && (
            <div className="py-4">
              <p>
                Estás a punto de eliminar el curso <strong>{currentCurso.nombre}</strong>.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteCurso} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
