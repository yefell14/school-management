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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, Plus, MoreVertical, Edit, Trash, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// Datos de ejemplo
const eventosData = [
  {
    id: "1",
    titulo: "Feria de Ciencias",
    descripcion: "Presentación de proyectos científicos de los estudiantes",
    fecha_inicio: "2023-05-15T09:00:00",
    fecha_fin: "2023-05-15T16:00:00",
    lugar: "Patio Central",
    tipo: "académico",
    publico: true,
    creado_por: "Juan Pérez",
  },
  {
    id: "2",
    titulo: "Día del Logro",
    descripcion: "Presentación de los logros académicos del semestre",
    fecha_inicio: "2023-06-30T10:00:00",
    fecha_fin: "2023-06-30T13:00:00",
    lugar: "Auditorio Principal",
    tipo: "académico",
    publico: true,
    creado_por: "María López",
  },
  {
    id: "3",
    titulo: "Campeonato Deportivo",
    descripcion: "Competencias deportivas entre grados",
    fecha_inicio: "2023-07-10T08:00:00",
    fecha_fin: "2023-07-14T16:00:00",
    lugar: "Campos Deportivos",
    tipo: "deportivo",
    publico: true,
    creado_por: "Carlos Gómez",
  },
  {
    id: "4",
    titulo: "Reunión de Padres",
    descripcion: "Reunión informativa con padres de familia",
    fecha_inicio: "2023-05-20T18:00:00",
    fecha_fin: "2023-05-20T20:00:00",
    lugar: "Aulas por Grado",
    tipo: "informativo",
    publico: false,
    creado_por: "Ana Rodríguez",
  },
  {
    id: "5",
    titulo: "Festival de Talentos",
    descripcion: "Presentación de talentos artísticos de los estudiantes",
    fecha_inicio: "2023-08-25T14:00:00",
    fecha_fin: "2023-08-25T18:00:00",
    lugar: "Auditorio Principal",
    tipo: "cultural",
    publico: true,
    creado_por: "Pedro Sánchez",
  },
]

const tiposEvento = [
  { value: "académico", label: "Académico" },
  { value: "deportivo", label: "Deportivo" },
  { value: "cultural", label: "Cultural" },
  { value: "informativo", label: "Informativo" },
  { value: "otro", label: "Otro" },
]

