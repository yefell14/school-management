'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Camera, CameraOff } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface QrScannerProps {
  onScanSuccess?: (result: string) => void;
  onScanError?: (error: string) => void;
}

export function QrScanner({ onScanSuccess, onScanError }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const qrCodeRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const lastScannedRef = useRef<string>('');

  // Función para formatear la hora en formato HH:mm:ss
  const formatTime = (date: Date): string => {
    return date.toTimeString().split(' ')[0];
  };

  useEffect(() => {
    return () => {
      if (qrCodeRef.current) {
        qrCodeRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        throw new Error("Por favor, permite el acceso a la cámara en tu navegador");
      }
      throw error;
    }
  };

  const startScanner = async () => {
    try {
      if (!containerRef.current) return;

      setCameraError(null);
      setIsProcessing(false);
      lastScannedRef.current = '';

      // Solicitar permisos de cámara primero
      await requestCameraPermission();

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
            aspectRatio: 1.0,
            disableFlip: false
          },
          async (decodedText) => {
            // Evitar procesar el mismo QR múltiples veces
            if (decodedText === lastScannedRef.current) {
              return;
            }
            lastScannedRef.current = decodedText;

            // Detener el escaneo mientras procesamos
            if (qrCodeRef.current) {
              await qrCodeRef.current.stop();
            }
            await handleQrCodeSuccess(decodedText);
            // Reiniciar el escaneo después de procesar
            if (isScanning) {
              startScanner();
            }
          },
          (errorMessage) => {
            // Ignorar errores de escaneo menores
            if (!errorMessage.includes("No barcode or QR code detected")) {
              console.log('Error de escaneo:', errorMessage);
            }
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
    if (isProcessing) return; // Evitar procesamiento múltiple
    setIsProcessing(true);

    try {
      console.log('QR detectado:', decodedText); // Debug

      // Verificar formato del QR (usuario-id)
      const [tipo, id] = decodedText.split("-");
      
      if (!tipo || !id) {
        throw new Error("Formato de QR inválido");
      }

      if (tipo !== "usuario") {
        throw new Error("Tipo de QR no válido");
      }

      console.log('Buscando usuario:', decodedText); // Debug

      // Verificar que el usuario existe usando el ID completo
      const { data: usuario, error: userError } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", decodedText.replace("usuario-", ""))
        .single();
      
      if (userError || !usuario) {
        throw new Error("Usuario no encontrado");
      }

      console.log('Usuario encontrado:', usuario); // Debug

      // Verificar si el rol del usuario está permitido para asistencia
      if (usuario.rol !== 'alumno' && usuario.rol !== 'profesor') {
        throw new Error(`El rol ${usuario.rol} no está permitido para registrar asistencia`);
      }

      // Verificar si ya existe una asistencia para hoy
      const fechaHoy = new Date().toISOString().split("T")[0];
      const { data: asistenciaExistente, error: checkError } = await supabase
        .from("asistencias_general")
        .select("*")
        .eq("usuario_id", usuario.id)
        .eq("fecha", fechaHoy)
        .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      const currentTime = formatTime(new Date());

      if (asistenciaExistente) {
        // Actualizar la hora de salida
        const { error: updateError } = await supabase
          .from("asistencias_general")
          .update({
            hora_salida: currentTime,
          })
          .eq("id", asistenciaExistente.id);

        if (updateError) {
          throw updateError;
        }

        toast({
          title: "Salida registrada",
          description: `Se ha registrado la salida de ${usuario.nombre} ${usuario.apellidos}`,
        });
      } else {
        // Registrar nueva asistencia
        const { error: insertError } = await supabase
          .from("asistencias_general")
          .insert({
            usuario_id: usuario.id,
            rol: usuario.rol,
            fecha: fechaHoy,
            estado: "presente",
            hora_entrada: currentTime,
            registrado_por: user?.id
          });

        if (insertError) {
          throw insertError;
        }

        toast({
          title: "Asistencia registrada",
          description: `Se ha registrado la asistencia de ${usuario.nombre} ${usuario.apellidos}`,
        });
      }

      if (onScanSuccess) {
        onScanSuccess(decodedText);
      }

    } catch (error: any) {
      console.error('Error al procesar el código QR:', error);
      if (onScanError) {
        onScanError(error instanceof Error ? error.message : 'Error desconocido');
      }
      toast({
        title: "Error",
        description: error.message || "Error al procesar el código QR",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const stopScanner = async () => {
    if (qrCodeRef.current) {
      try {
        await qrCodeRef.current.stop();
        setIsScanning(false);
        setIsProcessing(false);
        lastScannedRef.current = '';
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
              <Button onClick={startScanner} className="gap-2" disabled={isProcessing}>
                <Camera className="h-4 w-4" />
                {isProcessing ? "Procesando..." : "Iniciar Escáner"}
              </Button>
            ) : (
              <Button variant="destructive" onClick={stopScanner} className="gap-2" disabled={isProcessing}>
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