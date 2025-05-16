import { supabase } from "./supabase"
import type { Usuario, Grado, Seccion, Curso, Grupo, RegistroToken, Horario } from "./supabase"

// Usuarios
export async function getUsuarios(filtro?: { rol?: string; activo?: boolean; busqueda?: string }) {
  let query = supabase.from("usuarios").select("*")

  if (filtro?.rol && filtro.rol !== "todos") {
    query = query.eq("rol", filtro.rol)
  }

  if (filtro?.activo !== undefined) {
    query = query.eq("activo", filtro.activo)
  }

  if (filtro?.busqueda) {
    query = query.or(
      `nombre.ilike.%${filtro.busqueda}%,apellidos.ilike.%${filtro.busqueda}%,email.ilike.%${filtro.busqueda}%,dni.ilike.%${filtro.busqueda}%`,
    )
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching usuarios:", error)
    throw error
  }

  return data || []
}

export async function getUsuario(id: string) {
  const { data, error } = await supabase.from("usuarios").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching usuario:", error)
    throw error
  }

  return data
}

export async function createUsuario(usuario: Omit<Usuario, "id" | "fecha_registro">) {
  const { data, error } = await supabase.from("usuarios").insert([usuario]).select()

  if (error) {
    console.error("Error creating usuario:", error)
    throw error
  }

  return data[0]
}

export async function updateUsuario(id: string, usuario: Partial<Usuario>) {
  const { data, error } = await supabase.from("usuarios").update(usuario).eq("id", id).select()

  if (error) {
    console.error("Error updating usuario:", error)
    throw error
  }

  return data[0]
}

export async function toggleUsuarioActivo(id: string, activo: boolean) {
  return updateUsuario(id, { activo })
}

// Tokens de registro
export async function getRegistroTokens(filtro?: { usado?: boolean; rol?: string; busqueda?: string }) {
  let query = supabase.from("registro_tokens").select("*")

  if (filtro?.usado !== undefined) {
    query = query.eq("usado", filtro.usado)
  }

  if (filtro?.rol && filtro.rol !== "todos") {
    query = query.eq("rol", filtro.rol)
  }

  if (filtro?.busqueda) {
    query = query.or(
      `nombre.ilike.%${filtro.busqueda}%,apellidos.ilike.%${filtro.busqueda}%,token.ilike.%${filtro.busqueda}%`,
    )
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching registro_tokens:", error)
    throw error
  }

  return data || []
}

export async function createRegistroToken(token: Omit<RegistroToken, "id" | "fecha_creacion" | "usado" | "token">) {
  // Generar un token aleatorio
  const randomToken = Math.random().toString(36).substring(2, 10).toUpperCase()

  const { data, error } = await supabase
    .from("registro_tokens")
    .insert([
      {
        ...token,
        usado: false,
        token: randomToken,
      },
    ])
    .select()

  if (error) {
    console.error("Error creating registro_token:", error)
    throw error
  }

  return data[0]
}

export async function deleteRegistroToken(id: string) {
  const { error } = await supabase.from("registro_tokens").delete().eq("id", id)

  if (error) {
    console.error("Error deleting registro_token:", error)
    throw error
  }
}

