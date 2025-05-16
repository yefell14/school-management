import type React from "react"
import { Inter } from "next/font/google"
import "../globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { PublicHeader } from "@/components/public/header"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "María de los Ángeles - Gestión Administrativa",
  description: "Sistema de gestión escolar María de los Ángeles",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
          <PublicHeader />
          {children}
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}
