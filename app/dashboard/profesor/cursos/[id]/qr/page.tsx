"use client"

import { useEffect, useState, useRef } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { ArrowLeft, Download, QrCode, RefreshCw, Clock, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { QRCodeSVG } from "qrcode.react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { convertQRtoJPG } from "@/lib/qr-utils"

interface CourseInfo {
  id: string
  nombre: string
  grado: string
  seccion: string
}

export default function CourseQRPage({ params }: { params: { id: string } }) {
  const [courseInfo, setCourseInfo] = useState<CourseInfo | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [qrExpiration, setQrExpiration] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const qrRef = useRef<HTMLDivElement>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchCourseAndQR() {
      try {
        setLoading(true)
        setError(null)

        // Verificar que el profesor tiene acceso a este grupo
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          setError("No hay sesión activa")
          return
        }

        // Verificar que el profesor está asignado a este grupo
        const { data: profesorGroup, error: profesorError } = await supabase
          .from("grupo_profesor")
          .select("*")
          .eq("profesor_id", session.user.id)
          .eq("grupo_id", params.id)
          .maybeSingle()

        if (profesorError) {
          console.error("Error al verificar acceso del profesor:", profesorError)
          throw profesorError
        }

        if (!profesorGroup) {
          setError("No tienes acceso a este curso")
          return
        }

        // Obtener información del curso
        const { data: groupData, error: groupError } = await supabase
          .from("grupos")
          .select(`
            id,
            cursos:curso_id (id, nombre),
            grados:grado_id (nombre),
            secciones:seccion_id (nombre)
          `)
          .eq("id", params.id)
          .single()

        if (groupError) {
          console.error("Error al obtener información del curso:", groupError)
          throw groupError
        }

        setCourseInfo({
          id: groupData.id,
          nombre: groupData.cursos.nombre,
          grado: groupData.grados.nombre,
          seccion: groupData.secciones.nombre,
        })

        // Obtener QR activo para el curso
        const { data: qrData, error: qrError } = await supabase
          .from("qr_asistencias_curso")
          .select("*")
          .eq("curso_id", groupData.cursos.id)
          .eq("activo", true)
          .order("fecha_creacion", { ascending: false })
          .limit(1)
          .maybeSingle()

        if (qrError) {
          console.error("Error al obtener QR:", qrError)
          throw qrError
        }

        if (qrData) {
          setQrCode(qrData.qr_codigo)
          setQrExpiration(qrData.fecha_expiracion)
        } else {
          // Generar nuevo QR si no existe
          await generateQR(groupData.cursos.id)
        }
      } catch (error: any) {
        console.error("Error:", error)
        setError(error.message || "Error al cargar la información")
      } finally {
        setLoading(false)
      }
    }

    fetchCourseAndQR()
  }, [params.id, supabase])

  const generateQR = async (cursoId: string) => {
    try {
      setGenerating(true)
      setError(null)
      setSuccess(null)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setError("No hay sesión activa")
        return
      }

      // Generar código QR único
      const qrCode = `curso:${cursoId}:${Date.now()}:${Math.random().toString(36).substring(2, 15)}`

      // Establecer fecha de expiración (24 horas)
      const expirationDate = new Date()
      expirationDate.setHours(expirationDate.getHours() + 24)

      // Desactivar QRs anteriores
      const { error: updateError } = await supabase
        .from("qr_asistencias_curso")
        .update({ activo: false })
        .eq("curso_id", cursoId)
        .eq("activo", true)

      if (updateError) {
        console.error("Error al desactivar QRs anteriores:", updateError)
        throw updateError
      }

      // Crear nuevo QR
      const { error: insertError } = await supabase.from("qr_asistencias_curso").insert({
        curso_id: cursoId,
        qr_codigo: qrCode,
        fecha_expiracion: expirationDate.toISOString(),
        activo: true,
      })

      if (insertError) {
        console.error("Error al crear QR:", insertError)
        throw insertError
      }

      setQrCode(qrCode)
      setQrExpiration(expirationDate.toISOString())
      setSuccess("Código QR generado correctamente")
    } catch (error: any) {
      console.error("Error:", error)
      setError(error.message || "Error al generar el código QR")
    } finally {
      setGenerating(false)
    }
  }

  const downloadQR = () => {
    if (!qrRef.current) return

    const canvas = qrRef.current.querySelector("canvas")
    if (!canvas) return

    const link = document.createElement("a")
    link.href = convertQRtoJPG(canvas)
    link.download = `qr_${courseInfo?.nombre.replace(/\s+/g, "_")}_${format(new Date(), "yyyyMMdd")}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error && !courseInfo) {
    return (
      <div className="container mx-auto">
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button asChild>
          <Link href={`/dashboard/profesor/cursos/${params.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Curso
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href={`/dashboard/profesor/cursos/${params.id}`}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-blue-600">Código QR</h1>
          {courseInfo && (
            <div className="ml-4 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md">
              {`${courseInfo.nombre} - ${courseInfo.grado} ${courseInfo.seccion}`}
            </div>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert variant="default" className="bg-green-50 border-green-500 text-green-700">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Código QR del Curso</CardTitle>
              <CardDescription>
                Este código QR puede ser utilizado para registrar asistencia o compartir información del curso
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6">
              {qrCode ? (
                <div ref={qrRef} className="bg-white p-6 rounded-lg shadow-md">
                  <QRCodeSVG value={qrCode} size={250} level="H" includeMargin={true} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10">
                  <QrCode className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-xl text-gray-500">No hay código QR generado</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              {qrExpiration && (
                <div className="flex items-center justify-center text-sm text-gray-500 w-full">
                  <Clock className="h-4 w-4 mr-1" />
                  Expira: {format(new Date(qrExpiration), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
                </div>
              )}
              <div className="flex justify-center space-x-4 w-full">
                <Button variant="outline" onClick={() => courseInfo && generateQR(courseInfo.id)} disabled={generating}>
                  <RefreshCw className={`h-4 w-4 mr-1 ${generating ? "animate-spin" : ""}`} />
                  {generating ? "Generando..." : "Regenerar QR"}
                </Button>
                <Button onClick={downloadQR} disabled={!qrCode}>
                  <Download className="h-4 w-4 mr-1" />
                  Descargar
                </Button>
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Instrucciones</CardTitle>
              <CardDescription>Cómo utilizar el código QR para la asistencia</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">1. Generar código QR</h3>
                <p className="text-sm text-gray-600">
                  El código QR se genera automáticamente. Puede regenerarlo en cualquier momento haciendo clic en el
                  botón "Regenerar QR".
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">2. Compartir con los estudiantes</h3>
                <p className="text-sm text-gray-600">
                  Muestre el código QR a los estudiantes o compártalo a través de la plataforma. Los estudiantes pueden
                  escanearlo con la aplicación móvil para registrar su asistencia.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">3. Verificar asistencia</h3>
                <p className="text-sm text-gray-600">
                  Una vez que los estudiantes hayan escaneado el código QR, puede verificar la asistencia en la sección
                  de "Asistencia" del curso.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Seguridad</h3>
                <p className="text-sm text-gray-600">
                  El código QR expira después de 24 horas por razones de seguridad. Regenere el código cuando sea
                  necesario.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <Link href={`/dashboard/profesor/cursos/${params.id}/asistencia`}>
                  <Calendar className="h-4 w-4 mr-1" />
                  Ver Registro de Asistencia
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