// Grados
export async function getGrados(filtro?: { nivel?: string; busqueda?: string }) {
  let query = supabase.from("grados").select("*")

  if (filtro?.nivel && filtro.nivel !== "todos") {
    query = query.eq("nivel", filtro.nivel)
  }

  if (filtro?.busqueda) {
    query = query.ilike("nombre", `%${filtro.busqueda}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching grados:", error)
    throw error
  }

  return data || []
}

export async function createGrado(grado: Omit<Grado, "id">) {
  const { data, error } = await supabase.from("grados").insert([grado]).select()

  if (error) {
    console.error("Error creating grado:", error)
    throw error
  }

  return data[0]
}

export async function updateGrado(id: string, grado: Partial<Grado>) {
  const { data, error } = await supabase.from("grados").update(grado).eq("id", id).select()

  if (error) {
    console.error("Error updating grado:", error)
    throw error
  }

  return data[0]
}

export async function deleteGrado(id: string) {
  const { error } = await supabase.from("grados").delete().eq("id", id)

  if (error) {
    console.error("Error deleting grado:", error)
    throw error
  }
}

// Secciones
export async function getSecciones(busqueda?: string) {
  let query = supabase.from("secciones").select("*")

  if (busqueda) {
    query = query.ilike("nombre", `%${busqueda}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching secciones:", error)
    throw error
  }

  return data || []
}

export async function createSeccion(seccion: Omit<Seccion, "id">) {
  const { data, error } = await supabase.from("secciones").insert([seccion]).select()

  if (error) {
    console.error("Error creating seccion:", error)
    throw error
  }

  return data[0]
}

export async function updateSeccion(id: string, seccion: Partial<Seccion>) {
  const { data, error } = await supabase.from("secciones").update(seccion).eq("id", id).select()

  if (error) {
    console.error("Error updating seccion:", error)
    throw error
  }

  return data[0]
}

export async function deleteSeccion(id: string) {
  const { error } = await supabase.from("secciones").delete().eq("id", id)

  if (error) {
    console.error("Error deleting seccion:", error)
    throw error
  }
}

// Cursos
export async function getCursos(filtro?: { nivel?: string; activo?: boolean; busqueda?: string }) {
  let query = supabase.from("cursos").select("*")

  if (filtro?.nivel && filtro.nivel !== "todos") {
    query = query.eq("nivel", filtro.nivel)
  }

  if (filtro?.activo !== undefined) {
    query = query.eq("activo", filtro.activo)
  }

  if (filtro?.busqueda) {
    query = query.ilike("nombre", `%${filtro.busqueda}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching cursos:", error)
    throw error
  }

  return data || []
}

export async function createCurso(curso: Omit<Curso, "id">) {
  const { data, error } = await supabase.from("cursos").insert([curso]).select()

  if (error) {
    console.error("Error creating curso:", error)
    throw error
  }

  return data[0]
}

export async function updateCurso(id: string, curso: Partial<Curso>) {
  const { data, error } = await supabase.from("cursos").update(curso).eq("id", id).select()

  if (error) {
    console.error("Error updating curso:", error)
    throw error
  }

  return data[0]
}

export async function toggleCursoActivo(id: string, activo: boolean) {
  return updateCurso(id, { activo })
}

export async function deleteCurso(id: string) {
  const { error } = await supabase.from("cursos").delete().eq("id", id)

  if (error) {
    console.error("Error deleting curso:", error)
    throw error
  }
}

// Grupos
export async function getGrupos(filtro?: {
  curso_id?: string
  grado_id?: string
  seccion_id?: string
  año_escolar?: string
  activo?: boolean
  busqueda?: string
}) {
  let query = supabase.from("grupos").select(`
    *,
    curso:cursos(*),
    grado:grados(*),
    seccion:secciones(*),
    profesor:usuarios(*)
  `)

  if (filtro?.curso_id) {
    query = query.eq("curso_id", filtro.curso_id)
  }

  if (filtro?.grado_id) {
    query = query.eq("grado_id", filtro.grado_id)
  }

  if (filtro?.seccion_id) {
    query = query.eq("seccion_id", filtro.seccion_id)
  }

  if (filtro?.año_escolar) {
    query = query.eq("año_escolar", filtro.año_escolar)
  }

  if (filtro?.activo !== undefined) {
    query = query.eq("activo", filtro.activo)
  }

  // Búsqueda en relaciones
  if (filtro?.busqueda) {
    // Esto es más complejo en Supabase, podríamos filtrar después de obtener los datos
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching grupos:", error)
    throw error
  }

  // Filtrar por búsqueda si es necesario
  let filteredData = data || []
  if (filtro?.busqueda && filteredData.length > 0) {
    const searchTerm = filtro.busqueda.toLowerCase()
    filteredData = filteredData.filter(
      (grupo) =>
        grupo.curso?.nombre.toLowerCase().includes(searchTerm) ||
        grupo.grado?.nombre.toLowerCase().includes(searchTerm) ||
        grupo.seccion?.nombre.toLowerCase().includes(searchTerm) ||
        grupo.profesor?.nombre.toLowerCase().includes(searchTerm) ||
        grupo.profesor?.apellidos.toLowerCase().includes(searchTerm),
    )
  }

  return filteredData
}

export async function createGrupo(grupo: Omit<Grupo, "id">) {
  const { data, error } = await supabase.from("grupos").insert([grupo]).select()

  if (error) {
    console.error("Error creating grupo:", error)
    throw error
  }

  return data[0]
}

export async function updateGrupo(id: string, grupo: Partial<Grupo>) {
  const { data, error } = await supabase.from("grupos").update(grupo).eq("id", id).select()

  if (error) {
    console.error("Error updating grupo:", error)
    throw error
  }

  return data[0]
}

export async function toggleGrupoActivo(id: string, activo: boolean) {
  return updateGrupo(id, { activo })
}

export async function deleteGrupo(id: string) {
  const { error } = await supabase.from("grupos").delete().eq("id", id)

  if (error) {
    console.error("Error deleting grupo:", error)
    throw error
  }
}

// Asignación de alumnos a grupos
export async function getAlumnosGrupo(grupo_id: string) {
  const { data, error } = await supabase
    .from("grupo_alumno")
    .select(`
      *,
      alumno:alumno_id(*)
    `)
    .eq("grupo_id", grupo_id)

  if (error) {
    console.error("Error fetching alumnos del grupo:", error)
    throw error
  }

  return data || []
}

export async function getAlumnosDisponibles(grado_id?: string, seccion_id?: string) {
  // Obtener alumnos que coincidan con el grado y sección si se proporcionan
  let query = supabase.from("usuarios").select("*").eq("rol", "alumno").eq("activo", true)

  if (grado_id) {
    // Aquí asumimos que hay un campo grado_id en la tabla usuarios
    // Si no existe, esta lógica debe adaptarse
    query = query.eq("grado", grado_id)
  }

  if (seccion_id) {
    // Aquí asumimos que hay un campo seccion_id en la tabla usuarios
    // Si no existe, esta lógica debe adaptarse
    query = query.eq("seccion", seccion_id)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching alumnos disponibles:", error)
    throw error
  }

  return data || []
}

export async function asignarAlumnoGrupo(grupo_id: string, alumno_id: string) {
  const { data, error } = await supabase.from("grupo_alumno").insert([{ grupo_id, alumno_id }]).select()

  if (error) {
    console.error("Error asignando alumno al grupo:", error)
    throw error
  }

  return data[0]
}

export async function removerAlumnoGrupo(grupo_id: string, alumno_id: string) {
  const { error } = await supabase.from("grupo_alumno").delete().eq("grupo_id", grupo_id).eq("alumno_id", alumno_id)

  if (error) {
    console.error("Error removiendo alumno del grupo:", error)
    throw error
  }
}

// Horarios
export async function getHorarios(grupo_id: string) {
  const { data, error } = await supabase.from("horarios").select("*").eq("grupo_id", grupo_id)

  if (error) {
    console.error("Error fetching horarios:", error)
    throw error
  }

  return data || []
}

export async function createHorario(horario: Omit<Horario, "id">) {
  const { data, error } = await supabase.from("horarios").insert([horario]).select()

  if (error) {
    console.error("Error creating horario:", error)
    throw error
  }

  return data[0]
}

export async function updateHorario(id: number, horario: Partial<Omit<Horario, "id" | "grupo_id">>) {
  const { data, error } = await supabase.from("horarios").update(horario).eq("id", id).select()

  if (error) {
    console.error("Error updating horario:", error)
    throw error
  }

  return data[0]
}

export async function deleteHorario(id: number) {
  const { error } = await supabase.from("horarios").delete().eq("id", id)

  if (error) {
    console.error("Error deleting horario:", error)
    throw error
  }
}

// Estadísticas para el dashboard
export async function getEstadisticasDashboard() {
  try {
    // Contar usuarios por rol manualmente
    const usuariosContados = [
      { rol: "alumno", count: 0 },
      { rol: "profesor", count: 0 },
      { rol: "auxiliar", count: 0 },
      { rol: "admin", count: 0 },
    ]

    // Obtener todos los usuarios activos
    const { data: usuarios, error: errorTodosUsuarios } = await supabase
      .from("usuarios")
      .select("rol")
      .eq("activo", true)

    if (errorTodosUsuarios) throw errorTodosUsuarios

    // Contar manualmente
    if (usuarios) {
      usuarios.forEach((usuario) => {
        const rolIndex = usuariosContados.findIndex((item) => item.rol === usuario.rol)
        if (rolIndex !== -1) {
          usuariosContados[rolIndex].count++
        }
      })
    }

    // Total de cursos activos
    const { count: cursosActivos, error: errorCursos } = await supabase
      .from("cursos")
      .select("*", { count: "exact", head: true })
      .eq("activo", true)

    if (errorCursos) throw errorCursos

    // Total de grupos activos
    const { count: gruposActivos, error: errorGrupos } = await supabase
      .from("grupos")
      .select("*", { count: "exact", head: true })
      .eq("activo", true)

    if (errorGrupos) throw errorGrupos

    // Eventos próximos
    const { data: eventosProximos, error: errorEventos } = await supabase
      .from("eventos")
      .select("*")
      .gte("fecha_inicio", new Date().toISOString())
      .order("fecha_inicio", { ascending: true })
      .limit(5)

    if (errorEventos) throw errorEventos

    return {
      usuariosPorRol: usuariosContados,
      cursosActivos: cursosActivos || 0,
      gruposActivos: gruposActivos || 0,
      eventosProximos: eventosProximos || [],
    }
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error)
    return {
      usuariosPorRol: [],
      cursosActivos: 0,
      gruposActivos: 0,
      eventosProximos: [],
    }
  }
}
