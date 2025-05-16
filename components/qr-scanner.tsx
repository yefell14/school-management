"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Camera, CameraOff } from "lucide-react"

interface QrScannerProps {
  onScan: (decodedText: string) => void
  title?: string
  description?: string
}

export function QrScanner({
  onScan,
  title = "Escanear Código QR",
  description = "Apunta la cámara al código QR para escanearlo.",
}: QrScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [html5QrCode, setHtml5QrCode] = useState<Html5Qrcode | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cameraId, setCameraId] = useState<string | null>(null)
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Inicializar el escáner
    const qrCodeScanner = new Html5Qrcode("qr-reader")
    setHtml5QrCode(qrCodeScanner)

    // Obtener la lista de cámaras disponibles
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          setCameras(devices)
          setCameraId(devices[0].id)
        }
      })
      .catch((err) => {
        setError("Error al acceder a las cámaras: " + err)
      })

    // Limpiar al desmontar
    return () => {
      if (qrCodeScanner && qrCodeScanner.isScanning) {
        qrCodeScanner.stop().catch((err) => console.error("Error al detener el escáner:", err))
      }
    }
  }, [])

  const startScanning = async () => {
    if (!html5QrCode || !cameraId) return

    setLoading(true)
    setError(null)

    try {
      await html5QrCode.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Detener el escaneo después de un escaneo exitoso
          html5QrCode
            .stop()
            .then(() => {
              setScanning(false)
              onScan(decodedText)
            })
            .catch((err) => {
              console.error("Error al detener el escáner:", err)
            })
        },
        (errorMessage) => {
          // Ignorar errores durante el escaneo
        },
      )
      setScanning(true)
    } catch (err) {
      setError("Error al iniciar el escáner: " + err)
    } finally {
      setLoading(false)
    }
  }

  const stopScanning = () => {
    if (html5QrCode && html5QrCode.isScanning) {
      html5QrCode
        .stop()
        .then(() => {
          setScanning(false)
        })
        .catch((err) => {
          console.error("Error al detener el escáner:", err)
        })
    }
  }

  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCameraId(e.target.value)
    if (scanning && html5QrCode) {
      stopScanning()
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {cameras.length > 1 && (
          <div className="space-y-2">
            <label htmlFor="camera-select" className="text-sm font-medium">
              Seleccionar cámara
            </label>
            <select
              id="camera-select"
              value={cameraId || ""}
              onChange={handleCameraChange}
              className="w-full p-2 border rounded-md"
              disabled={scanning}
            >
              {cameras.map((camera) => (
                <option key={camera.id} value={camera.id}>
                  {camera.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div id="qr-reader" className="w-full h-64 overflow-hidden rounded-lg border"></div>

        <div className="flex justify-center">
          {!scanning ? (
            <Button onClick={startScanning} disabled={loading || !cameraId}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Iniciando...
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" /> Iniciar Escaneo
                </>
              )}
            </Button>
          ) : (
            <Button onClick={stopScanning} variant="destructive">
              <CameraOff className="mr-2 h-4 w-4" /> Detener Escaneo
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
