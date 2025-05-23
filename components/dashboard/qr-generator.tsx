'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

interface QrGeneratorProps {
  onGenerateSuccess?: (qrCode: string) => void;
  onGenerateError?: (error: string) => void;
}

export function QrGenerator({ onGenerateSuccess, onGenerateError }: QrGeneratorProps) {
  const [qrValue, setQrValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQR = async () => {
    try {
      setIsGenerating(true);

      // Generar un código único para el QR
      const qrCode = `QR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Guardar el código QR en la base de datos
      const { error } = await supabase
        .from('qr_asistencias_curso')
        .insert({
          qr_codigo: qrCode,
          curso_id: qrValue, // Asumiendo que qrValue es el ID del curso
          fecha_creacion: new Date().toISOString(),
          fecha_expiracion: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Expira en 24 horas
          activo: true,
        });

      if (error) throw error;

      setQrValue(qrCode);
      toast({
        title: "Código QR generado",
        description: "El código QR se ha generado correctamente",
      });

      if (onGenerateSuccess) {
        onGenerateSuccess(qrCode);
      }
    } catch (error) {
      console.error('Error al generar el código QR:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al generar el código QR",
        variant: "destructive",
      });
      if (onGenerateError) {
        onGenerateError(error instanceof Error ? error.message : 'Error desconocido');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generar Código QR</CardTitle>
        <CardDescription>
          Genera un código QR para registrar asistencias
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="curso">ID del Curso</Label>
            <Input
              id="curso"
              placeholder="Ingresa el ID del curso"
              value={qrValue}
              onChange={(e) => setQrValue(e.target.value)}
            />
          </div>

          <div className="flex justify-center">
            <Button
              onClick={generateQR}
              disabled={!qrValue || isGenerating}
            >
              {isGenerating ? 'Generando...' : 'Generar QR'}
            </Button>
          </div>

          {qrValue && (
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white rounded-lg shadow">
                <QRCodeSVG
                  value={qrValue}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-sm text-gray-500">
                Este código QR expirará en 24 horas
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 