export default function EventosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [tipoFilter, setTipoFilter] = useState("todos")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentEvento, setCurrentEvento] = useState(null)
  const [newEvento, setNewEvento] = useState({
    titulo: "",
    descripcion: "",
    fecha_inicio: new Date(),
    hora_inicio: "09:00",
    fecha_fin: new Date(),
    hora_fin: "13:00",
    lugar: "",
    tipo: "académico",
    publico: true,
  })

  // Filtrar eventos
  const filteredEventos = eventosData.filter((evento) => {
    const matchesSearch = evento.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTipo = tipoFilter === "todos" || evento.tipo === tipoFilter

    return matchesSearch && matchesTipo
  })

  // Manejar creación de evento
  const handleCreateEvento = () => {
    // Aquí iría la lógica para crear el evento en la base de datos
    console.log("Creando evento:", newEvento)
    setIsCreateDialogOpen(false)
    // Resetear el formulario
    setNewEvento({
      titulo: "",
      descripcion: "",
      fecha_inicio: new Date(),
      hora_inicio: "09:00",
      fecha_fin: new Date(),
      hora_fin: "13:00",
      lugar: "",
      tipo: "académico",
      publico: true,
    })
  }

  // Manejar edición de evento
  const handleEditEvento = () => {
    // Aquí iría la lógica para actualizar el evento en la base de datos
    console.log("Editando evento:", currentEvento)
    setIsEditDialogOpen(false)
  }

  // Manejar eliminación de evento
  const handleDeleteEvento = () => {
    // Aquí iría la lógica para eliminar el evento en la base de datos
    console.log("Eliminando evento:", currentEvento)
    setIsDeleteDialogOpen(false)
  }

  // Formatear fecha
  const formatFecha = (fechaString) => {
    const fecha = new Date(fechaString)
    return format(fecha, "PPP", { locale: es })
  }

  // Formatear hora
  const formatHora = (fechaString) => {
    const fecha = new Date(fechaString)
    return format(fecha, "HH:mm")
  }

  // Formatear tipo de evento
  const formatTipo = (tipo) => {
    const tipoObj = tiposEvento.find((t) => t.value === tipo)
    return tipoObj ? tipoObj.label : tipo
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Eventos</h1>
          <p className="text-muted-foreground">Administra los eventos escolares.</p>
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
                  placeholder="Buscar eventos..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  {tiposEvento.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700">
                  <Plus className="mr-2 h-4 w-4" /> Crear Evento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Crear Evento</DialogTitle>
                  <DialogDescription>Crea un nuevo evento escolar.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="titulo">Título</Label>
                    <Input
                      id="titulo"
                      value={newEvento.titulo}
                      onChange={(e) => setNewEvento({ ...newEvento, titulo: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Textarea
                      id="descripcion"
                      value={newEvento.descripcion}
                      onChange={(e) => setNewEvento({ ...newEvento, descripcion: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Fecha de Inicio</Label>
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newEvento.fecha_inicio
                              ? format(newEvento.fecha_inicio, "PPP", { locale: es })
                              : "Seleccionar fecha"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newEvento.fecha_inicio}
                            onSelect={(date) => setNewEvento({ ...newEvento, fecha_inicio: date })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <Input
                        type="time"
                        value={newEvento.hora_inicio}
                        onChange={(e) => setNewEvento({ ...newEvento, hora_inicio: e.target.value })}
                        className="w-32"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Fecha de Fin</Label>
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newEvento.fecha_fin
                              ? format(newEvento.fecha_fin, "PPP", { locale: es })
                              : "Seleccionar fecha"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newEvento.fecha_fin}
                            onSelect={(date) => setNewEvento({ ...newEvento, fecha_fin: date })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <Input
                        type="time"
                        value={newEvento.hora_fin}
                        onChange={(e) => setNewEvento({ ...newEvento, hora_fin: e.target.value })}
                        className="w-32"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lugar">Lugar</Label>
                    <Input
                      id="lugar"
                      value={newEvento.lugar}
                      onChange={(e) => setNewEvento({ ...newEvento, lugar: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select
                      value={newEvento.tipo}
                      onValueChange={(value) => setNewEvento({ ...newEvento, tipo: value })}
                    >
                      <SelectTrigger id="tipo">
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposEvento.map((tipo) => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="publico"
                      checked={newEvento.publico}
                      onCheckedChange={(checked) => setNewEvento({ ...newEvento, publico: checked })}
                    />
                    <Label htmlFor="publico">Evento público</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateEvento}>Crear Evento</Button>
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
                  <TableHead>Título</TableHead>
                  <TableHead>Fecha Inicio</TableHead>
                  <TableHead>Fecha Fin</TableHead>
                  <TableHead>Lugar</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Visibilidad</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEventos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No se encontraron eventos con los criterios de búsqueda.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEventos.map((evento) => (
                    <TableRow key={evento.id}>
                      <TableCell className="font-medium">{evento.titulo}</TableCell>
                      <TableCell>
                        {formatFecha(evento.fecha_inicio)} {formatHora(evento.fecha_inicio)}
                      </TableCell>
                      <TableCell>
                        {formatFecha(evento.fecha_fin)} {formatHora(evento.fecha_fin)}
                      </TableCell>
                      <TableCell>{evento.lugar}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            evento.tipo === "académico"
                              ? "bg-blue-100 text-blue-800 border-blue-300"
                              : evento.tipo === "deportivo"
                                ? "bg-green-100 text-green-800 border-green-300"
                                : evento.tipo === "cultural"
                                  ? "bg-purple-100 text-purple-800 border-purple-300"
                                  : evento.tipo === "informativo"
                                    ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                    : "bg-gray-100 text-gray-800 border-gray-300"
                          }
                        >
                          {formatTipo(evento.tipo)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            evento.publico
                              ? "bg-green-100 text-green-800 border-green-300"
                              : "bg-red-100 text-red-800 border-red-300"
                          }
                        >
                          {evento.publico ? "Público" : "Privado"}
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
                                setCurrentEvento(evento)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setCurrentEvento(evento)
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Evento</DialogTitle>
            <DialogDescription>Modifica la información del evento seleccionado.</DialogDescription>
          </DialogHeader>
          {currentEvento && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-titulo">Título</Label>
                <Input
                  id="edit-titulo"
                  value={currentEvento.titulo}
                  onChange={(e) => setCurrentEvento({ ...currentEvento, titulo: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-descripcion">Descripción</Label>
                <Textarea
                  id="edit-descripcion"
                  value={currentEvento.descripcion}
                  onChange={(e) => setCurrentEvento({ ...currentEvento, descripcion: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-lugar">Lugar</Label>
                <Input
                  id="edit-lugar"
                  value={currentEvento.lugar}
                  onChange={(e) => setCurrentEvento({ ...currentEvento, lugar: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-tipo">Tipo</Label>
                <Select
                  value={currentEvento.tipo}
                  onValueChange={(value) => setCurrentEvento({ ...currentEvento, tipo: value })}
                >
                  <SelectTrigger id="edit-tipo">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposEvento.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-publico"
                  checked={currentEvento.publico}
                  onCheckedChange={(checked) => setCurrentEvento({ ...currentEvento, publico: checked })}
                />
                <Label htmlFor="edit-publico">Evento público</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditEvento}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Evento</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {currentEvento && (
            <div className="py-4">
              <p>
                Estás a punto de eliminar el evento <strong>{currentEvento.titulo}</strong>.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteEvento}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
