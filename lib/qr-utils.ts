import { supabase } from './supabase';

interface QRData {
  curso_id: string;
  grupo_id: string;
  timestamp: number;
  expiracion: number;
}

export async function generateQRCode(cursoId: string, grupoId: string): Promise<string> {
  try {
    // Generar timestamp actual y de expiración (24 horas)
    const timestamp = Date.now();
    const expiracion = timestamp + (24 * 60 * 60 * 1000);

    // Crear objeto con datos del QR
    const qrData: QRData = {
      curso_id: cursoId,
      grupo_id: grupoId,
      timestamp,
      expiracion
    };

    // Convertir a string y codificar en base64
    const qrString = btoa(JSON.stringify(qrData));

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
    // Decodificar el string base64
    const decodedData = JSON.parse(atob(qrString)) as QRData;

    // Verificar que el QR existe en la base de datos y está activo
    const { data, error } = await supabase
      .from('qr_asistencias_curso')
      .select('*')
      .eq('qr_codigo', qrString)
      .eq('activo', true)
      .single();

    if (error || !data) {
      throw new Error('Código QR inválido o expirado');
    }

    // Verificar que no haya expirado
    if (Date.now() > decodedData.expiracion) {
      // Marcar como inactivo en la base de datos
      await supabase
        .from('qr_asistencias_curso')
        .update({ activo: false })
        .eq('qr_codigo', qrString);

      throw new Error('El código QR ha expirado');
    }

    return decodedData;
  } catch (error) {
    console.error('Error validando QR:', error);
    throw error;
  }
}

export async function registerAttendance(
  userId: string,
  qrData: QRData,
  tipo: 'alumno' | 'profesor'
): Promise<void> {
  try {
    const fechaHoy = new Date().toISOString().split('T')[0];
    
    // Verificar si ya existe una asistencia para hoy
    const { data: asistenciaExistente } = await supabase
      .from('asistencias_general')
      .select('*')
      .eq('usuario_id', userId)
      .eq('fecha', fechaHoy)
      .maybeSingle();

    if (asistenciaExistente) {
      // Actualizar hora de salida
      await supabase
        .from('asistencias_general')
        .update({
          hora_salida: new Date().toLocaleTimeString(),
        })
        .eq('id', asistenciaExistente.id);
    } else {
      // Registrar nueva asistencia
      await supabase.from('asistencias_general').insert({
        usuario_id: userId,
        rol: tipo,
        grupo_id: qrData.grupo_id,
        fecha: fechaHoy,
        estado: 'presente',
        hora_entrada: new Date().toLocaleTimeString(),
      });
    }
  } catch (error) {
    console.error('Error registrando asistencia:', error);
    throw new Error('No se pudo registrar la asistencia');
  }
} 