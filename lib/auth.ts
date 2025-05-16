import { supabase } from "./supabase"

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw new Error(error.message)
  }
}

export async function getCurrentUser() {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return null

  const { data, error } = await supabase.from("usuarios").select("*").eq("email", session.user.email).single()

  if (error) {
    console.error("Error fetching user data:", error)
    return null
  }

  return data
}

export async function isAdmin() {
  const user = await getCurrentUser()
  return user?.rol === "admin"
}

export async function registerWithToken(token: string, password: string) {
  // Verificar si el token existe y no ha sido usado
  const { data: tokenData, error: tokenError } = await supabase
    .from("registro_tokens")
    .select("*")
    .eq("token", token)
    .eq("usado", false)
    .single()

  if (tokenError || !tokenData) {
    throw new Error("Token inválido o ya utilizado")
  }

  // Crear usuario en Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: tokenData.email || `${tokenData.nombre.toLowerCase()}.${tokenData.apellidos.toLowerCase()}@escuela.edu`,
    password,
  })

  if (authError) {
    throw new Error(`Error al crear la cuenta: ${authError.message}`)
  }

  // Crear usuario en la tabla usuarios
  const { data: userData, error: userError } = await supabase
    .from("usuarios")
    .insert([
      {
        nombre: tokenData.nombre,
        apellidos: tokenData.apellidos,
        email: authData.user?.email,
        rol: tokenData.rol,
        activo: true,
      },
    ])
    .select()
    .single()

  if (userError) {
    throw new Error(`Error al crear el usuario: ${userError.message}`)
  }

  // Actualizar token como usado
  await supabase
    .from("registro_tokens")
    .update({
      usado: true,
      fecha_uso: new Date().toISOString(),
      usuario_asociado: userData.id,
    })
    .eq("id", tokenData.id)

  return userData
}
