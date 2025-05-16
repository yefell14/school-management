"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Mail, Calendar, BookOpen, QrCode, Lock, Save, ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function PerfilAlumno() {
  const router = useRouter()

  // Datos de ejemplo para el perfil
  const [perfil, setPerfil] = useState({
    nombre: "Juan",
    apellidos: "Pérez García",
    email: "juan.perez@estudiante.ma.edu",
    telefono: "123-456-7890",
    direccion: "Calle Principal 123, Ciudad",
    fechaNacimiento: "2005-05-15",
    grado: "Secundaria - 3°",
    seccion: "A",
    id: "ALU-2023-001",
    fechaIngreso: "2020-08-15",
  })

  const [contrasena, setContrasena] = useState({
    actual: "",
    nueva: "",
    confirmar: "",
  })

  const handlePerfilChange = (e) => {
    const { name, value } = e.target
    setPerfil((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleContrasenaChange = (e) => {
    const { name, value } = e.target
    setContrasena((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Regresar</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
            <p className="text-muted-foreground">Gestiona tu información personal y configuración</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="informacion" className="space-y-4">
        <TabsList>
          <TabsTrigger value="informacion">Información Personal</TabsTrigger>
          <TabsTrigger value="academica">Información Académica</TabsTrigger>
          <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
          <TabsTrigger value="qr">Mi Código QR</TabsTrigger>
        </TabsList>

        <TabsContent value="informacion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>Actualiza tu información de contacto y datos personales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                <div className="md:w-1/3 flex justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto flex items-center justify-center overflow-hidden">
                      <User className="h-16 w-16 text-gray-500" />
                    </div>
                    <Button variant="outline" size="sm" className="mt-4">
                      Cambiar Foto
                    </Button>
                  </div>
                </div>
                <div className="md:w-2/3 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre</Label>
                      <Input id="nombre" name="nombre" value={perfil.nombre} onChange={handlePerfilChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apellidos">Apellidos</Label>
                      <Input id="apellidos" name="apellidos" value={perfil.apellidos} onChange={handlePerfilChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={perfil.email}
                        onChange={handlePerfilChange}
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input id="telefono" name="telefono" value={perfil.telefono} onChange={handlePerfilChange} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="direccion">Dirección</Label>
                      <Textarea
                        id="direccion"
                        name="direccion"
                        value={perfil.direccion}
                        onChange={handlePerfilChange}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                      <Input
                        id="fechaNacimiento"
                        name="fechaNacimiento"
                        type="date"
                        value={perfil.fechaNacimiento}
                        onChange={handlePerfilChange}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Cambios
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academica" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información Académica</CardTitle>
              <CardDescription>Detalles de tu información académica</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Grado</p>
                        <p className="text-sm text-muted-foreground">{perfil.grado}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Sección</p>
                        <p className="text-sm text-muted-foreground">{perfil.seccion}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Fecha de Ingreso</p>
                        <p className="text-sm text-muted-foreground">{perfil.fechaIngreso}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Correo Institucional</p>
                        <p className="text-sm text-muted-foreground">{perfil.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">ID de Estudiante</p>
                        <p className="text-sm text-muted-foreground">{perfil.id}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4">Historial Académico</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">2022-2023</h4>
                        <span className="text-sm text-green-600 font-medium">Promedio: 8.7</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Secundaria - 2° A</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">2021-2022</h4>
                        <span className="text-sm text-green-600 font-medium">Promedio: 8.5</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Secundaria - 1° A</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">2020-2021</h4>
                        <span className="text-sm text-green-600 font-medium">Promedio: 8.9</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Primaria - 6° B</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguridad" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cambiar Contraseña</CardTitle>
              <CardDescription>Actualiza tu contraseña de acceso al sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="contrasenaActual">Contraseña Actual</Label>
                  <Input
                    id="contrasenaActual"
                    name="actual"
                    type="password"
                    value={contrasena.actual}
                    onChange={handleContrasenaChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contrasenaNueva">Nueva Contraseña</Label>
                  <Input
                    id="contrasenaNueva"
                    name="nueva"
                    type="password"
                    value={contrasena.nueva}
                    onChange={handleContrasenaChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contrasenaConfirmar">Confirmar Nueva Contraseña</Label>
                  <Input
                    id="contrasenaConfirmar"
                    name="confirmar"
                    type="password"
                    value={contrasena.confirmar}
                    onChange={handleContrasenaChange}
                  />
                </div>
                <div className="pt-2">
                  <Button>
                    <Lock className="mr-2 h-4 w-4" />
                    Cambiar Contraseña
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qr" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mi Código QR Personal</CardTitle>
              <CardDescription>Utiliza este código para registrar tu asistencia en clases</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="bg-white p-6 rounded-lg shadow-md border-2 border-blue-200 w-64 text-center mb-6">
                <h3 className="font-bold text-lg mb-2">{`${perfil.nombre} ${perfil.apellidos}`}</h3>
                <div className="bg-gray-200 w-48 h-48 mx-auto flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-40 h-40">
                    <path d="M30,30 L30,45 L45,45 L45,30 Z" fill="#000" />
                    <path d="M50,30 L50,45 L65,45 L65,30 Z" fill="#000" />
                    <path d="M70,30 L70,45 L85,45 L85,30 Z" fill="#000" />
                    <path d="M30,50 L30,65 L45,65 L45,50 Z" fill="#000" />
                    <path d="M50,50 L50,65 L65,65 L65,50 Z" fill="#000" />
                    <path d="M70,50 L70,65 L85,65 L85,50 Z" fill="#000" />
                    <path d="M30,70 L30,85 L45,85 L45,70 Z" fill="#000" />
                    <path d="M50,70 L50,85 L65,85 L65,70 Z" fill="#000" />
                    <path d="M70,70 L70,85 L85,85 L85,70 Z" fill="#000" />
                  </svg>
                </div>
                <p className="text-sm mt-2">ID: {perfil.id}</p>
                <p className="text-sm text-muted-foreground">{`${perfil.grado} - ${perfil.seccion}`}</p>
              </div>

              <div className="space-y-4 w-full max-w-md">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium flex items-center">
                    <QrCode className="h-4 w-4 mr-2 text-blue-700" />
                    Instrucciones de uso
                  </h4>
                  <ul className="mt-2 space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                        1
                      </span>
                      <span>Muestra este código QR al profesor al inicio de cada clase.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                        2
                      </span>
                      <span>El profesor escaneará el código con la aplicación de asistencia.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                        3
                      </span>
                      <span>Tu asistencia quedará registrada automáticamente en el sistema.</span>
                    </li>
                  </ul>
                </div>

                <Button className="w-full">Descargar Código QR</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
