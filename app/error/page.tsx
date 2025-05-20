"use client"

import { Suspense } from "react"
import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft } from "lucide-react"

function ErrorPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const errorType = searchParams.get("type")

  const getErrorContent = () => {
    switch (errorType) {
      case "permission":
        return {
          title: "Error de Permisos",
          description: "No tienes los permisos necesarios para acceder a este recurso.",
          details: "Por favor, contacta al administrador si crees que esto es un error."
        }
      default:
        return {
          title: "Error",
          description: "Ha ocurrido un error inesperado.",
          details: "Por favor, intenta nuevamente más tarde."
        }
    }
  }

  const errorContent = getErrorContent()

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <CardTitle>{errorContent.title}</CardTitle>
          </div>
          <CardDescription>{errorContent.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{errorContent.details}</p>
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <CardTitle>Cargando...</CardTitle>
            </div>
          </CardHeader>
        </Card>
      </div>
    }>
      <ErrorPageContent />
    </Suspense>
  )
} 