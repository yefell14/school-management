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
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Plus, MoreVertical, Edit, Trash, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"

interface Grupo {
  id: string
  curso: { nombre: string }
  grado: { nombre: string }
  seccion: { nombre: string }
  profesor: { nombre: string; apellidos: string }
}

interface Horario {
  id: string
  grupo_id: string
  dia: string
  hora_inicio: string
  hora_fin: string
  aula: string
}

type Dia = 'lunes' | 'martes' | 'miércoles' | 'jueves' | 'viernes' | 'sábado' | 'domingo'

const diasSemana: Record<Dia, string> = {
  lunes: 'Lunes',
  martes: 'Martes',
  miércoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sábado: 'Sábado',
  domingo: 'Domingo'
}

export default function HorariosPage() {
  const { toast } = useToast()
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [selectedGrupo, setSelectedGrupo] = useState("")
  const [horarios, setHorarios] = useState<Horario[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentHorario, setCurrentHorario] = useState<Horario | null>(null)
  const [newHorario, setNewHorario] = useState<Omit<Horario, 'id'>>({
    grupo_id: "",
    dia: "lunes",
    hora_inicio: "08:00",
    hora_fin: "09:00",
    aula: "",
  })
  const [loading, setLoading] = useState(true)
  const [loadingHorarios, setLoadingHorarios] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Cargar grupos
  useEffect(() => {
    const fetchGrupos = async () => {
      try {
        setLoading(true)

        // Obtener grupos con información relacionada
        const { data: gruposData, error: gruposError } = await supabase
          .from("grupos")
          .select(`
            id,
            cursos:cursos(nombre),
            grados:grados(nombre),
            secciones:secciones(nombre),
            grupo_profesor(
              usuarios(nombre, apellidos)
            )
          `)
          .eq("activo", true)
          .order("id")

        if (gruposError) {
          console.error("Error al cargar grupos:", gruposError)
          throw gruposError
        }

        // Transformar los datos para que coincidan con la interfaz Grupo
        const gruposTransformados: Grupo[] = (gruposData || []).map(grupo => {
          const curso = Array.isArray(grupo.cursos) ? grupo.cursos[0] : grupo.cursos
          const grado = Array.isArray(grupo.grados) ? grupo.grados[0] : grupo.grados
          const seccion = Array.isArray(grupo.secciones) ? grupo.secciones[0] : grupo.secciones
          const profesorData = grupo.grupo_profesor?.[0]?.usuarios
          const profesor = Array.isArray(profesorData) ? profesorData[0] : profesorData

          return {
            id: grupo.id,
            curso: { nombre: curso?.nombre || '' },
            grado: { nombre: grado?.nombre || '' },
            seccion: { nombre: seccion?.nombre || '' },
            profesor: {
              nombre: profesor?.nombre || '',
              apellidos: profesor?.apellidos || ''
            }
          }
        })

        setGrupos(gruposTransformados)
      } catch (error) {
        console.error("Error al cargar grupos:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los grupos. Por favor, intente nuevamente.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchGrupos()
  }, [toast])

  // Cargar horarios cuando se selecciona un grupo
  useEffect(() => {
    const fetchHorarios = async () => {
      if (!selectedGrupo) {
        setHorarios([])
        return
      }

      try {
        setLoadingHorarios(true)

        const { data, error } = await supabase.from("horarios").select("*").eq("grupo_id", selectedGrupo)

        if (error) throw error

        setHorarios(data || [])
        setNewHorario((prev) => ({ ...prev, grupo_id: selectedGrupo }))
      } catch (error) {
        console.error("Error al cargar horarios:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los horarios",
          variant: "destructive",
        })
      } finally {
        setLoadingHorarios(false)
      }
    }

    fetchHorarios()
  }, [selectedGrupo, toast])

  // Manejar creación de horario
  const handleCreateHorario = async () => {
    if (!newHorario.grupo_id || !newHorario.dia || !newHorario.hora_inicio || !newHorario.hora_fin) {
      toast({
        title: "Error",
        description: "Por favor complete los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      const { data, error } = await supabase.from("horarios").insert([newHorario]).select()

      if (error) throw error

      setHorarios([...horarios, data[0]])
      setIsCreateDialogOpen(false)

      toast({
        title: "Horario creado",
        description: "Horario creado exitosamente",
      })

      // Resetear el formulario manteniendo el grupo_id
      setNewHorario({
        grupo_id: selectedGrupo,
        dia: "lunes",
        hora_inicio: "08:00",
        hora_fin: "09:00",
        aula: "",
      })
    } catch (error) {
      console.error("Error al crear horario:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el horario",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Manejar edición de horario
  const handleEditHorario = async () => {
    if (!currentHorario || !currentHorario.dia || !currentHorario.hora_inicio || !currentHorario.hora_fin) {
      toast({
        title: "Error",
        description: "Por favor complete los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      const { id, grupo_id, ...updateData } = currentHorario

      const { data, error } = await supabase.from("horarios").update(updateData).eq("id", id).select()

      if (error) throw error

      // Actualizar la lista de horarios
      setHorarios(horarios.map((h) => (h.id === data[0].id ? data[0] : h)))

      setIsEditDialogOpen(false)

      toast({
        title: "Horario actualizado",
        description: "Horario actualizado exitosamente",
      })
    } catch (error) {
      console.error("Error al actualizar horario:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el horario",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Manejar eliminación de horario
  const handleDeleteHorario = async () => {
    if (!currentHorario) return

    try {
      setSubmitting(true)

      const { error } = await supabase.from("horarios").delete().eq("id", currentHorario.id)

      if (error) throw error

      // Actualizar la lista de horarios
      setHorarios(horarios.filter((h) => h.id !== currentHorario.id))

      setIsDeleteDialogOpen(false)

      toast({
        title: "Horario eliminado",
        description: "Horario eliminado exitosamente",
      })
    } catch (error) {
      console.error("Error al eliminar horario:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el horario",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Función para formatear el nombre del día
  const formatDia = (dia: Dia): string => {
    return diasSemana[dia] || dia
  }

  // Función para obtener el nombre del grupo
  const getGrupoNombre = (grupoId: string): string => {
    const grupo = grupos.find(g => g.id === grupoId)
    if (!grupo) return 'Grupo no encontrado'
    return `${grupo.curso.nombre} - ${grupo.grado.nombre} ${grupo.seccion.nombre}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Horarios</h1>
        <p className="text-muted-foreground">Administra los horarios de los grupos académicos.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-1 items-center space-x-2">
              <Select value={selectedGrupo} onValueChange={setSelectedGrupo}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Seleccionar grupo" />
                </SelectTrigger>
                <SelectContent>
                  {loading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Cargando grupos...</span>
                    </div>
                  ) : grupos.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">No hay grupos disponibles</div>
                  ) : (
                    grupos.map((grupo) => (
                      <SelectItem key={grupo.id} value={grupo.id}>
                        {grupo.curso?.nombre} - {grupo.grado?.nombre} {grupo.seccion?.nombre}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700" disabled={!selectedGrupo}>
                  <Plus className="mr-2 h-4 w-4" /> Agregar Horario
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Horario</DialogTitle>
                  <DialogDescription>
                    Agrega un nuevo horario para el grupo {getGrupoNombre(selectedGrupo)}.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="dia">Día</Label>
                    <Select
                      value={newHorario.dia}
                      onValueChange={(value) => setNewHorario({ ...newHorario, dia: value })}
                    >
                      <SelectTrigger id="dia">
                        <SelectValue placeholder="Seleccionar día" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lunes">Lunes</SelectItem>
                        <SelectItem value="martes">Martes</SelectItem>
                        <SelectItem value="miércoles">Miércoles</SelectItem>
                        <SelectItem value="jueves">Jueves</SelectItem>
                        <SelectItem value="viernes">Viernes</SelectItem>
                        <SelectItem value="sábado">Sábado</SelectItem>
                        <SelectItem value="domingo">Domingo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="hora_inicio">Hora de Inicio</Label>
                      <Input
                        id="hora_inicio"
                        type="time"
                        value={newHorario.hora_inicio}
                        onChange={(e) => setNewHorario({ ...newHorario, hora_inicio: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="hora_fin">Hora de Fin</Label>
                      <Input
                        id="hora_fin"
                        type="time"
                        value={newHorario.hora_fin}
                        onChange={(e) => setNewHorario({ ...newHorario, hora_fin: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="aula">Aula</Label>
                    <Input
                      id="aula"
                      value={newHorario.aula}
                      onChange={(e) => setNewHorario({ ...newHorario, aula: e.target.value })}
                      placeholder="Opcional"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={submitting}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateHorario} disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...
                      </>
                    ) : (
                      "Crear Horario"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedGrupo ? (
            <div className="text-center py-8 text-muted-foreground">
              Selecciona un grupo para ver y gestionar sus horarios.
            </div>
          ) : loadingHorarios ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Cargando horarios...</span>
            </div>
          ) : horarios.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay horarios definidos para este grupo. Haz clic en "Agregar Horario" para comenzar.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Día</TableHead>
                    <TableHead>Hora Inicio</TableHead>
                    <TableHead>Hora Fin</TableHead>
                    <TableHead>Aula</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {horarios.map((horario) => (
                    <TableRow key={horario.id}>
                      <TableCell className="font-medium">{formatDia(horario.dia as Dia)}</TableCell>
                      <TableCell>{horario.hora_inicio}</TableCell>
                      <TableCell>{horario.hora_fin}</TableCell>
                      <TableCell>{horario.aula || "-"}</TableCell>
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
                                setCurrentHorario(horario)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setCurrentHorario(horario)
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
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Horario</DialogTitle>
            <DialogDescription>Modifica la información del horario seleccionado.</DialogDescription>
          </DialogHeader>
          {currentHorario && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-dia">Día</Label>
                <Select
                  value={currentHorario.dia}
                  onValueChange={(value) => setCurrentHorario({ ...currentHorario, dia: value })}
                >
                  <SelectTrigger id="edit-dia">
                    <SelectValue placeholder="Seleccionar día" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lunes">Lunes</SelectItem>
                    <SelectItem value="martes">Martes</SelectItem>
                    <SelectItem value="miércoles">Miércoles</SelectItem>
                    <SelectItem value="jueves">Jueves</SelectItem>
                    <SelectItem value="viernes">Viernes</SelectItem>
                    <SelectItem value="sábado">Sábado</SelectItem>
                    <SelectItem value="domingo">Domingo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-hora_inicio">Hora de Inicio</Label>
                  <Input
                    id="edit-hora_inicio"
                    type="time"
                    value={currentHorario.hora_inicio}
                    onChange={(e) => setCurrentHorario({ ...currentHorario, hora_inicio: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-hora_fin">Hora de Fin</Label>
                  <Input
                    id="edit-hora_fin"
                    type="time"
                    value={currentHorario.hora_fin}
                    onChange={(e) => setCurrentHorario({ ...currentHorario, hora_fin: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-aula">Aula</Label>
                <Input
                  id="edit-aula"
                  value={currentHorario.aula || ""}
                  onChange={(e) => setCurrentHorario({ ...currentHorario, aula: e.target.value })}
                  placeholder="Opcional"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={handleEditHorario} disabled={submitting}>
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
            <DialogTitle>Eliminar Horario</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este horario? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {currentHorario && (
            <div className="py-4">
              <p>
                Estás a punto de eliminar el horario del día <strong>{formatDia(currentHorario.dia as Dia)}</strong> de{" "}
                <strong>{currentHorario.hora_inicio}</strong> a <strong>{currentHorario.hora_fin}</strong>.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteHorario} disabled={submitting}>
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
