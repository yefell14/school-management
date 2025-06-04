'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QRCodeSVG } from 'qrcode.react';
import { generateQRCode } from '@/lib/qr-utils';
import { toast } from '@/components/ui/use-toast';

interface QrGeneratorProps {
  onGenerateSuccess?: (qrCode: string) => void;
  onGenerateError?: (error: string) => void;
}

export function QrGenerator({ onGenerateSuccess, onGenerateError }: QrGeneratorProps) {
  const [cursoId, setCursoId] = useState('');
  const [grupoId, setGrupoId] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQR = async () => {
    if (!cursoId || !grupoId) {
      toast({
        title: "Error",
        description: "Por favor ingresa el ID del curso y del grupo",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const qrString = await generateQRCode(cursoId, grupoId);
      setQrCode(qrString);
      
      toast({
        title: "QR Generado",
        description: "El código QR se ha generado correctamente",
      });

      if (onGenerateSuccess) {
        onGenerateSuccess(qrString);
      }
    } catch (error: any) {
      console.error('Error generando QR:', error);
      toast({
        title: "Error",
        description: error.message || "Error al generar el código QR",
        variant: "destructive",
      });
      
      if (onGenerateError) {
        onGenerateError(error.message);
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
              value={cursoId}
              onChange={(e) => setCursoId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="grupo">ID del Grupo</Label>
            <Input
              id="grupo"
              placeholder="Ingresa el ID del grupo"
              value={grupoId}
              onChange={(e) => setGrupoId(e.target.value)}
            />
          </div>

          <div className="flex justify-center">
            <Button
              onClick={generateQR}
              disabled={!cursoId || !grupoId || isGenerating}
            >
              {isGenerating ? 'Generando...' : 'Generar QR'}
            </Button>
          </div>

          {qrCode && (
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white rounded-lg shadow">
                <QRCodeSVG
                  value={qrCode}
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