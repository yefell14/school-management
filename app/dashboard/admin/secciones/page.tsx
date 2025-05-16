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
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Search, Plus, MoreVertical, Edit, Trash, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"

export default function SeccionesPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentSeccion, setCurrentSeccion] = useState(null)
  const [newSeccion, setNewSeccion] = useState({
    nombre: "",
    descripcion: "",
  })
  const [secciones, setSecciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Cargar secciones
  useEffect(() => {
    const fetchSecciones = async () => {
      try {
        setLoading(true)
        let query = supabase.from("secciones").select("*")

        if (searchTerm) {
          query = query.ilike("nombre", `%${searchTerm}%`)
        }

        const { data, error } = await query

        if (error) throw error

        setSecciones(data || [])
      } catch (error) {
        console.error("Error al cargar secciones:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las secciones",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSecciones()
  }, [searchTerm, toast])

  // Manejar creación de sección
  const handleCreateSeccion = async () => {
    if (!newSeccion.nombre) {
      toast({
        title: "Error",
        description: "Por favor complete el nombre de la sección",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      const { data, error } = await supabase.from("secciones").insert([newSeccion]).select()

      if (error) throw error

      setSecciones([...secciones, data[0]])
      setIsCreateDialogOpen(false)

      toast({
        title: "Sección creada",
        description: `Sección ${data[0].nombre} creada exitosamente`,
      })

      // Resetear el formulario
      setNewSeccion({
        nombre: "",
        descripcion: "",
      })
    } catch (error) {
      console.error("Error al crear sección:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la sección",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Manejar edición de sección
  const handleEditSeccion = async () => {
    if (!currentSeccion || !currentSeccion.nombre) {
      toast({
        title: "Error",
        description: "Por favor complete el nombre de la sección",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      const { data, error } = await supabase
        .from("secciones")
        .update({
          nombre: currentSeccion.nombre,
          descripcion: currentSeccion.descripcion,
        })
        .eq("id", currentSeccion.id)
        .select()

      if (error) throw error

      // Actualizar la lista de secciones
      setSecciones(secciones.map((seccion) => (seccion.id === data[0].id ? data[0] : seccion)))

      setIsEditDialogOpen(false)

      toast({
        title: "Sección actualizada",
        description: `Sección ${data[0].nombre} actualizada exitosamente`,
      })
    } catch (error) {
      console.error("Error al actualizar sección:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la sección",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Manejar eliminación de sección
  const handleDeleteSeccion = async () => {
    if (!currentSeccion) return

    try {
      setSubmitting(true)

      const { error } = await supabase.from("secciones").delete().eq("id", currentSeccion.id)

      if (error) throw error

      // Actualizar la lista de secciones
      setSecciones(secciones.filter((seccion) => seccion.id !== currentSeccion.id))

      setIsDeleteDialogOpen(false)

      toast({
        title: "Sección eliminada",
        description: `Sección ${currentSeccion.nombre} eliminada exitosamente`,
      })
    } catch (error) {
      console.error("Error al eliminar sección:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la sección. Puede que tenga relaciones con otros registros.",
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
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Secciones</h1>
          <p className="text-muted-foreground">Administra las secciones académicas del sistema.</p>
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
                  placeholder="Buscar secciones..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700">
                  <Plus className="mr-2 h-4 w-4" /> Crear Sección
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Sección</DialogTitle>
                  <DialogDescription>Crea una nueva sección académica en el sistema.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      value={newSeccion.nombre}
                      onChange={(e) => setNewSeccion({ ...newSeccion, nombre: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Textarea
                      id="descripcion"
                      value={newSeccion.descripcion || ""}
                      onChange={(e) => setNewSeccion({ ...newSeccion, descripcion: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={submitting}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateSeccion} disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...
                      </>
                    ) : (
                      "Crear Sección"
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
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Cargando secciones...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : secciones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      No se encontraron secciones con los criterios de búsqueda.
                    </TableCell>
                  </TableRow>
                ) : (
                  secciones.map((seccion) => (
                    <TableRow key={seccion.id}>
                      <TableCell className="font-medium">{seccion.nombre}</TableCell>
                      <TableCell>{seccion.descripcion || "-"}</TableCell>
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
                                setCurrentSeccion(seccion)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setCurrentSeccion(seccion)
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
            <DialogTitle>Editar Sección</DialogTitle>
            <DialogDescription>Modifica la información de la sección seleccionada.</DialogDescription>
          </DialogHeader>
          {currentSeccion && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-nombre">Nombre</Label>
                <Input
                  id="edit-nombre"
                  value={currentSeccion.nombre}
                  onChange={(e) => setCurrentSeccion({ ...currentSeccion, nombre: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-descripcion">Descripción</Label>
                <Textarea
                  id="edit-descripcion"
                  value={currentSeccion.descripcion || ""}
                  onChange={(e) => setCurrentSeccion({ ...currentSeccion, descripcion: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={handleEditSeccion} disabled={submitting}>
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
            <DialogTitle>Eliminar Sección</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta sección? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {currentSeccion && (
            <div className="py-4">
              <p>
                Estás a punto de eliminar la sección <strong>{currentSeccion.nombre}</strong>.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteSeccion} disabled={submitting}>
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
