import { supabase } from './supabase';

interface QRData {
  tipo: 'usuario' | 'curso';
  id: string;
  timestamp: number;
  expiracion?: number;
}

export function convertQRtoJPG(canvas: HTMLCanvasElement): string {
  try {
    console.log('Iniciando conversión de QR a PNG');
    console.log('Canvas recibido:', canvas);
    
    // Crear un nuevo canvas con fondo blanco
    const newCanvas = document.createElement('canvas');
    const ctx = newCanvas.getContext('2d');
    if (!ctx) {
      console.error('No se pudo obtener el contexto 2D del canvas');
      return '';
    }

    // Establecer dimensiones
    const padding = 20;
    newCanvas.width = canvas.width + (padding * 2);
    newCanvas.height = canvas.height + (padding * 2);
    console.log('Dimensiones del nuevo canvas:', { width: newCanvas.width, height: newCanvas.height });

    // Dibujar fondo blanco
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);

    // Dibujar el QR en el centro
    try {
      ctx.drawImage(canvas, padding, padding);
      console.log('QR dibujado exitosamente en el nuevo canvas');
    } catch (drawError) {
      console.error('Error al dibujar el QR en el canvas:', drawError);
      throw drawError;
    }

    // Convertir a PNG con alta calidad
    try {
      const dataUrl = newCanvas.toDataURL('image/png', 1.0);
      console.log('Conversión a PNG exitosa');
      return dataUrl;
    } catch (convertError) {
      console.error('Error al convertir a PNG:', convertError);
      throw convertError;
    }
  } catch (error) {
    console.error('Error general en la conversión del QR:', error);
    throw error;
  }
}

export async function generateQRCode(cursoId: string, grupoId: string): Promise<string> {
  try {
    // Generar timestamp actual y de expiración (24 horas)
    const timestamp = Date.now();
    const expiracion = timestamp + (24 * 60 * 60 * 1000);

    // Crear objeto con datos del QR
    const qrData: QRData = {
      tipo: 'curso',
      id: cursoId,
      timestamp,
      expiracion
    };

    // Convertir a string
    const qrString = `curso-${cursoId}`;

    // Guardar en la base de datos
    const { error } = await supabase
      .from('qr_asistencias_curso')
      .insert({
        curso_id: cursoId,
        qr_codigo: qrString,
        fecha_creacion: new Date(timestamp).toISOString(),
        fecha_expiracion: new Date(expiracion).toISOString(),
        activo: true
      });

    if (error) throw error;

    return qrString;
  } catch (error) {
    console.error('Error generando QR:', error);
    throw new Error('No se pudo generar el código QR');
  }
}

export async function validateQRCode(qrString: string): Promise<QRData> {
  try {
    // Validar formato básico (tipo-id)
    const [tipo, id] = qrString.split('-');
    
    if (!tipo || !id) {
      throw new Error('Formato de QR inválido');
    }

    if (tipo !== 'usuario' && tipo !== 'curso') {
      throw new Error('Tipo de QR no válido');
    }

    // Verificar que el usuario/curso existe
    if (tipo === 'usuario') {
      const { data: userData, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error || !userData) {
        throw new Error('Usuario no encontrado');
      }
    } else if (tipo === 'curso') {
      const { data: cursoData, error } = await supabase
        .from('cursos')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error || !cursoData) {
        throw new Error('Curso no encontrado');
      }
    }

    return {
      tipo,
      id,
      timestamp: Date.now()
    };
  } catch (error: any) {
    throw new Error(error.message || 'Error al validar el código QR');
  }
}

export async function registerAttendance(
  userId: string,
  qrData: QRData,
  tipo: 'alumno' | 'profesor'
): Promise<void> {
  try {
    const timestamp = new Date().toISOString();

    // Si es un QR de curso, registrar asistencia al curso
    if (qrData.tipo === 'curso') {
      const { error } = await supabase
        .from('asistencias')
        .insert({
          estudiante_id: userId,
          curso_id: qrData.id,
          fecha: timestamp,
          estado: 'presente',
          tipo_asistencia: tipo
        });

      if (error) {
        if (error.code === '23505') { // Error de duplicado
          throw new Error('Ya se ha registrado la asistencia para esta clase');
        }
        throw error;
      }
    }
    // Si es un QR de usuario, verificar que coincida con el usuario que está registrando
    else if (qrData.tipo === 'usuario') {
      if (userId !== qrData.id) {
        throw new Error('El código QR no corresponde al usuario actual');
      }
      // Aquí podrías implementar otra lógica si es necesario
    }
  } catch (error: any) {
    throw new Error(error.message || 'Error al registrar la asistencia');
  }
} 