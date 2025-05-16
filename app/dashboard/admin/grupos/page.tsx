"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Search, Plus, Users, BookOpen, User, Video } from "lucide-react"
import {
  getGrupos,
  getCursos,
  getGrados,
  getSecciones,
  getUsuarios,
  createGrupo,
  updateGrupo,
  deleteGrupo,
  toggleGrupoActivo,
  asignarAlumnoGrupo,
  removerAlumnoGrupo,
  getAlumnosGrupo,
} from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import type { Grupo, Curso, Grado, Seccion, Usuario } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

interface GrupoWithProfesorId extends Grupo {
  profesor_id?: string;
}

export default function GruposPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [gradoFilter, setGradoFilter] = useState("todos")
  const [cursoFilter, setCursoFilter] = useState("todos")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAsignarAlumnosDialogOpen, setIsAsignarAlumnosDialogOpen] = useState(false)
  const [isAsignarProfesorDialogOpen, setIsAsignarProfesorDialogOpen] = useState(false)
  const [currentGrupo, setCurrentGrupo] = useState<GrupoWithProfesorId | null>(null)
  const [newGrupo, setNewGrupo] = useState<{
    curso_id: string;
    grado_id: string;
    seccion_id: string;
    año_escolar: string;
    activo: boolean;
  }>({
    curso_id: "",
    grado_id: "",
    seccion_id: "",
    año_escolar: new Date().getFullYear().toString(),
    activo: true,
  })
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [cursos, setCursos] = useState<Curso[]>([])
  const [grados, setGrados] = useState<Grado[]>([])
  const [secciones, setSecciones] = useState<Seccion[]>([])
  const [profesores, setProfesores] = useState<Usuario[]>([])
  const [alumnos, setAlumnos] = useState<Usuario[]>([])
  const [alumnosGrupo, setAlumnosGrupo] = useState<any[]>([])
  const [alumnosSeleccionados, setAlumnosSeleccionados] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [loadingAlumnos, setLoadingAlumnos] = useState(false)

  // Cargar grupos
  useEffect(() => {
    const fetchGrupos = async () => {
      try {
        setLoading(true)
        const data = await getGrupos({
          grado_id: gradoFilter !== "todos" ? gradoFilter : undefined,
          curso_id: cursoFilter !== "todos" ? cursoFilter : undefined,
          busqueda: searchTerm,
        })
        setGrupos(data)
      } catch (error) {
        console.error("Error al cargar grupos:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los grupos",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchGrupos()
  }, [searchTerm, gradoFilter, cursoFilter, toast])

  // Cargar opciones para selects
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true)
        const [cursosData, gradosData, seccionesData, profesoresData] = await Promise.all([
          getCursos({ activo: true }),
          getGrados(),
          getSecciones(),
          getUsuarios({ rol: "profesor", activo: true }),
        ])

        setCursos(cursosData)
        setGrados(gradosData)
        setSecciones(seccionesData)
        setProfesores(profesoresData)
      } catch (error) {
        console.error("Error al cargar opciones:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar algunas opciones",
          variant: "destructive",
        })
      } finally {
        setLoadingOptions(false)
      }
    }

    fetchOptions()
  }, [toast])

  // Cargar alumnos disponibles
  const cargarAlumnosDisponibles = async (grupoId) => {
    try {
      setLoadingAlumnos(true)

      // Obtener alumnos ya asignados al grupo
      const alumnosAsignados = await getAlumnosGrupo(grupoId)
      setAlumnosGrupo(alumnosAsignados)

      // Obtener todos los alumnos activos
      const alumnosData = await getUsuarios({ rol: "alumno", activo: true })
      setAlumnos(alumnosData)

      // Marcar los alumnos ya asignados
      const alumnosIds = alumnosAsignados.map((item) => item.alumno_id)
      setAlumnosSeleccionados(alumnosIds)
    } catch (error) {
      console.error("Error al cargar alumnos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los alumnos",
        variant: "destructive",
      })
    } finally {
      setLoadingAlumnos(false)
    }
  }

  // Manejar creación de grupo
  const handleCreateGrupo = async () => {
    if (!newGrupo.curso_id || !newGrupo.grado_id || !newGrupo.seccion_id || !newGrupo.año_escolar) {
      toast({
        title: "Error",
        description: "Por favor complete los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      // Crear el grupo
      const nuevoGrupo = await createGrupo(newGrupo)

      // Crear sala virtual para el grupo
      if (nuevoGrupo && nuevoGrupo.id) {
        // Generar un enlace aleatorio para la sala virtual
        const enlaceAleatorio = `https://meet.google.com/${Math.random().toString(36).substring(2, 10)}`

        // Crear la sala virtual
        await supabase.from("salas_virtuales").insert([
          {
            grupo_id: nuevoGrupo.id,
            titulo: `Sala virtual - ${cursos.find((c) => c.id === nuevoGrupo.curso_id)?.nombre || "Curso"} - ${grados.find((g) => g.id === nuevoGrupo.grado_id)?.nombre || "Grado"} ${secciones.find((s) => s.id === nuevoGrupo.seccion_id)?.nombre || "Sección"}`,
            descripcion: `Sala virtual para el grupo de ${cursos.find((c) => c.id === nuevoGrupo.curso_id)?.nombre || "Curso"}`,
            enlace: enlaceAleatorio,
          },
        ])
      }

      // Recargar los grupos
      const updatedGrupos = await getGrupos()
      setGrupos(updatedGrupos)

      setIsCreateDialogOpen(false)

      toast({
        title: "Grupo creado",
        description: "Grupo y sala virtual creados exitosamente",
      })

      // Resetear el formulario
      setNewGrupo({
        curso_id: "",
        grado_id: "",
        seccion_id: "",
        año_escolar: new Date().getFullYear().toString(),
        activo: true,
      })
    } catch (error) {
      console.error("Error al crear grupo:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el grupo",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Manejar edición de grupo
  const handleEditGrupo = async () => {
    if (
      !currentGrupo ||
      !currentGrupo.curso_id ||
      !currentGrupo.grado_id ||
      !currentGrupo.seccion_id ||
      !currentGrupo.año_escolar
    ) {
      toast({
        title: "Error",
        description: "Por favor complete los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      // Extraer solo los campos que necesitamos actualizar
      const { id, curso, grado, seccion, profesor, ...updateData } = currentGrupo as any

      // Si el profesor_id es "sin_profesor" o vacío, lo establecemos como null
      if (updateData.profesor_id === "sin_profesor" || !updateData.profesor_id) {
        updateData.profesor_id = null
      }

      await updateGrupo(id, updateData)

      // Recargar los grupos para obtener las relaciones completas
      const updatedGrupos = await getGrupos()
      setGrupos(updatedGrupos)

      setIsEditDialogOpen(false)

      toast({
        title: "Grupo actualizado",
        description: "Grupo actualizado exitosamente",
      })
    } catch (error) {
      console.error("Error al actualizar grupo:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el grupo",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Manejar eliminación de grupo
  const handleDeleteGrupo = async () => {
    if (!currentGrupo) return

    try {
      setSubmitting(true)
      await deleteGrupo(currentGrupo.id)

      // Actualizar la lista de grupos
      setGrupos(grupos.filter((grupo) => grupo.id !== currentGrupo.id))

      setIsDeleteDialogOpen(false)

      toast({
        title: "Grupo eliminado",
        description: "Grupo eliminado exitosamente",
      })
    } catch (error) {
      console.error("Error al eliminar grupo:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el grupo. Puede que tenga relaciones con otros registros.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Manejar cambio de estado de grupo
  const handleToggleGrupoStatus = async (grupoId, currentStatus) => {
    try {
      await toggleGrupoActivo(grupoId, !currentStatus)

      // Actualizar la lista de grupos
      setGrupos(grupos.map((grupo) => (grupo.id === grupoId ? { ...grupo, activo: !currentStatus } : grupo)))

      toast({
        title: "Estado actualizado",
        description: `Grupo ${currentStatus ? "desactivado" : "activado"} exitosamente`,
      })
    } catch (error) {
      console.error("Error al cambiar estado del grupo:", error)
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del grupo",
        variant: "destructive",
      })
    }
  }

  // Manejar asignación de alumnos
  const handleAsignarAlumnos = async () => {
    if (!currentGrupo) return

    try {
      setSubmitting(true)

      // Obtener alumnos actuales del grupo
      const alumnosActuales = alumnosGrupo.map((item) => item.alumno_id)

      // Alumnos a agregar (están en seleccionados pero no en actuales)
      const alumnosAgregar = alumnosSeleccionados.filter((id) => !alumnosActuales.includes(id))

      // Alumnos a eliminar (están en actuales pero no en seleccionados)
      const alumnosEliminar = alumnosActuales.filter((id) => !alumnosSeleccionados.includes(id))

      // Realizar las operaciones
      const promesasAgregar = alumnosAgregar.map((alumnoId) => asignarAlumnoGrupo(currentGrupo.id, alumnoId))

      const promesasEliminar = alumnosEliminar.map((alumnoId) => removerAlumnoGrupo(currentGrupo.id, alumnoId))

      await Promise.all([...promesasAgregar, ...promesasEliminar])

      toast({
        title: "Alumnos asignados",
        description: "Los alumnos han sido asignados exitosamente al grupo",
      })

      setIsAsignarAlumnosDialogOpen(false)
    } catch (error) {
      console.error("Error al asignar alumnos:", error)
      toast({
        title: "Error",
        description: "No se pudieron asignar los alumnos al grupo",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Manejar asignación de profesor
  const handleAsignarProfesor = async () => {
    if (!currentGrupo) return;

    try {
      setSubmitting(true);

      // Primero, eliminar cualquier asignación existente
      await supabase
        .from("grupo_profesor")
        .delete()
        .eq("grupo_id", currentGrupo.id);

      // Si se seleccionó un profesor (no "sin_profesor"), crear la nueva asignación
      if (currentGrupo.profesor_id !== "sin_profesor") {
        const { error: insertError } = await supabase
          .from("grupo_profesor")
          .insert({
            grupo_id: currentGrupo.id,
            profesor_id: currentGrupo.profesor_id
          });

        if (insertError) {
          throw insertError;
        }
      }

      // Obtener el grupo actualizado
      const { data: grupoActualizado, error: selectError } = await supabase
        .from("grupos")
        .select(`
          *,
          curso:cursos(*),
          grado:grados(*),
          seccion:secciones(*),
          grupo_profesor(
            profesor:profesor_id(*)
          )
        `)
        .eq("id", currentGrupo.id)
        .single();

      if (selectError) {
        throw selectError;
      }

      if (grupoActualizado) {
        setGrupos(prevGrupos =>
          prevGrupos.map(grupo =>
            grupo.id === currentGrupo.id
              ? {
                  ...grupoActualizado,
                  profesor: grupoActualizado.grupo_profesor?.[0]?.profesor
                }
              : grupo
          )
        );
      }

      setIsAsignarProfesorDialogOpen(false);
      
      toast({
        title: "Profesor asignado",
        description: "El profesor ha sido asignado exitosamente al grupo",
      });
    } catch (error) {
      console.error("Error al asignar profesor:", error);
      toast({
        title: "Error",
        description: "No se pudo asignar el profesor al grupo. Por favor, inténtelo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Manejar selección de alumnos
  const handleAlumnoSeleccionado = (alumnoId, checked) => {
    if (checked) {
      setAlumnosSeleccionados([...alumnosSeleccionados, alumnoId])
    } else {
      setAlumnosSeleccionados(alumnosSeleccionados.filter((id) => id !== alumnoId))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Grupos</h1>
          <p className="text-muted-foreground">Administra los grupos académicos, asigna profesores y alumnos.</p>
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
                  placeholder="Buscar grupos..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={gradoFilter} onValueChange={setGradoFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por grado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los grados</SelectItem>
                  {grados.map((grado) => (
                    <SelectItem key={grado.id} value={grado.id}>
                      {grado.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={cursoFilter} onValueChange={setCursoFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por curso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los cursos</SelectItem>
                  {cursos.map((curso) => (
                    <SelectItem key={curso.id} value={curso.id}>
                      {curso.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700">
                  <Plus className="mr-2 h-4 w-4" /> Crear Grupo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Crear Grupo</DialogTitle>
                  <DialogDescription>
                    Crea un nuevo grupo académico. Al crear un grupo, se generará automáticamente una sala virtual.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="curso">Curso</Label>
                    <Select
                      value={newGrupo.curso_id}
                      onValueChange={(value) => setNewGrupo({ ...newGrupo, curso_id: value })}
                      disabled={loadingOptions}
                    >
                      <SelectTrigger id="curso">
                        <SelectValue placeholder={loadingOptions ? "Cargando..." : "Seleccionar curso"} />
                      </SelectTrigger>
                      <SelectContent>
                        {cursos.map((curso) => (
                          <SelectItem key={curso.id} value={curso.id}>
                            {curso.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="grado">Grado</Label>
                    <Select
                      value={newGrupo.grado_id}
                      onValueChange={(value) => setNewGrupo({ ...newGrupo, grado_id: value })}
                      disabled={loadingOptions}
                    >
                      <SelectTrigger id="grado">
                        <SelectValue placeholder={loadingOptions ? "Cargando..." : "Seleccionar grado"} />
                      </SelectTrigger>
                      <SelectContent>
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
                      value={newGrupo.seccion_id}
                      onValueChange={(value) => setNewGrupo({ ...newGrupo, seccion_id: value })}
                      disabled={loadingOptions}
                    >
                      <SelectTrigger id="seccion">
                        <SelectValue placeholder={loadingOptions ? "Cargando..." : "Seleccionar sección"} />
                      </SelectTrigger>
                      <SelectContent>
                        {secciones.map((seccion) => (
                          <SelectItem key={seccion.id} value={seccion.id}>
                            {seccion.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="añoEscolar">Año Escolar</Label>
                    <Input
                      id="añoEscolar"
                      value={newGrupo.año_escolar}
                      onChange={(e) => setNewGrupo({ ...newGrupo, año_escolar: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={submitting}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateGrupo} disabled={submitting}>
                    {submitting ? "Creando..." : "Crear Grupo"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
            </div>
          ) : grupos.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No se encontraron grupos con los filtros seleccionados.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {grupos.map((grupo) => (
                <Card key={grupo.id} className={`overflow-hidden ${!grupo.activo ? "opacity-70" : ""}`}>
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-white">{grupo.curso?.nombre || "Curso no disponible"}</h3>
                        <p className="text-blue-100 text-sm">
                          {grupo.grado?.nombre || "Grado"} - {grupo.seccion?.nombre || "Sección"}
                        </p>
                      </div>
                      <Badge variant={grupo.activo ? "outline" : "secondary"} className="bg-white/20 text-white">
                        {grupo.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Profesor:{" "}
                          {grupo.profesor ? `${grupo.profesor.nombre} ${grupo.profesor.apellidos}` : "Sin asignar"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Año Escolar: {grupo.año_escolar}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Sala Virtual: Disponible</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentGrupo(grupo)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentGrupo(grupo)
                          cargarAlumnosDisponibles(grupo.id)
                          setIsAsignarAlumnosDialogOpen(true)
                        }}
                      >
                        <Users className="h-4 w-4 mr-1" /> Alumnos
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentGrupo({
                            ...grupo,
                            profesor_id: grupo.profesor?.id || "sin_profesor"
                          })
                          setIsAsignarProfesorDialogOpen(true)
                        }}
                      >
                        <User className="h-4 w-4 mr-1" /> Profesor
                      </Button>
                      <Button
                        variant={grupo.activo ? "destructive" : "default"}
                        size="sm"
                        onClick={() => handleToggleGrupoStatus(grupo.id, grupo.activo)}
                      >
                        {grupo.activo ? "Desactivar" : "Activar"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setCurrentGrupo(grupo)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Grupo</DialogTitle>
            <DialogDescription>Modifica la información del grupo académico.</DialogDescription>
          </DialogHeader>
          {currentGrupo && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-curso">Curso</Label>
                <Select
                  value={currentGrupo.curso_id}
                  onValueChange={(value) => setCurrentGrupo({ ...currentGrupo, curso_id: value })}
                  disabled={loadingOptions}
                >
                  <SelectTrigger id="edit-curso">
                    <SelectValue placeholder={loadingOptions ? "Cargando..." : "Seleccionar curso"} />
                  </SelectTrigger>
                  <SelectContent>
                    {cursos.map((curso) => (
                      <SelectItem key={curso.id} value={curso.id}>
                        {curso.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-grado">Grado</Label>
                <Select
                  value={currentGrupo.grado_id}
                  onValueChange={(value) => setCurrentGrupo({ ...currentGrupo, grado_id: value })}
                  disabled={loadingOptions}
                >
                  <SelectTrigger id="edit-grado">
                    <SelectValue placeholder={loadingOptions ? "Cargando..." : "Seleccionar grado"} />
                  </SelectTrigger>
                  <SelectContent>
                    {grados.map((grado) => (
                      <SelectItem key={grado.id} value={grado.id}>
                        {grado.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-seccion">Sección</Label>
                <Select
                  value={currentGrupo.seccion_id}
                  onValueChange={(value) => setCurrentGrupo({ ...currentGrupo, seccion_id: value })}
                  disabled={loadingOptions}
                >
                  <SelectTrigger id="edit-seccion">
                    <SelectValue placeholder={loadingOptions ? "Cargando..." : "Seleccionar sección"} />
                  </SelectTrigger>
                  <SelectContent>
                    {secciones.map((seccion) => (
                      <SelectItem key={seccion.id} value={seccion.id}>
                        {seccion.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-añoEscolar">Año Escolar</Label>
                <Input
                  id="edit-añoEscolar"
                  value={currentGrupo.año_escolar}
                  onChange={(e) => setCurrentGrupo({ ...currentGrupo, año_escolar: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={handleEditGrupo} disabled={submitting}>
              {submitting ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar Grupo</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este grupo? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteGrupo} disabled={submitting}>
              {submitting ? "Eliminando..." : "Eliminar Grupo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para asignar alumnos */}
      <Dialog open={isAsignarAlumnosDialogOpen} onOpenChange={setIsAsignarAlumnosDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Asignar Alumnos al Grupo</DialogTitle>
            <DialogDescription>Selecciona los alumnos que deseas asignar a este grupo.</DialogDescription>
          </DialogHeader>

          {currentGrupo && (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="mb-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar alumnos..."
                    className="flex-1"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-auto">
                {loadingAlumnos ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
                  </div>
                ) : alumnos.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No hay alumnos disponibles.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {alumnos
                      .filter(
                        (alumno) =>
                          searchTerm === "" ||
                          `${alumno.nombre} ${alumno.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          alumno.dni?.toLowerCase().includes(searchTerm.toLowerCase()),
                      )
                      .map((alumno) => (
                        <div key={alumno.id} className="flex items-center space-x-2 p-2 border rounded-md">
                          <Checkbox
                            id={`alumno-${alumno.id}`}
                            checked={alumnosSeleccionados.includes(alumno.id)}
                            onCheckedChange={(checked) => handleAlumnoSeleccionado(alumno.id, checked)}
                          />
                          <Label htmlFor={`alumno-${alumno.id}`} className="flex-1 cursor-pointer">
                            {alumno.nombre} {alumno.apellidos} - {alumno.dni || "Sin DNI"}
                          </Label>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsAsignarAlumnosDialogOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={handleAsignarAlumnos} disabled={submitting || loadingAlumnos}>
              {submitting ? "Guardando..." : "Guardar Asignaciones"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para asignar profesor */}
      <Dialog open={isAsignarProfesorDialogOpen} onOpenChange={setIsAsignarProfesorDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Asignar Profesor al Grupo</DialogTitle>
            <DialogDescription>Selecciona el profesor que deseas asignar a este grupo.</DialogDescription>
          </DialogHeader>

          {currentGrupo && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="profesor-grupo">Profesor</Label>
                <Select
                  value={currentGrupo.profesor_id || "sin_profesor"}
                  onValueChange={(value) =>
                    setCurrentGrupo({
                      ...currentGrupo,
                      profesor_id: value,
                    })
                  }
                  disabled={loadingOptions}
                >
                  <SelectTrigger id="profesor-grupo">
                    <SelectValue placeholder={loadingOptions ? "Cargando..." : "Seleccionar profesor"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sin_profesor">Sin profesor asignado</SelectItem>
                    {profesores.map((profesor) => (
                      <SelectItem key={profesor.id} value={profesor.id}>
                        {profesor.nombre} {profesor.apellidos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAsignarProfesorDialogOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={handleAsignarProfesor} disabled={submitting}>
              {submitting ? "Guardando..." : "Guardar Asignación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
