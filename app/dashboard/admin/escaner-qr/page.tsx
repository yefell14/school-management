"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QrScanner } from "@/components/dashboard/qr-scanner"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"

export default function EscanerQRPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("escanear")

  const handleQrScanned = async (data: string) => {
    try {
      // Verificamos si es un QR válido
      if (!data.includes("-")) {
        throw new Error("Código QR inválido")
      }

      const [tipo, id] = data.split("-")

      if (tipo === "usuario") {
        // Verificamos si el usuario existe
        const { data: usuario, error: userError } = await supabase
          .from("usuarios")
          .select("*")
          .eq("id", id)
          .single()

        if (userError || !usuario) {
          throw new Error("Usuario no encontrado")
        }

        // Registramos la asistencia
        const { error: asistenciaError } = await supabase
          .from("asistencias_general")
          .insert({
            usuario_id: usuario.id,
            rol: usuario.rol,
            fecha: new Date().toISOString().split("T")[0],
            estado: "presente",
            hora_entrada: new Date().toLocaleTimeString(),
            registrado_por: "admin" // Aquí deberías usar el ID del admin actual
          })

        if (asistenciaError) {
          if (asistenciaError.code === "23505") {
            throw new Error("Ya se ha registrado la asistencia para hoy")
          }
          throw asistenciaError
        }

        toast({
          title: "Asistencia registrada",
          description: `Se ha registrado la asistencia de ${usuario.nombre} ${usuario.apellidos}`,
        })
      } else {
        throw new Error("Tipo de QR no válido")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al procesar el código QR",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Escáner QR</h1>
        <p className="text-muted-foreground">
          Escanea códigos QR para registrar asistencia de usuarios.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="escanear">Escanear QR</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="escanear" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Escáner de Códigos QR</CardTitle>
              <CardDescription>
                Apunta la cámara al código QR del usuario para registrar su asistencia.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <QrScanner 
                onScanSuccess={handleQrScanned}
                onScanError={(error) => {
                  toast({
                    title: "Error",
                    description: error,
                    variant: "destructive",
                  })
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Asistencias</CardTitle>
              <CardDescription>
                Registro de asistencias registradas mediante QR
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Aquí irá el componente de historial */}
              <p className="text-muted-foreground">Próximamente...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
