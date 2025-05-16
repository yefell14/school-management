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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, MoreVertical, Edit, Trash, Key, UserCheck, UserX, Loader2 } from "lucide-react"
import {
  getUsuarios,
  getRegistroTokens,
  createRegistroToken,
  toggleUsuarioActivo,
  deleteRegistroToken,
} from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

export default function UsuariosPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [rolFilter, setRolFilter] = useState("todos")
  const [activeTab, setActiveTab] = useState("usuarios")
  const [isCreateTokenDialogOpen, setIsCreateTokenDialogOpen] = useState(false)
  const [newToken, setNewToken] = useState({
    nombre: "",
    apellidos: "",
    rol: "alumno",
  })
  const [usuarios, setUsuarios] = useState([])
  const [tokens, setTokens] = useState([])
  const [loading, setLoading] = useState(true)
  const [tokenLoading, setTokenLoading] = useState(true)
  const [creatingToken, setCreatingToken] = useState(false)
  const [tokenSearchTerm, setTokenSearchTerm] = useState("")
  const [tokenRolFilter, setTokenRolFilter] = useState("todos")

  // Cargar usuarios
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        setLoading(true)
        const data = await getUsuarios({ rol: rolFilter !== "todos" ? rolFilter : undefined, busqueda: searchTerm })
        setUsuarios(data)
      } catch (error) {
        console.error("Error al cargar usuarios:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUsuarios()
  }, [searchTerm, rolFilter, toast])

  // Cargar tokens
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setTokenLoading(true)
        const data = await getRegistroTokens({
          rol: tokenRolFilter !== "todos" ? tokenRolFilter : undefined,
          busqueda: tokenSearchTerm,
        })
        setTokens(data)
      } catch (error) {
        console.error("Error al cargar tokens:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los tokens de registro",
          variant: "destructive",
        })
      } finally {
        setTokenLoading(false)
      }
    }

    if (activeTab === "tokens") {
      fetchTokens()
    }
  }, [activeTab, tokenSearchTerm, tokenRolFilter, toast])

  // Manejar creación de token
  const handleCreateToken = async () => {
    if (!newToken.nombre || !newToken.apellidos) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos",
        variant: "destructive",
      })
      return
    }

    try {
      setCreatingToken(true)
      const createdToken = await createRegistroToken(newToken)

      setTokens([createdToken, ...tokens])
      setIsCreateTokenDialogOpen(false)

      toast({
        title: "Token creado",
        description: `Token ${createdToken.token} creado exitosamente`,
      })

      // Resetear el formulario
      setNewToken({
        nombre: "",
        apellidos: "",
        rol: "alumno",
      })
    } catch (error) {
      console.error("Error al crear token:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el token de registro",
        variant: "destructive",
      })
    } finally {
      setCreatingToken(false)
    }
  }

  // Manejar cambio de estado de usuario
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await toggleUsuarioActivo(userId, !currentStatus)

      // Actualizar la lista de usuarios
      setUsuarios(usuarios.map((user) => (user.id === userId ? { ...user, activo: !currentStatus } : user)))

      toast({
        title: "Estado actualizado",
        description: `Usuario ${currentStatus ? "desactivado" : "activado"} exitosamente`,
      })
    } catch (error) {
      console.error("Error al cambiar estado del usuario:", error)
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del usuario",
        variant: "destructive",
      })
    }
  }

  // Manejar eliminación de token
  const handleDeleteToken = async (tokenId) => {
    try {
      await deleteRegistroToken(tokenId)

      // Actualizar la lista de tokens
      setTokens(tokens.filter((token) => token.id !== tokenId))

      toast({
        title: "Token eliminado",
        description: "Token eliminado exitosamente",
      })
    } catch (error) {
      console.error("Error al eliminar token:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el token",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">Administra los usuarios del sistema y tokens de registro.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
          <TabsTrigger value="tokens">Tokens de Registro</TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-1 items-center space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar usuarios..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={rolFilter} onValueChange={setRolFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrar por rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los roles</SelectItem>
                      <SelectItem value="admin">Administradores</SelectItem>
                      <SelectItem value="profesor">Profesores</SelectItem>
                      <SelectItem value="alumno">Alumnos</SelectItem>
                      <SelectItem value="auxiliar">Auxiliares</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Dialog open={isCreateTokenDialogOpen} onOpenChange={setIsCreateTokenDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-600 to-blue-700">
                      <Plus className="mr-2 h-4 w-4" /> Crear Token
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Crear Token de Registro</DialogTitle>
                      <DialogDescription>
                        Crea un token para permitir el registro de un nuevo usuario.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="nombre">Nombre</Label>
                        <Input
                          id="nombre"
                          value={newToken.nombre}
                          onChange={(e) => setNewToken({ ...newToken, nombre: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="apellidos">Apellidos</Label>
                        <Input
                          id="apellidos"
                          value={newToken.apellidos}
                          onChange={(e) => setNewToken({ ...newToken, apellidos: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="rol">Rol</Label>
                        <Select
                          value={newToken.rol}
                          onValueChange={(value) => setNewToken({ ...newToken, rol: value })}
                        >
                          <SelectTrigger id="rol">
                            <SelectValue placeholder="Seleccionar rol" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="profesor">Profesor</SelectItem>
                            <SelectItem value="alumno">Alumno</SelectItem>
                            <SelectItem value="auxiliar">Auxiliar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateTokenDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateToken} disabled={creatingToken}>
                        {creatingToken ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...
                          </>
                        ) : (
                          "Crear Token"
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
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>DNI</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Registro</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex justify-center items-center">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            <span>Cargando usuarios...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : usuarios.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No se encontraron usuarios con los criterios de búsqueda.
                        </TableCell>
                      </TableRow>
                    ) : (
                      usuarios.map((usuario) => (
                        <TableRow key={usuario.id}>
                          <TableCell className="font-medium">
                            {usuario.nombre} {usuario.apellidos}
                          </TableCell>
                          <TableCell>{usuario.email}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                usuario.rol === "admin"
                                  ? "bg-purple-100 text-purple-800 border-purple-300"
                                  : usuario.rol === "profesor"
                                    ? "bg-blue-100 text-blue-800 border-blue-300"
                                    : usuario.rol === "alumno"
                                      ? "bg-green-100 text-green-800 border-green-300"
                                      : "bg-orange-100 text-orange-800 border-orange-300"
                              }
                            >
                              {usuario.rol === "admin"
                                ? "Administrador"
                                : usuario.rol === "profesor"
                                  ? "Profesor"
                                  : usuario.rol === "alumno"
                                    ? "Alumno"
                                    : "Auxiliar"}
                            </Badge>
                          </TableCell>
                          <TableCell>{usuario.dni || "-"}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                usuario.activo
                                  ? "bg-green-100 text-green-800 border-green-300"
                                  : "bg-red-100 text-red-800 border-red-300"
                              }
                            >
                              {usuario.activo ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {usuario.fecha_registro ? new Date(usuario.fecha_registro).toLocaleDateString() : "-"}
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
                                <DropdownMenuItem>
                                  <Key className="mr-2 h-4 w-4" /> Cambiar contraseña
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleToggleUserStatus(usuario.id, usuario.activo)}
                                  className={usuario.activo ? "text-red-600" : "text-green-600"}
                                >
                                  {usuario.activo ? (
                                    <>
                                      <UserX className="mr-2 h-4 w-4" /> Desactivar
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="mr-2 h-4 w-4" /> Activar
                                    </>
                                  )}
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

        <TabsContent value="tokens" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-1 items-center space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar tokens..."
                      className="pl-8"
                      value={tokenSearchTerm}
                      onChange={(e) => setTokenSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={tokenRolFilter} onValueChange={setTokenRolFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrar por rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los roles</SelectItem>
                      <SelectItem value="admin">Administradores</SelectItem>
                      <SelectItem value="profesor">Profesores</SelectItem>
                      <SelectItem value="alumno">Alumnos</SelectItem>
                      <SelectItem value="auxiliar">Auxiliares</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Dialog open={isCreateTokenDialogOpen} onOpenChange={setIsCreateTokenDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-600 to-blue-700">
                      <Plus className="mr-2 h-4 w-4" /> Crear Token
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Token</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha Creación</TableHead>
                      <TableHead>Fecha Uso</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tokenLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex justify-center items-center">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            <span>Cargando tokens...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : tokens.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No se encontraron tokens con los criterios de búsqueda.
                        </TableCell>
                      </TableRow>
                    ) : (
                      tokens.map((token) => (
                        <TableRow key={token.id}>
                          <TableCell className="font-medium">{token.token}</TableCell>
                          <TableCell>
                            {token.nombre} {token.apellidos}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                token.rol === "admin"
                                  ? "bg-purple-100 text-purple-800 border-purple-300"
                                  : token.rol === "profesor"
                                    ? "bg-blue-100 text-blue-800 border-blue-300"
                                    : token.rol === "alumno"
                                      ? "bg-green-100 text-green-800 border-green-300"
                                      : "bg-orange-100 text-orange-800 border-orange-300"
                              }
                            >
                              {token.rol === "admin"
                                ? "Administrador"
                                : token.rol === "profesor"
                                  ? "Profesor"
                                  : token.rol === "alumno"
                                    ? "Alumno"
                                    : "Auxiliar"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                token.usado
                                  ? "bg-gray-100 text-gray-800 border-gray-300"
                                  : "bg-green-100 text-green-800 border-green-300"
                              }
                            >
                              {token.usado ? "Usado" : "Disponible"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {token.fecha_creacion ? new Date(token.fecha_creacion).toLocaleDateString() : "-"}
                          </TableCell>
                          <TableCell>
                            {token.fecha_uso ? new Date(token.fecha_uso).toLocaleDateString() : "-"}
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
                                <DropdownMenuItem onClick={() => handleDeleteToken(token.id)} className="text-red-600">
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
    </div>
  )
}
