"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Send, User, Globe, School, ToggleLeft, ToggleRight } from "lucide-react"
import Image from "next/image"

interface Message {
  id: number
  text: string
  isBot: boolean
  timestamp: Date
}

interface ChatBotProps {
  setIsChatbotOpen: (isOpen: boolean) => void
}

type ChatMode = "school" | "general"

export default function ChatBot1({ setIsChatbotOpen }: ChatBotProps) {
  const [chatMode, setChatMode] = useState<ChatMode>("school")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "¡Hola! Soy Angelita, tu asistente virtual del Colegio María de los Ángeles. ¿En qué puedo ayudarte hoy?",
      isBot: true,
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const schoolResponses: { [key: string]: string } = {
    horarios:
      "Nuestros horarios son: Inicial: 8:00 AM - 12:00 PM, Primaria: 7:30 AM - 2:30 PM, Secundaria: 7:00 AM - 3:00 PM.",
    admisiones:
      "El proceso de admisiones incluye: 1) Solicitud de información, 2) Visita guiada, 3) Evaluación integral. Contacta al (062) 515407 para más detalles.",
    pensiones:
      "Para información sobre pensiones y costos, por favor contacta a nuestra oficina de administración al (062) 515407 ext. 102.",
    uniforme:
      "El uniforme escolar incluye: camisa blanca, pantalón/falda azul marino, zapatos negros y chompa institucional. Disponible en nuestra tienda escolar.",
    actividades:
      "Ofrecemos: deportes (fútbol, vóley, básquet), música, arte, robótica, clubes de ciencias y matemáticas. Inscripciones cada bimestre.",
    calendario:
      "Año escolar 2025: Inicio 15 de marzo, vacaciones de medio año 29 julio-12 agosto, culminación 20 diciembre.",
    contacto:
      "📞 (062) 515407 | 📧 info@mariaangeles.edu.pe | 📍 Leoncio Prado 1431, Huánuco 10001 | Horario: Lunes a Viernes 8:00 AM - 5:00 PM",
    metodologia:
      "Utilizamos metodología activa con aprendizaje por proyectos, pensamiento crítico, trabajo colaborativo y tecnología educativa.",
    niveles:
      "Atendemos: Inicial (3-5 años), Primaria (6-11 años) y Secundaria (12-16 años). Cada nivel con metodología especializada.",
    instalaciones:
      "Contamos con: laboratorios de ciencias, aulas inteligentes, biblioteca digital, canchas deportivas, auditorio y cafetería.",
  }

  const getSchoolResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase()

    for (const [key, response] of Object.entries(schoolResponses)) {
      if (lowerMessage.includes(key)) {
        return response
      }
    }

    if (
      lowerMessage.includes("hola") ||
      lowerMessage.includes("buenos días") ||
      lowerMessage.includes("buenas tardes") ||
      lowerMessage.includes("hi")
    ) {
      return "¡Hola! 😊 Soy Angelita, tu asistente virtual. Puedo ayudarte con: horarios, admisiones, pensiones, uniformes, actividades, calendario, contacto, metodología, niveles e instalaciones. ¿Qué te interesa saber?"
    }

    if (lowerMessage.includes("gracias") || lowerMessage.includes("thank you")) {
      return "¡De nada! 😊 Estoy aquí para ayudarte. ¿Hay algo más en lo que pueda asistirte sobre el Colegio María de los Ángeles?"
    }

    return "Disculpa, no entiendo tu pregunta. 🤔 Puedo ayudarte con información sobre: horarios, admisiones, pensiones, uniformes, actividades extracurriculares, calendario escolar, contacto, metodología, niveles educativos e instalaciones. ¿Sobre qué te gustaría saber?"
  }

  const getGeneralResponse = async (message: string): Promise<string> => {
    try {
      console.log("Enviando mensaje a MagicLoops:", message)

      const response = await fetch("https://magicloops.dev/api/loop/65618f90-e987-4bec-9d90-a22789ab1a97/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          question: message,
        }),
      })

      console.log("Respuesta HTTP status:", response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Datos recibidos de MagicLoops:", data)

      if (data && typeof data === "object") {
        const possibleFields = ["output", "response", "result", "answer", "text", "message"]

        for (const field of possibleFields) {
          if (data[field] && typeof data[field] === "string") {
            console.log(`Respuesta encontrada en campo '${field}':`, data[field])
            return data[field]
          }
        }

        if (Object.keys(data).length > 0) {
          const responseText = JSON.stringify(data, null, 2)
          console.log("Convirtiendo objeto completo a string:", responseText)
          return responseText
        }
      }

      if (typeof data === "string" && data.trim()) {
        console.log("Respuesta directa como string:", data)
        return data
      }

      console.log("No se pudo extraer respuesta válida")
      return "He recibido tu mensaje pero no pude procesar la respuesta correctamente. ¿Podrías reformular tu pregunta?"
    } catch (error) {
      console.error("Error detallado al llamar MagicLoops API:", error)
      return `Lo siento, ha ocurrido un error de conexión: ${error instanceof Error ? error.message : "Error desconocido"}. Por favor, intenta de nuevo más tarde.`
    }
  }

  const toggleChatMode = () => {
    const newMode = chatMode === "school" ? "general" : "school"
    setChatMode(newMode)

    const modeMessage: Message = {
      id: messages.length + 1,
      text:
        newMode === "school"
          ? "Modo cambiado a: Información del Colegio. Ahora responderé preguntas específicas sobre el Colegio María de los Ángeles."
          : "Modo cambiado a: Asistente General IA. Ahora responderé preguntas generales usando inteligencia artificial.",
      isBot: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, modeMessage])
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      isBot: false,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = inputMessage
    setInputMessage("")
    setIsLoading(true)

    try {
      let responseText = ""

      if (chatMode === "school") {
        responseText = getSchoolResponse(currentInput)
      } else {
        responseText = await getGeneralResponse(currentInput)
      }

      const botResponse: Message = {
        id: messages.length + 2,
        text: responseText,
        isBot: true,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botResponse])
    } catch (error) {
      console.error("Error en handleSendMessage:", error)
      const errorMessage: Message = {
        id: messages.length + 2,
        text: "Lo siento, ha ocurrido un error inesperado al procesar tu solicitud. Por favor, intenta de nuevo más tarde.",
        isBot: true,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg flex-shrink-0 p-2 md:p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden flex items-center justify-center">
              <Image
                src="/images/chatbot-icon.gif"
                alt="Chatbot"
                width={40}
                height={40}
                className="object-cover rounded-full"
              />
            </div>
            <div>
              <CardTitle className="text-xs md:text-sm font-light">Angelita</CardTitle>
              <p className="text-blue-100 text-xs font-light">
                {chatMode === "school" ? "Asistente del Colegio" : "Asistente General IA"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleChatMode}
            className="text-white hover:bg-blue-700 h-5 md:h-6 p-1 flex items-center gap-1"
            title={chatMode === "school" ? "Cambiar a modo general" : "Cambiar a modo colegio"}
          >
            {chatMode === "school" ? (
              <>
                <School className="w-2 md:w-3 h-2 md:h-3" />
                <ToggleLeft className="w-3 md:w-4 h-3 md:h-4" />
              </>
            ) : (
              <>
                <Globe className="w-2 md:w-3 h-2 md:h-3" />
                <ToggleRight className="w-3 md:w-4 h-3 md:h-4" />
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <div
          className="flex-1 overflow-y-auto p-2 md:p-3 space-y-2 md:space-y-3 bg-gray-50"
          style={{ height: "calc(100% - 50px)" }}
        >
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[85%] p-2 rounded-lg text-xs ${
                  message.isBot ? "bg-white text-blue-900 border border-blue-200" : "bg-blue-600 text-white"
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.isBot ? (
                    <div className="w-4 h-4 md:w-5 md:h-5 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Image
                        src="/images/chatbot-icon.gif"
                        alt="Chatbot"
                        width={20}
                        height={20}
                        className="object-cover rounded-full"
                      />
                    </div>
                  ) : (
                    <User className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  )}
                  <p className="text-xs leading-relaxed font-light">{message.text}</p>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] p-2 rounded-lg text-xs bg-white text-blue-900 border border-blue-200">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 md:w-5 md:h-5 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
                    <Image
                      src="/images/chatbot-icon.gif"
                      alt="Chatbot"
                      width={20}
                      height={20}
                      className="object-cover rounded-full"
                    />
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t p-2 flex gap-2 bg-white flex-shrink-0">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu pregunta..."
            className="flex-1 text-xs h-6 md:h-8 font-light"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            className="bg-blue-600 hover:bg-blue-700 h-6 w-6 md:h-8 md:w-8 p-0"
            size="sm"
            disabled={isLoading}
          >
            <Send className="w-2 md:w-3 h-2 md:h-3" />
          </Button>
        </div>
      </CardContent>
    </div>
  )
} 