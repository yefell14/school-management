"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Camera, CameraOff } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"

interface QrScannerProps {
  onScan?: (decodedText: string) => void
  title?: string
  description?: string
  tipo?: 'alumno' | 'profesor'
}

export default function QrScanner({ onScan, title, description, tipo }: QrScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [html5QrCode, setHtml5QrCode] = useState<Html5Qrcode | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    // Inicializar el escáner
    const qrCode = new Html5Qrcode("reader")
    setHtml5QrCode(qrCode)

    return () => {
      if (qrCode) {
        qrCode.stop().catch(console.error)
      }
    }
  }, [])

  const startScanning = async () => {
    if (!html5QrCode) return

    setScanning(true)
    setError(null)

    try {
      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          // Detener el escaneo después de una lectura exitosa
          await html5QrCode.stop()
          setScanning(false)

          try {
            // Validar el formato del QR (usuario-id o curso-id)
            const [tipo, id] = decodedText.split("-")
            
            if (!tipo || !id) {
              throw new Error("Formato de QR inválido")
            }

            // Verificar que el usuario/curso existe
            let data
            if (tipo === "usuario") {
              const { data: userData, error } = await supabase
                .from("usuarios")
                .select("*")
                .eq("id", id)
                .single()
              
              if (error || !userData) {
                throw new Error("Usuario no encontrado")
              }
              data = userData
            } else if (tipo === "curso") {
              const { data: cursoData, error } = await supabase
                .from("cursos")
                .select("*")
                .eq("id", id)
                .single()
              
              if (error || !cursoData) {
                throw new Error("Curso no encontrado")
              }
              data = cursoData
            } else {
              throw new Error("Tipo de QR no válido")
            }

            // Si todo está bien, llamar al callback
            if (onScan) {
              onScan(decodedText)
            }

          } catch (error: any) {
            setError(error.message || "Error al procesar el código QR")
            toast({
              variant: "destructive",
              title: "Error",
              description: error.message || "Error al procesar el código QR"
            })
          }
        },
        (errorMessage) => {
          console.error(errorMessage)
        }
      )
    } catch (err: any) {
      setError(err.message || "Error al iniciar el escáner")
      setScanning(false)
    }
  }

  const stopScanning = async () => {
    if (html5QrCode && scanning) {
      await html5QrCode.stop()
      setScanning(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div id="reader" className="w-full"></div>
      
      <div className="mt-4 space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-center">
          {!scanning ? (
            <Button onClick={startScanning}>
              <Camera className="h-4 w-4 mr-2" />
              Iniciar Escaneo
            </Button>
          ) : (
            <Button variant="secondary" onClick={stopScanning}>
              <CameraOff className="h-4 w-4 mr-2" />
              Detener Escaneo
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
