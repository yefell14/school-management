"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { MessageSquare, Send, Inbox, Archive, Trash2, Search, UserIcon, Clock, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface Message {
  id: string
  remitente_id: string
  destinatario_id: string
  asunto: string
  contenido: string
  fecha: string
  leido: boolean
  carpeta: string
  remitente?: {
    nombre: string
    apellidos: string
    rol: string
  }
  destinatario?: {
    nombre: string
    apellidos: string
    rol: string
  }
}

interface Recipient {
  id: string
  nombre: string
  apellidos: string
  rol: string
}

export default function TeacherMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<Recipient[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [activeFolder, setActiveFolder] = useState("recibidos")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState({
    destinatario_id: "",
    asunto: "",
    contenido: "",
  })
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchMessages() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) return

        // Fetch received messages
        const { data: receivedMessages, error: receivedError } = await supabase
          .from("mensajes")
          .select(`
            id,
            remitente_id,
            destinatario_id,
            asunto,
            contenido,
            fecha,
            leido,
            carpeta,
            remitente:remitente_id(nombre, apellidos, rol)
          `)
          .eq("destinatario_id", session.user.id)
          .eq("carpeta", "recibidos")
          .order("fecha", { ascending: false })

        if (receivedError) throw receivedError

        // Fetch sent messages
        const { data: sentMessages, error: sentError } = await supabase
          .from("mensajes")
          .select(`
            id,
            remitente_id,
            destinatario_id,
            asunto,
            contenido,
            fecha,
            leido,
            carpeta,
            destinatario:destinatario_id(nombre, apellidos, rol)
          `)
          .eq("remitente_id", session.user.id)
          .eq("carpeta", "enviados")
          .order("fecha", { ascending: false })

        if (sentError) throw sentError

        // Combine messages
        setMessages([...receivedMessages, ...sentMessages])

        // Fetch users for new message
        const { data: usersData, error: usersError } = await supabase
          .from("usuarios")
          .select("id, nombre, apellidos, rol")
          .in("rol", ["profesor", "admin", "auxiliar"])
          .neq("id", session.user.id)
          .order("apellidos", { ascending: true })

        if (usersError) throw usersError

        setUsers(usersData)
      } catch (error) {
        console.error("Error fetching messages:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [supabase])

  const handleSendMessage = async () => {
    try {
      setSendingMessage(true)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) return

      if (!newMessage.destinatario_id || !newMessage.asunto || !newMessage.contenido) {
        alert("Por favor complete todos los campos")
        return
      }

      // Insert message for sender
      const { error: senderError } = await supabase.from("mensajes").insert({
        remitente_id: session.user.id,
        destinatario_id: newMessage.destinatario_id,
        asunto: newMessage.asunto,
        contenido: newMessage.contenido,
        carpeta: "enviados",
      })

      if (senderError) throw senderError

      // Insert message for recipient
      const { error: recipientError } = await supabase.from("mensajes").insert({
        remitente_id: session.user.id,
        destinatario_id: newMessage.destinatario_id,
        asunto: newMessage.asunto,
        contenido: newMessage.contenido,
        carpeta: "recibidos",
      })

      if (recipientError) throw recipientError

      // Reset form and close dialog
      setNewMessage({
        destinatario_id: "",
        asunto: "",
        contenido: "",
      })
      setIsNewMessageOpen(false)

      // Refresh messages
      window.location.reload()
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Error al enviar el mensaje")
    } finally {
      setSendingMessage(false)
    }
  }

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase.from("mensajes").update({ leido: true }).eq("id", messageId)

      if (error) throw error

      // Update local state
      setMessages(messages.map((msg) => (msg.id === messageId ? { ...msg, leido: true } : msg)))
    } catch (error) {
      console.error("Error marking message as read:", error)
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

  // Filter messages by folder and search query
  const filteredMessages = messages.filter((msg) => {
    const matchesFolder = msg.carpeta === activeFolder

    if (!searchQuery) return matchesFolder

    const searchLower = searchQuery.toLowerCase()
    const senderName = msg.remitente ? `${msg.remitente.nombre} ${msg.remitente.apellidos}`.toLowerCase() : ""
    const recipientName = msg.destinatario
      ? `${msg.destinatario.nombre} ${msg.destinatario.apellidos}`.toLowerCase()
      : ""

    return (
      matchesFolder &&
      (msg.asunto.toLowerCase().includes(searchLower) ||
        msg.contenido.toLowerCase().includes(searchLower) ||
        senderName.includes(searchLower) ||
        recipientName.includes(searchLower))
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <MessageSquare className="h-6 w-6 mr-2 text-blue-600" />
            <h1 className="text-3xl font-bold text-blue-600">Mensajes</h1>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar mensajes..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center">
                  <Plus className="h-4 w-4 mr-1" />
                  Nuevo Mensaje
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Nuevo Mensaje</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="recipient">Destinatario</Label>
                    <Select
                      onValueChange={(value) => setNewMessage({ ...newMessage, destinatario_id: value })}
                      value={newMessage.destinatario_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar destinatario" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {`${user.nombre} ${user.apellidos} (${user.rol})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="subject">Asunto</Label>
                    <Input
                      id="subject"
                      value={newMessage.asunto}
                      onChange={(e) => setNewMessage({ ...newMessage, asunto: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="content">Mensaje</Label>
                    <Textarea
                      id="content"
                      rows={6}
                      value={newMessage.contenido}
                      onChange={(e) => setNewMessage({ ...newMessage, contenido: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSendMessage} disabled={sendingMessage} className="flex items-center">
                    <Send className="h-4 w-4 mr-1" />
                    {sendingMessage ? "Enviando..." : "Enviar Mensaje"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-1">
                  <Button
                    variant={activeFolder === "recibidos" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveFolder("recibidos")}
                  >
                    <Inbox className="h-4 w-4 mr-2" />
                    Recibidos
                    <span className="ml-auto bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                      {messages.filter((m) => m.carpeta === "recibidos").length}
                    </span>
                  </Button>
                  <Button
                    variant={activeFolder === "enviados" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveFolder("enviados")}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Enviados
                    <span className="ml-auto bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                      {messages.filter((m) => m.carpeta === "enviados").length}
                    </span>
                  </Button>
                  <Button
                    variant={activeFolder === "archivados" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveFolder("archivados")}
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archivados
                    <span className="ml-auto bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                      {messages.filter((m) => m.carpeta === "archivados").length}
                    </span>
                  </Button>
                  <Button
                    variant={activeFolder === "papelera" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveFolder("papelera")}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Papelera
                    <span className="ml-auto bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                      {messages.filter((m) => m.carpeta === "papelera").length}
                    </span>
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-3">
            <Card className="h-full">
              {selectedMessage ? (
                <div className="h-full flex flex-col">
                  <CardHeader className="border-b">
                    <div className="flex justify-between items-center">
                      <CardTitle>{selectedMessage.asunto}</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedMessage(null)}>
                        Volver
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 flex-1 overflow-auto">
                    <div className="flex justify-between items-start mb-4 pb-4 border-b">
                      <div>
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="font-medium">
                            {activeFolder === "recibidos" && selectedMessage.remitente
                              ? `${selectedMessage.remitente.nombre} ${selectedMessage.remitente.apellidos}`
                              : activeFolder === "enviados" && selectedMessage.destinatario
                                ? `Para: ${selectedMessage.destinatario.nombre} ${selectedMessage.destinatario.apellidos}`
                                : "Usuario"}
                          </span>
                        </div>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(selectedMessage.fecha)}
                        </div>
                      </div>
                    </div>
                    <div className="whitespace-pre-wrap">{selectedMessage.contenido}</div>
                  </CardContent>
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  <CardHeader className="border-b">
                    <CardTitle>
                      {activeFolder === "recibidos"
                        ? "Mensajes Recibidos"
                        : activeFolder === "enviados"
                          ? "Mensajes Enviados"
                          : activeFolder === "archivados"
                            ? "Mensajes Archivados"
                            : "Papelera"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 flex-1 overflow-auto">
                    {filteredMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-64">
                        <MessageSquare className="h-12 w-12 text-gray-300 mb-2" />
                        <p className="text-gray-500">No hay mensajes en esta carpeta</p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {filteredMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`p-4 hover:bg-gray-50 cursor-pointer ${!message.leido && activeFolder === "recibidos" ? "bg-blue-50" : ""}`}
                            onClick={() => {
                              setSelectedMessage(message)
                              if (!message.leido && activeFolder === "recibidos") {
                                markAsRead(message.id)
                              }
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <div className="font-medium">
                                {activeFolder === "recibidos" && message.remitente
                                  ? `${message.remitente.nombre} ${message.remitente.apellidos}`
                                  : activeFolder === "enviados" && message.destinatario
                                    ? `Para: ${message.destinatario.nombre} ${message.destinatario.apellidos}`
                                    : "Usuario"}
                              </div>
                              <div className="text-xs text-gray-500">{formatDate(message.fecha)}</div>
                            </div>
                            <div className="font-medium mt-1">{message.asunto}</div>
                            <div className="text-sm text-gray-600 mt-1 truncate">{message.contenido}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
