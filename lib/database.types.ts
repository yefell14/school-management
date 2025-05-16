export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string
          nombre: string
          apellidos: string
          email: string
          rol: 'admin' | 'profesor' | 'alumno' | 'auxiliar'
          dni: string | null
          telefono: string | null
          direccion: string | null
          fecha_registro: string
          ultimo_acceso: string | null
          especialidad: string | null
          grado: string | null
          seccion: string | null
          activo: boolean
        }
        Insert: {
          id?: string
          nombre: string
          apellidos: string
          email: string
          rol: 'admin' | 'profesor' | 'alumno' | 'auxiliar'
          dni?: string | null
          telefono?: string | null
          direccion?: string | null
          fecha_registro?: string
          ultimo_acceso?: string | null
          especialidad?: string | null
          grado?: string | null
          seccion?: string | null
          activo?: boolean
        }
        Update: {
          id?: string
          nombre?: string
          apellidos?: string
          email?: string
          rol?: 'admin' | 'profesor' | 'alumno' | 'auxiliar'
          dni?: string | null
          telefono?: string | null
          direccion?: string | null
          fecha_registro?: string
          ultimo_acceso?: string | null
          especialidad?: string | null
          grado?: string | null
          seccion?: string | null
          activo?: boolean
        }
      }
      // Add other tables as needed
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 