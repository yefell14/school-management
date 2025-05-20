import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://gvxazxeepqaxmcpbwlca.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2eGF6eGVlcHFheG1jcGJ3bGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNzk1NzcsImV4cCI6MjA2Mjc1NTU3N30._E2gc685mu8dxgdanBjmy3VAknQObSAjlIxlsNsBVlA"

export const supabase = createClient(supabaseUrl, supabaseKey)

// Tipos de datos basados en el esquema de la base de datos
export type Usuario = {
  id: string
  nombre: string
  apellidos: string
  email: string
  contraseña: string
  rol: "admin" | "profesor" | "alumno" | "auxiliar"
  dni?: string
  telefono?: string
  direccion?: string
  fecha_registro: string
  ultimo_acceso?: string
  especialidad?: string
  grado?: string
  seccion?: string
  activo: boolean
}

export type Grado = {
  id: string
  nombre: string
  nivel: "inicial" | "primaria" | "secundaria"
  descripcion?: string
}

export type Seccion = {
  id: string
  nombre: string
  descripcion?: string
}

export type Curso = {
  id: string
  nombre: string
  descripcion?: string
  nivel?: "inicial" | "primaria" | "secundaria"
  activo: boolean
}

export type Grupo = {
  id: string
  curso_id: string
  grado_id: string
  seccion_id: string
  año_escolar: string
  activo: boolean
  curso?: Curso
  grado?: Grado
  seccion?: Seccion
  profesor?: Usuario
  grupo_profesor?: {
    profesor: Usuario
  }
}

export type RegistroToken = {
  id: string
  token: string
  nombre: string
  apellidos: string
  rol: "admin" | "profesor" | "alumno" | "auxiliar"
  creado_por?: string
  usado: boolean
  fecha_creacion: string
  fecha_uso?: string
  usuario_asociado?: string
}

export type Horario = {
  id: number
  grupo_id: string
  dia: string
  hora_inicio: string
  hora_fin: string
  aula?: string
}

export type GrupoAlumno = {
  id: number
  grupo_id: string
  alumno_id: string
  fecha_asignacion: string
  alumno?: Usuario
}

export type Asistencia = {
  id: number
  estudiante_id: string
  grupo_id: string
  fecha: string
  estado: "presente" | "ausente" | "tardanza" | "justificado"
  observaciones?: string
  grupo?: {
    curso: {
      nombre: string
    }
  }
}
