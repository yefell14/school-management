import { supabase } from './supabase';

interface QRData {
  tipo: 'usuario' | 'curso';
  id: string;
  timestamp: number;
  expiracion?: number;
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