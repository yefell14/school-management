"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { QrCode, Search, UserX, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function AsistenciaPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTab, setSelectedTab] = useState("qr")
  const [selectedUserType, setSelectedUserType] = useState("alumno")
  const [selectedEstado, setSelectedEstado] = useState("presente")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [isRegistering, setIsRegistering] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Datos de ejemplo para usuarios
  const usuarios = [
    { id: 1, nombre: "Juan", apellidos: "Pérez García", dni: "12345678", rol: "alumno", grado: "3°", seccion: "A" },
    { id: 2, nombre: "María", apellidos: "López Rodríguez", dni: "23456789", rol: "alumno", grado: "3°", seccion: "A" },
    { id: 3, nombre: "Carlos", apellidos: "Gómez Sánchez", dni: "34567890", rol: "alumno", grado: "3°", seccion: "B" },
    { id: 4, nombre: "Ana", apellidos: "Martínez Flores", dni: "45678901", rol: "alumno", grado: "4°", seccion: "A" },
    {
      id: 5,
      nombre: "Pedro",
      apellidos: "Sánchez Torres",
      dni: "56789012",
      rol: "profesor",
      especialidad: "Matemáticas",
    },
    { id: 6, nombre: "Laura", apellidos: "Ramírez Vargas", dni: "67890123", rol: "profesor", especialidad: "Historia" },
  ]

  // Filtrar usuarios según el término de búsqueda y el tipo seleccionado
  const filteredUsers = usuarios.filter(
    (user) =>
      user.rol === selectedUserType &&
      (user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.dni.includes(searchTerm)),
  )

  // Función para manejar la selección de usuario
  const handleSelectUser = (user) => {
    setSelectedUser(user)
    setIsDialogOpen(true)
  }

  // Función para registrar asistencia
  const handleRegisterAttendance = () => {
    setIsRegistering(true)

    // Simulamos una petición a la API
    setTimeout(() => {
      setIsRegistering(false)
      setIsSuccess(true)

      // Cerramos el diálogo después de mostrar el éxito
      setTimeout(() => {
        setIsSuccess(false)
        setIsDialogOpen(false)
        setSelectedUser(null)
      }, 2000)
    }, 1500)
  }

  // Obtener las iniciales para el avatar
  const getInitials = (nombre, apellidos) => {
    return `${nombre.charAt(0)}${apellidos.charAt(0)}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Registro de Asistencia</h1>
        <p className="text-muted-foreground">Registra la asistencia diaria de alumnos y profesores</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="qr">Escaneo QR</TabsTrigger>
          <TabsTrigger value="manual">Registro Manual</TabsTrigger>
        </TabsList>

        <TabsContent value="qr" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Escanear Código QR</CardTitle>
              <CardDescription>Escanea el código QR del alumno o profesor para registrar su asistencia</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6">
              <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 w-full max-w-md flex flex-col items-center justify-center">
                <QrCode className="h-16 w-16 text-gray-400 mb-4" />
                <p className="text-center text-muted-foreground">
                  Posiciona el código QR frente a la cámara para escanear
                </p>
              </div>

              <div className="w-full max-w-md">
                <Button className="w-full">Activar Cámara</Button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 w-full">
                <h4 className="font-medium flex items-center text-blue-700">
                  <QrCode className="h-4 w-4 mr-2" />
                  Instrucciones
                </h4>
                <ul className="mt-2 space-y-2 text-sm text-blue-700">
                  <li className="flex items-start">
                    <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                      1
                    </span>
                    <span>Haz clic en "Activar Cámara" para iniciar el escaneo.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                      2
                    </span>
                    <span>Posiciona el código QR del alumno o profesor frente a la cámara.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                      3
                    </span>
                    <span>La asistencia se registrará automáticamente al detectar el código.</span>
                  </li>
                </ul>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registro Manual de Asistencia</CardTitle>
              <CardDescription>
                Busca y selecciona manualmente a los alumnos o profesores para registrar su asistencia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <RadioGroup
                    defaultValue="alumno"
                    className="flex space-x-4"
                    value={selectedUserType}
                    onValueChange={setSelectedUserType}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="alumno" id="alumno" />
                      <Label htmlFor="alumno">Alumnos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="profesor" id="profesor" />
                      <Label htmlFor="profesor">Profesores</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="relative flex-1">
                  <Input
                    placeholder="Buscar por nombre o DNI..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <Card className="border-gray-200">
                <CardHeader className="p-4">
                  <CardTitle className="text-base">Resultados de búsqueda</CardTitle>
                </CardHeader>
                <ScrollArea className="h-[300px]">
                  <CardContent className="p-0">
                    {filteredUsers.length > 0 ? (
                      <div className="divide-y">
                        {filteredUsers.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleSelectUser(user)}
                          >
                            <div className="flex items-center space-x-4">
                              <Avatar>
                                <AvatarFallback className="bg-blue-100 text-blue-700">
                                  {getInitials(user.nombre, user.apellidos)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {user.nombre} {user.apellidos}
                                </p>
                                <p className="text-sm text-muted-foreground">DNI: {user.dni}</p>
                                {user.rol === "alumno" ? (
                                  <p className="text-xs text-muted-foreground">
                                    {user.grado} {user.seccion}
                                  </p>
                                ) : (
                                  <p className="text-xs text-muted-foreground">{user.especialidad}</p>
                                )}
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              Seleccionar
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[200px] p-4">
                        <UserX className="h-12 w-12 text-gray-300 mb-2" />
                        <p className="text-muted-foreground text-center">
                          No se encontraron resultados para tu búsqueda
                        </p>
                      </div>
                    )}
                  </CardContent>
                </ScrollArea>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo para confirmar registro de asistencia */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Asistencia</DialogTitle>
            <DialogDescription>Confirma los datos y el estado de asistencia para el registro</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-lg">
                    {getInitials(selectedUser.nombre, selectedUser.apellidos)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-lg">
                    {selectedUser.nombre} {selectedUser.apellidos}
                  </p>
                  <p className="text-sm text-muted-foreground">DNI: {selectedUser.dni}</p>
                  {selectedUser.rol === "alumno" ? (
                    <div className="flex items-center mt-1">
                      <Badge variant="outline" className="mr-2">
                        {selectedUser.grado} {selectedUser.seccion}
                      </Badge>
                      <Badge>{selectedUser.rol}</Badge>
                    </div>
                  ) : (
                    <div className="flex items-center mt-1">
                      <Badge variant="outline" className="mr-2">
                        {selectedUser.especialidad}
                      </Badge>
                      <Badge>{selectedUser.rol}</Badge>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado de asistencia</Label>
                <Select value={selectedEstado} onValueChange={setSelectedEstado}>
                  <SelectTrigger id="estado">
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="presente">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Presente
                      </div>
                    </SelectItem>
                    <SelectItem value="tardanza">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-yellow-500 mr-2" /> Tardanza
                      </div>
                    </SelectItem>
                    <SelectItem value="ausente">
                      <div className="flex items-center">
                        <XCircle className="h-4 w-4 text-red-500 mr-2" /> Ausente
                      </div>
                    </SelectItem>
                    <SelectItem value="justificado">
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 text-blue-500 mr-2" /> Justificado
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacion">Observación (opcional)</Label>
                <Input id="observacion" placeholder="Ingresa una observación si es necesario" />
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isRegistering || isSuccess}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleRegisterAttendance}
              disabled={isRegistering || isSuccess}
              className={isSuccess ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {isRegistering ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Registrando...
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" /> Registrado con éxito
                </>
              ) : (
                "Registrar Asistencia"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
