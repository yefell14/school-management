"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function RegistroPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [token, setToken] = useState("")
  const [tokenData, setTokenData] = useState<any>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [email, setEmail] = useState("")
  const [dni, setDni] = useState("")
  const [telefono, setTelefono] = useState("")
  const [direccion, setDireccion] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const verificarToken = async () => {
    setLoading(true)
    setError("")

    try {
      // Verificar si el token existe y no ha sido usado
      const { data, error } = await supabase
        .from("registro_tokens")
        .select("*")
        .eq("token", token)
        .eq("usado", false)
        .single()

      if (error || !data) {
        setError("Token inválido o ya utilizado")
        return
      }

      setTokenData(data)
      setStep(2)
    } catch (err: any) {
      setError(err.message || "Error al verificar el token")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    try {
      // Crear usuario en Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        throw new Error(`Error al crear la cuenta: ${authError.message}`)
      }

      // Crear usuario en la tabla usuarios
      const { data: userData, error: userError } = await supabase
        .from("usuarios")
        .insert([
          {
            nombre: tokenData.nombre,
            apellidos: tokenData.apellidos,
            email,
            contraseña: "encriptada", // La contraseña real se maneja con Auth
            rol: tokenData.rol,
            dni,
            telefono,
            direccion,
            activo: true,
          },
        ])
        .select()
        .single()

      if (userError) {
        throw new Error(`Error al crear el usuario: ${userError.message}`)
      }

      // Actualizar token como usado
      await supabase
        .from("registro_tokens")
        .update({
          usado: true,
          fecha_uso: new Date().toISOString(),
          usuario_asociado: userData.id,
        })
        .eq("id", tokenData.id)

      // Mostrar mensaje de éxito y redirigir
      setStep(3)
    } catch (err: any) {
      setError(err.message || "Error al registrar el usuario")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-blue-100">
      <Card className="w-full max-w-md border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-t-lg">
          <CardTitle className="text-2xl text-center">Registro de Usuario</CardTitle>
          <CardDescription className="text-white/80 text-center">
            {step === 1 && "Ingrese su token de registro"}
            {step === 2 && "Complete su información personal"}
            {step === 3 && "¡Registro exitoso!"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">Token de Registro</Label>
                <Input
                  id="token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  className="border-blue-200 focus:border-blue-500"
                />
              </div>
              <Button
                onClick={verificarToken}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                disabled={loading}
              >
                {loading ? "Verificando..." : "Verificar Token"}
              </Button>
            </div>
          )}

          {step === 2 && tokenData && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Alert className="mb-4 bg-yellow-50 border-yellow-200">
                <AlertDescription>
                  <p className="font-medium">¡Importante!</p>
                  <p>
                    Asegúrese de ingresar un correo electrónico válido, ya que será necesario para acceder al sistema.
                  </p>
                  <p>Los datos como nombre, apellidos y rol vienen predefinidos y no pueden ser modificados.</p>
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input id="nombre" value={tokenData.nombre} disabled className="bg-gray-100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellidos">Apellidos</Label>
                  <Input id="apellidos" value={tokenData.apellidos} disabled className="bg-gray-100" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rol">Rol</Label>
                <Input
                  id="rol"
                  value={
                    tokenData.rol === "admin"
                      ? "Administrador"
                      : tokenData.rol === "profesor"
                        ? "Profesor"
                        : tokenData.rol === "alumno"
                          ? "Alumno"
                          : "Auxiliar"
                  }
                  disabled
                  className="bg-gray-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-blue-200 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-blue-200 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="border-blue-200 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dni">DNI</Label>
                <Input
                  id="dni"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  required
                  className="border-blue-200 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="border-blue-200 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="border-blue-200 focus:border-blue-500"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                disabled={loading}
              >
                {loading ? "Registrando..." : "Completar Registro"}
              </Button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center space-y-4">
              <div className="bg-green-50 text-green-800 p-4 rounded-lg border border-green-200">
                <h3 className="font-bold text-lg mb-2">¡Registro Exitoso!</h3>
                <p>Su cuenta ha sido creada correctamente.</p>
                <p>Revise su correo electrónico para verificar su cuenta.</p>
              </div>
              <Button
                onClick={() => router.push("/login")}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                Ir a Iniciar Sesión
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-center text-sm">
            ¿Ya tiene una cuenta?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Iniciar Sesión
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
