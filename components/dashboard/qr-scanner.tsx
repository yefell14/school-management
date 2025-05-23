'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

interface QrScannerProps {
  onScanSuccess?: (result: string) => void;
  onScanError?: (error: string) => void;
}

export function QrScanner({ onScanSuccess, onScanError }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  const startScanner = async () => {
    try {
      if (!containerRef.current) return;

      // Verificar permisos de cámara
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());

      scannerRef.current = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      scannerRef.current.render(
        async (decodedText) => {
          try {
            // Verificar si el código QR es válido
            const { data: qrData, error: qrError } = await supabase
              .from('qr_asistencias_curso')
              .select('*')
              .eq('qr_codigo', decodedText)
              .eq('activo', true)
              .single();

            if (qrError || !qrData) {
              toast({
                title: "Código QR inválido",
                description: "El código QR escaneado no es válido o ha expirado",
                variant: "destructive",
              });
              return;
            }

            // Registrar la asistencia
            const { error: asistenciaError } = await supabase
              .from('asistencias')
              .insert({
                estudiante_id: qrData.estudiante_id,
                grupo_id: qrData.grupo_id,
                fecha: new Date().toISOString(),
                estado: 'presente',
              });

            if (asistenciaError) {
              throw asistenciaError;
            }

            toast({
              title: "Asistencia registrada",
              description: "La asistencia se ha registrado correctamente",
            });

            if (onScanSuccess) {
              onScanSuccess(decodedText);
            }

            // Detener el escáner después de un escaneo exitoso
            if (scannerRef.current) {
              scannerRef.current.clear();
              setIsScanning(false);
            }
          } catch (error) {
            console.error('Error al procesar el código QR:', error);
            toast({
              title: "Error",
              description: "Ocurrió un error al procesar el código QR",
              variant: "destructive",
            });
            if (onScanError) {
              onScanError(error instanceof Error ? error.message : 'Error desconocido');
            }
          }
        },
        (errorMessage) => {
          // Ignorar errores de escaneo menores
          console.log('Error de escaneo:', errorMessage);
        }
      );

      setIsScanning(true);
    } catch (error) {
      console.error('Error al iniciar el escáner:', error);
      toast({
        title: "Error",
        description: "No se pudo acceder a la cámara",
        variant: "destructive",
      });
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      setIsScanning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Escanear Código QR</CardTitle>
        <CardDescription>
          Escanea el código QR del estudiante para registrar su asistencia
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div ref={containerRef} id="qr-reader" className="w-full max-w-md mx-auto" />
          <div className="flex justify-center gap-4">
            {!isScanning ? (
              <Button onClick={startScanner}>
                Iniciar Escáner
              </Button>
            ) : (
              <Button variant="destructive" onClick={stopScanner}>
                Detener Escáner
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 