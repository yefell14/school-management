"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase, type Mensaje, type Usuario } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Search, Inbox, PlaneIcon as PaperPlane, Mail, MailOpen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function MensajesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [profesores, setProfesores] = useState<Usuario[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Mensaje | null>(null)
  const [newMessageOpen, setNewMessageOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("recibidos")
  const [loading, setLoading] = useState(true)

  // New message form
  const [destinatario, setDestinatario] = useState("")
  const [asunto, setAsunto] = useState("")
  const [contenido, setContenido] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        // Fetch messages
        const { data: mensajesData, error: mensajesError } = await supabase
          .from("mensajes")
          .select(`
            *,
            remitente:remitente_id(nombre, apellidos)
          `)
          .or(`destinatario_id.eq.${user.id},remitente_id.eq.${user.id}`)
          .order("fecha", { ascending: false })

        if (mensajesError) throw mensajesError
        setMensajes(mensajesData)

        // Fetch professors
        const { data: gruposData, error: gruposError } = await supabase
          .from("grupo_alumno")
          .select("grupo_id")
          .eq("alumno_id", user.id)

        if (gruposError) throw gruposError

        const grupoIds = gruposData.map((item) => item.grupo_id)

        if (grupoIds.length > 0) {
          const { data: profesoresData, error: profesoresError } = await supabase
            .from("grupo_profesor")
            .select(`
              profesor:profesor_id(id, nombre, apellidos, email)
            `)
            .in("grupo_id", grupoIds)

          if (!profesoresError) {
            // Remove duplicates
            const uniqueProfesores = profesoresData.reduce((acc, curr) => {
              if (!acc.find((p) => p.profesor.id === curr.profesor.id)) {
                acc.push(curr)
              }
              return acc
            }, [] as any[])

            setProfesores(uniqueProfesores.map((item) => item.profesor))
          }
        }
      } catch (error) {
        console.error("Error fetching messages:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const handleSendMessage = async () => {
    if (!user || !destinatario || !asunto || !contenido) return

    setSendingMessage(true)

    try {
      const { data, error } = await supabase
        .from("mensajes")
        .insert([
          {
            remitente_id: user.id,
            destinatario_id: destinatario,
            asunto,
            contenido,
            carpeta: "enviados",
          },
        ])
        .select()

      if (error) throw error

      // Reset form
      setDestinatario("")
      setAsunto("")
      setContenido("")
      setNewMessageOpen(false)

      // Update messages list
      const { data: newMessage, error: fetchError } = await supabase
        .from("mensajes")
        .select(`
          *,
          remitente:remitente_id(nombre, apellidos)
        `)
        .eq("id", data[0].id)
        .single()

      if (!fetchError) {
        setMensajes([newMessage, ...mensajes])
      }

      toast({
        title: "Mensaje enviado",
        description: "Tu mensaje ha sido enviado correctamente",
      })
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive",
      })
    } finally {
      setSendingMessage(false)
    }
  }

  const handleReadMessage = async (mensaje: Mensaje) => {
    setSelectedMessage(mensaje)

    // Mark as read if it's received and unread
    if (mensaje.destinatario_id === user?.id && !mensaje.leido) {
      try {
        await supabase.from("mensajes").update({ leido: true }).eq("id", mensaje.id)

        // Update local state
        setMensajes(mensajes.map((m) => (m.id === mensaje.id ? { ...m, leido: true } : m)))
      } catch (error) {
        console.error("Error marking message as read:", error)
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const filteredMessages = mensajes.filter((mensaje) => {
    // Filter by tab (folder)
    if (activeTab === "recibidos" && mensaje.destinatario_id !== user?.id) return false
    if (activeTab === "enviados" && mensaje.remitente_id !== user?.id) return false

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        mensaje.asunto.toLowerCase().includes(searchLower) ||
        mensaje.contenido.toLowerCase().includes(searchLower) ||
        (mensaje.remitente?.nombre + " " + mensaje.remitente?.apellidos).toLowerCase().includes(searchLower)
      )
    }

    return true
  })

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Mensajes</h1>
        <p className="text-muted-foreground">Gestiona tus mensajes con profesores</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar mensajes..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Dialog open={newMessageOpen} onOpenChange={setNewMessageOpen}>
          <DialogTrigger asChild>
            <Button>
              <MessageSquare className="mr-2 h-4 w-4" />
              Nuevo mensaje
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nuevo mensaje</DialogTitle>
              <DialogDescription>Envía un mensaje a un profesor</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="destinatario" className="text-sm font-medium">
                  Destinatario
                </label>
                <Select value={destinatario} onValueChange={setDestinatario}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un profesor" />
                  </SelectTrigger>
                  <SelectContent>
                    {profesores.map((profesor) => (
                      <SelectItem key={profesor.id} value={profesor.id}>
                        {profesor.nombre} {profesor.apellidos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="asunto" className="text-sm font-medium">
                  Asunto
                </label>
                <Input
                  id="asunto"
                  value={asunto}
                  onChange={(e) => setAsunto(e.target.value)}
                  placeholder="Asunto del mensaje"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="contenido" className="text-sm font-medium">
                  Mensaje
                </label>
                <Textarea
                  id="contenido"
                  value={contenido}
                  onChange={(e) => setContenido(e.target.value)}
                  placeholder="Escribe tu mensaje aquí"
                  rows={5}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewMessageOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSendMessage} disabled={!destinatario || !asunto || !contenido || sendingMessage}>
                {sendingMessage ? "Enviando..." : "Enviar mensaje"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Carpetas</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
                <TabsList className="w-full flex flex-col items-stretch h-auto">
                  <TabsTrigger value="recibidos" className="justify-start">
                    <Inbox className="mr-2 h-4 w-4" />
                    Recibidos
                  </TabsTrigger>
                  <TabsTrigger value="enviados" className="justify-start">
                    <PaperPlane className="mr-2 h-4 w-4" />
                    Enviados
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader className="p-4">
              <CardTitle className="text-lg">
                {activeTab === "recibidos" ? "Mensajes recibidos" : "Mensajes enviados"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {selectedMessage ? (
                <div className="p-4">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedMessage(null)} className="mb-4">
                    ← Volver
                  </Button>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar>
                          <AvatarFallback>
                            {selectedMessage.remitente?.nombre.charAt(0)}
                            {selectedMessage.remitente?.apellidos.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {selectedMessage.remitente?.nombre} {selectedMessage.remitente?.apellidos}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatDate(selectedMessage.fecha)}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{selectedMessage.asunto}</h3>
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="whitespace-pre-wrap">{selectedMessage.contenido}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredMessages.length > 0 ? (
                    filteredMessages.map((mensaje) => (
                      <div
                        key={mensaje.id}
                        className={`flex cursor-pointer items-center p-4 hover:bg-muted/50 ${
                          mensaje.destinatario_id === user?.id && !mensaje.leido ? "bg-primary/5" : ""
                        }`}
                        onClick={() => handleReadMessage(mensaje)}
                      >
                        <div className="mr-4">
                          {mensaje.destinatario_id === user?.id && !mensaje.leido ? (
                            <Mail className="h-5 w-5 text-primary" />
                          ) : (
                            <MailOpen className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">
                              {mensaje.remitente_id === user?.id
                                ? "Para: Profesor"
                                : mensaje.remitente?.nombre + " " + mensaje.remitente?.apellidos}
                            </p>
                            <p className="text-xs text-muted-foreground">{formatDate(mensaje.fecha)}</p>
                          </div>
                          <p className="truncate">{mensaje.asunto}</p>
                          <p className="text-sm text-muted-foreground truncate">{mensaje.contenido}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <MessageSquare className="h-10 w-10 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-semibold">No hay mensajes</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {searchTerm
                          ? "No se encontraron mensajes que coincidan con tu búsqueda"
                          : activeTab === "recibidos"
                            ? "No has recibido ningún mensaje"
                            : "No has enviado ningún mensaje"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
