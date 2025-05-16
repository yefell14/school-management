"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle2, XCircle, QrCode } from "lucide-react"

export default function EscanerQRPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("escanear")
  const [scanResult, setScanResult] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [cameraError, setCameraError] = useState(false)

  // Función para iniciar el escaneo
  const startScanning = async () => {
    setScanning(true)
    setCameraError(false)
    setScanResult(null)

    try {
      // Simulación de escaneo exitoso después de 3 segundos
      setTimeout(() => {
        const mockQrData = {
          success: true,
          message: "Código QR escaneado correctamente",
          data: {
            type: "attendance",
            curso_id: "123456",
            code: "ABC123",
          },
        }

        handleScanResult(mockQrData)
        setScanning(false)
      }, 3000)
    } catch (error) {
      console.error("Error al iniciar el escaneo:", error)
      setCameraError(true)
      setScanning(false)
      toast({
        title: "Error",
        description: "No se pudo acceder a la cámara. Por favor, verifica los permisos.",
        variant: "destructive",
      })
    }
  }

  // Función para manejar el resultado del escaneo
  const handleScanResult = async (result) => {
    setScanResult(result)

    if (result.success) {
      toast({
        title: "Éxito",
        description: result.message,
      })
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  // Función para reiniciar el escaneo
  const handleReset = () => {
    setScanResult(null)
    setCameraError(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Escáner QR</h1>
        <p className="text-muted-foreground">
          Escanea códigos QR para registrar asistencia y acceder a recursos del sistema.
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
                Apunta la cámara al código QR para escanearlo y procesar la información.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              {!scanResult && !cameraError ? (
                <div className="w-full max-w-md space-y-4">
                  <div className="bg-gray-100 rounded-lg p-4 aspect-square max-w-sm mx-auto flex items-center justify-center">
                    {scanning ? (
                      <div className="text-center">
                        <div className="animate-pulse flex flex-col items-center">
                          <QrCode className="h-16 w-16 text-blue-600 mb-4" />
                          <p>Escaneando...</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <QrCode className="h-16 w-16 text-gray-400 mb-4 mx-auto" />
                        <p className="text-muted-foreground">La vista previa de la cámara aparecerá aquí</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center">
                    <Button
                      onClick={startScanning}
                      disabled={scanning}
                      className="bg-gradient-to-r from-blue-600 to-blue-700"
                    >
                      {scanning ? "Escaneando..." : "Iniciar Escaneo"}
                    </Button>
                  </div>
                </div>
              ) : cameraError ? (
                <div className="w-full max-w-md space-y-4">
                  <Alert variant="destructive">
                    <XCircle className="h-5 w-5 mr-2" />
                    <AlertTitle>Error de cámara</AlertTitle>
                    <AlertDescription>
                      No se pudo acceder a la cámara. Por favor, verifica que has concedido los permisos necesarios.
                    </AlertDescription>
                  </Alert>
                  <div className="flex justify-center">
                    <Button onClick={handleReset}>Intentar de nuevo</Button>
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-md space-y-4">
                  <Alert variant={scanResult.success ? "default" : "destructive"}>
                    <div className="flex items-center">
                      {scanResult.success ? (
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                      ) : (
                        <XCircle className="h-5 w-5 mr-2" />
                      )}
                      <AlertTitle>{scanResult.success ? "Éxito" : "Error"}</AlertTitle>
                    </div>
                    <AlertDescription>{scanResult.message}</AlertDescription>
                  </Alert>

                  {scanResult.success && scanResult.data && (
                    <div className="p-4 border rounded-md bg-gray-50">
                      <h3 className="font-medium mb-2">Información del código:</h3>
                      <pre className="text-xs overflow-auto p-2 bg-white rounded border">
                        {JSON.stringify(scanResult.data, null, 2)}
                      </pre>
                    </div>
                  )}

                  <div className="flex justify-center">
                    <Button onClick={handleReset}>Escanear otro código</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Escaneos</CardTitle>
              <CardDescription>Registro de los últimos códigos QR escaneados.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                El historial de escaneos estará disponible próximamente.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
