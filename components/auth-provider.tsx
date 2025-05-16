"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { Usuario } from "@/lib/supabase"

type AuthContextType = {
  user: Usuario | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          // Obtener datos del usuario desde la tabla usuarios
          const { data, error } = await supabase.from("usuarios").select("*").eq("email", session.user.email).single()

          if (error) {
            console.error("Error fetching user data:", error)
            setUser(null)
          } else {
            setUser(data)

            // Actualizar último acceso
            await supabase.from("usuarios").update({ ultimo_acceso: new Date().toISOString() }).eq("id", data.id)
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Error checking user:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        // Obtener datos del usuario desde la tabla usuarios
        const { data, error } = await supabase.from("usuarios").select("*").eq("email", session.user.email).single()

        if (error) {
          console.error("Error fetching user data:", error)
          setUser(null)
        } else {
          setUser(data)

          // Actualizar último acceso
          await supabase.from("usuarios").update({ ultimo_acceso: new Date().toISOString() }).eq("id", data.id)
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Obtener datos del usuario desde la tabla usuarios
      const { data: userData, error: userError } = await supabase
        .from("usuarios")
        .select("*")
        .eq("email", email)
        .single()

      if (userError) throw userError

      // Verificar si el usuario está activo
      if (!userData.activo) {
        await supabase.auth.signOut()
        throw new Error("Su cuenta está desactivada. Contacte al administrador.")
      }

      setUser(userData)

      // Actualizar último acceso
      await supabase.from("usuarios").update({ ultimo_acceso: new Date().toISOString() }).eq("id", userData.id)

      // Redirigir según el rol
      if (userData.rol === "admin") {
        router.push("/dashboard/admin")
      } else if (userData.rol === "profesor") {
        router.push("/dashboard/profesor")
      } else if (userData.rol === "alumno") {
        router.push("/dashboard/alumno")
      } else if (userData.rol === "auxiliar") {
        router.push("/dashboard/auxiliar")
      }
    } catch (error) {
      console.error("Error signing in:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
