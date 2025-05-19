"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

interface User {
  nombre: string
  apellidos: string
  email: string
  id: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>({
    nombre: "Juan",
    apellidos: "Pérez",
    email: "juan.perez@example.com",
    id: "1"
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if user is logged in (e.g., check localStorage or session)
    const checkAuth = async () => {
      try {
        // TODO: Implement your actual auth check logic here
        setLoading(false)
      } catch (error) {
        console.error("Auth check failed:", error)
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      // TODO: Implement your actual sign in logic here
      setUser({
        nombre: "Juan",
        apellidos: "Pérez",
        email: email,
        id: "1"
      })
    } catch (error) {
      console.error("Sign in failed:", error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      // TODO: Implement your actual sign out logic here
      setUser(null)
    } catch (error) {
      console.error("Sign out failed:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}