"use client"

import { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, MoreVertical, Edit, Trash } from "lucide-react"

// Datos de ejemplo para secciones
const seccionesData = [
  {
    id: "1",
    nombre: "A",
    descripcion: "Sección A para todos los grados",
  },
  {
    id: "2",
    nombre: "B",
    descripcion: "Sección B para todos los grados",
  },
  {
    id: "3",
    nombre: "C",
    descripcion: "Sección C para grados con alta demanda",
  },
  {
    id: "4",
    nombre: "D",
    descripcion: "Sección D para casos especiales",
  },
]

export default function GradosSeccionesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("secciones")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentSeccion, setCurrentSeccion] = useState(null)
  const [newSeccion, setNewSeccion] = useState({
    nombre: "",
    descripcion: "",
  })

  // Filtrar secciones
  const filteredSecciones = seccionesData.filter((seccion) => {
    return seccion.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Manejar creación de sección
  const handleCreateSeccion = () => {
    // Aquí iría la lógica para crear la sección en la base de datos
    console.log("Creando sección:", newSeccion)
    setIsCreateDialogOpen(false)
    // Resetear el formulario
    setNewSeccion({
      nombre: "",
      descripcion: "",
    })
  }

  // Manejar edición de sección
  const handleEditSeccion = () => {
    // Aquí iría la lógica para actualizar la sección en la base de datos
    console.log("Editando sección:", currentSeccion)
    setIsEditDialogOpen(false)
  }

  // Manejar eliminación de sección
  const handleDeleteSeccion = () => {
    // Aquí iría la lógica para eliminar la sección en la base de datos
    console.log("Eliminando sección:", currentSeccion)
    setIsDeleteDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Secciones</h1>
          <p className="text-muted-foreground">Administra las secciones académicas del sistema.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="secciones">Secciones</TabsTrigger>
        </TabsList>

        <TabsContent value="secciones" className="space-y-4">
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
                          value={newSeccion.descripcion}
                          onChange={(e) => setNewSeccion({ ...newSeccion, descripcion: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateSeccion}>Crear Sección</Button>
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
                    {filteredSecciones.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                          No se encontraron secciones con los criterios de búsqueda.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSecciones.map((seccion) => (
                        <TableRow key={seccion.id}>
                          <TableCell className="font-medium">{seccion.nombre}</TableCell>
                          <TableCell>{seccion.descripcion}</TableCell>
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
        </TabsContent>
      </Tabs>

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
                  value={currentSeccion.descripcion}
                  onChange={(e) => setCurrentSeccion({ ...currentSeccion, descripcion: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditSeccion}>Guardar Cambios</Button>
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
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteSeccion}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
