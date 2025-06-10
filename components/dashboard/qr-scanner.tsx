'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Camera, CameraOff } from "lucide-react";

interface QrScannerProps {
  onScanSuccess?: (result: string) => void;
  onScanError?: (error: string) => void;
}

export function QrScanner({ onScanSuccess, onScanError }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const qrCodeRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (qrCodeRef.current) {
        qrCodeRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanner = async () => {
    try {
      if (!containerRef.current) return;

      setCameraError(null);

      // Crear una nueva instancia de Html5Qrcode
      qrCodeRef.current = new Html5Qrcode("qr-reader");

      // Intentar obtener acceso a la cámara
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length) {
        // Usar la cámara trasera si está disponible
        const cameraId = devices.find(device => device.label.toLowerCase().includes('back'))?.id || devices[0].id;

        await qrCodeRef.current.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            handleQrCodeSuccess(decodedText);
          },
          (errorMessage) => {
            // Ignorar errores de escaneo menores
            console.log('Error de escaneo:', errorMessage);
          }
        );

        setIsScanning(true);
      } else {
        throw new Error("No se encontró ninguna cámara en el dispositivo");
      }
    } catch (error: any) {
      console.error('Error al iniciar el escáner:', error);
      setCameraError(error.message || "Error al acceder a la cámara");
      toast({
        title: "Error de cámara",
        description: error.message || "Error al acceder a la cámara",
        variant: "destructive",
      });
    }
  };

  const handleQrCodeSuccess = async (decodedText: string) => {
    try {
      // Verificar formato del QR (usuario-id)
      const [tipo, id] = decodedText.split("-");
      
      if (!tipo || !id) {
        throw new Error("Formato de QR inválido");
      }

      if (tipo !== "usuario") {
        throw new Error("Tipo de QR no válido");
      }

      // Verificar que el usuario existe
      const { data: userData, error: userError } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", id)
        .single();
      
      if (userError || !userData) {
        throw new Error("Usuario no encontrado");
      }

      if (onScanSuccess) {
        onScanSuccess(decodedText);
      }

      // Detener el escáner después de un escaneo exitoso
      if (qrCodeRef.current) {
        await qrCodeRef.current.stop();
        setIsScanning(false);
      }
    } catch (error) {
      console.error('Error al procesar el código QR:', error);
      if (onScanError) {
        onScanError(error instanceof Error ? error.message : 'Error desconocido');
      }
    }
  };

  const stopScanner = async () => {
    if (qrCodeRef.current) {
      try {
        await qrCodeRef.current.stop();
        setIsScanning(false);
      } catch (error) {
        console.error('Error al detener el escáner:', error);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Escanear Código QR</CardTitle>
        <CardDescription>
          Escanea el código QR del usuario para registrar su asistencia
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {cameraError ? (
            <Alert variant="destructive">
              <CameraOff className="h-4 w-4" />
              <AlertTitle>Error de cámara</AlertTitle>
              <AlertDescription>{cameraError}</AlertDescription>
            </Alert>
          ) : (
            <div ref={containerRef} id="qr-reader" className="w-full max-w-md mx-auto" />
          )}
          <div className="flex justify-center gap-4">
            {!isScanning ? (
              <Button onClick={startScanner} className="gap-2">
                <Camera className="h-4 w-4" />
                Iniciar Escáner
              </Button>
            ) : (
              <Button variant="destructive" onClick={stopScanner} className="gap-2">
                <CameraOff className="h-4 w-4" />
                Detener Escáner
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 