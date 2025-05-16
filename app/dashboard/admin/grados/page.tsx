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
import { Search, Plus, MoreVertical, Edit, Trash, Loader2 } from "lucide-react"
import { getGrados, createGrado, updateGrado, deleteGrado } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import type { Grado } from "@/lib/supabase"

export default function GradosPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [nivelFilter, setNivelFilter] = useState("todos")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentGrado, setCurrentGrado] = useState<Grado | null>(null)
  const [newGrado, setNewGrado] = useState({
    nombre: "",
    nivel: "primaria",
    descripcion: "",
  })
  const [grados, setGrados] = useState<Grado[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Cargar grados
  useEffect(() => {
    const fetchGrados = async () => {
      try {
        setLoading(true)
        const data = await getGrados({
          nivel: nivelFilter !== "todos" ? nivelFilter : undefined,
          busqueda: searchTerm,
        })
        setGrados(data)
      } catch (error) {
        console.error("Error al cargar grados:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los grados",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchGrados()
  }, [searchTerm, nivelFilter, toast])

  // Manejar creación de grado
  const handleCreateGrado = async () => {
    if (!newGrado.nombre || !newGrado.nivel) {
      toast({
        title: "Error",
        description: "Por favor complete los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      const createdGrado = await createGrado(newGrado)

      setGrados([createdGrado, ...grados])
      setIsCreateDialogOpen(false)

      toast({
        title: "Grado creado",
        description: `Grado ${createdGrado.nombre} creado exitosamente`,
      })

      // Resetear el formulario
      setNewGrado({
        nombre: "",
        nivel: "primaria",
        descripcion: "",
      })
    } catch (error) {
      console.error("Error al crear grado:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el grado",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Manejar edición de grado
  const handleEditGrado = async () => {
    if (!currentGrado || !currentGrado.nombre || !currentGrado.nivel) {
      toast({
        title: "Error",
        description: "Por favor complete los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      const updatedGrado = await updateGrado(currentGrado.id, currentGrado)

      // Actualizar la lista de grados
      setGrados(grados.map((grado) => (grado.id === updatedGrado.id ? updatedGrado : grado)))

      setIsEditDialogOpen(false)

      toast({
        title: "Grado actualizado",
        description: `Grado ${updatedGrado.nombre} actualizado exitosamente`,
      })
    } catch (error) {
      console.error("Error al actualizar grado:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el grado",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Manejar eliminación de grado
  const handleDeleteGrado = async () => {
    if (!currentGrado) return

    try {
      setSubmitting(true)
      await deleteGrado(currentGrado.id)

      // Actualizar la lista de grados
      setGrados(grados.filter((grado) => grado.id !== currentGrado.id))

      setIsDeleteDialogOpen(false)

      toast({
        title: "Grado eliminado",
        description: `Grado ${currentGrado.nombre} eliminado exitosamente`,
      })
    } catch (error) {
      console.error("Error al eliminar grado:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el grado. Puede que tenga relaciones con otros registros.",
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
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Grados</h1>
          <p className="text-muted-foreground">Administra los grados académicos del sistema.</p>
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
                  placeholder="Buscar grados..."
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
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700">
                  <Plus className="mr-2 h-4 w-4" /> Crear Grado
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Grado</DialogTitle>
                  <DialogDescription>Crea un nuevo grado académico en el sistema.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      value={newGrado.nombre}
                      onChange={(e) => setNewGrado({ ...newGrado, nombre: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="nivel">Nivel</Label>
                    <Select
                      value={newGrado.nivel}
                      onValueChange={(value) => setNewGrado({ ...newGrado, nivel: value })}
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
                      value={newGrado.descripcion}
                      onChange={(e) => setNewGrado({ ...newGrado, descripcion: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={submitting}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateGrado} disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...
                      </>
                    ) : (
                      "Crear Grado"
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
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Cargando grados...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : grados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No se encontraron grados con los criterios de búsqueda.
                    </TableCell>
                  </TableRow>
                ) : (
                  grados.map((grado) => (
                    <TableRow key={grado.id}>
                      <TableCell className="font-medium">{grado.nombre}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            grado.nivel === "inicial"
                              ? "bg-purple-100 text-purple-800 border-purple-300"
                              : grado.nivel === "primaria"
                                ? "bg-blue-100 text-blue-800 border-blue-300"
                                : "bg-green-100 text-green-800 border-green-300"
                          }
                        >
                          {grado.nivel === "inicial"
                            ? "Inicial"
                            : grado.nivel === "primaria"
                              ? "Primaria"
                              : "Secundaria"}
                        </Badge>
                      </TableCell>
                      <TableCell>{grado.descripcion || "-"}</TableCell>
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
                                setCurrentGrado(grado)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setCurrentGrado(grado)
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
            <DialogTitle>Editar Grado</DialogTitle>
            <DialogDescription>Modifica la información del grado seleccionado.</DialogDescription>
          </DialogHeader>
          {currentGrado && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-nombre">Nombre</Label>
                <Input
                  id="edit-nombre"
                  value={currentGrado.nombre}
                  onChange={(e) => setCurrentGrado({ ...currentGrado, nombre: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-nivel">Nivel</Label>
                <Select
                  value={currentGrado.nivel}
                  onValueChange={(value) => setCurrentGrado({ ...currentGrado, nivel: value })}
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
                  value={currentGrado.descripcion || ""}
                  onChange={(e) => setCurrentGrado({ ...currentGrado, descripcion: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={handleEditGrado} disabled={submitting}>
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
            <DialogTitle>Eliminar Grado</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este grado? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {currentGrado && (
            <div className="py-4">
              <p>
                Estás a punto de eliminar el grado <strong>{currentGrado.nombre}</strong>.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteGrado} disabled={submitting}>
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
