"use client"

import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'

interface Message {
  text: string
  isUser: boolean
  timestamp: Date
}

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "¡Hola! Soy el asistente general. ¿En qué puedo ayudarte?",
      isUser: false,
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const uploadFile = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`https://magicloops.dev/api/loop/3eef6efe-56a0-4193-99de-4972722a731c/upload`, {
      method: 'POST',
      body: formData
    })
    const output = await res.json()
    console.log('📎 Archivo subido:', output)
    return output.url
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !selectedFile) return

    const userMessage: Message = {
      text: inputMessage || `📎 Archivo enviado: ${selectedFile?.name}`,
      isUser: true,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    let fileUrl = ''
    if (selectedFile) {
      try {
        fileUrl = await uploadFile(selectedFile)
      } catch (uploadErr) {
        console.error('❌ Error al subir archivo:', uploadErr)
      }
      setSelectedFile(null)
    }

    try {
      const payload = {
        message: inputMessage,
        file: fileUrl // ← Asegura que coincida con lo que espera MagicLoops
      }

      console.log('📤 Enviando a MagicLoops:', payload)

      const triggerRes = await fetch('https://magicloops.dev/api/loop/3eef6efe-56a0-4193-99de-4972722a731c/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      })

      const responseText = await triggerRes.text()
      console.log('📥 Respuesta cruda:', responseText)

      let responseData: any
      try {
        responseData = JSON.parse(responseText)
      } catch {
        responseData = responseText
      }

      let botResponse = ''

      if (responseData === 'none') {
        botResponse = "¡Hola! ¿Cómo estás? Estoy aquí para ayudarte con cualquier pregunta o conversación que quieras tener. ¿En qué puedo asistirte hoy?"
      } else if (typeof responseData === 'object' && responseData !== null) {
        botResponse =
          responseData.response ||
          responseData.message ||
          responseData.answer ||
          responseData.text ||
          responseData.$CHATBOT_RESPONSE ||
          "⚠️ El asistente no devolvió una respuesta clara."
      } else if (typeof responseData === 'string') {
        botResponse = responseData
      } else {
        botResponse = '⚠️ Formato de respuesta no reconocido:\n' + JSON.stringify(responseData, null, 2)
      }

      const botMessage: Message = {
        text: botResponse,
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('❌ Error en handleSendMessage:', error)
      const errorMessage: Message = {
        text: `❌ Error al procesar el mensaje: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.isUser
                  ? 'bg-fuchsia-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-3 bg-gray-100">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-fuchsia-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-fuchsia-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 bg-fuchsia-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4 bg-white">
        <div className="flex items-center space-x-2">
          <label className="cursor-pointer">
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
            <Paperclip className="text-gray-500 hover:text-fuchsia-600" />
          </label>
          <Input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
            size="icon"
            disabled={isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {selectedFile && (
          <div className="mt-2 text-sm text-gray-500">
            Archivo seleccionado: {selectedFile.name}
          </div>
        )}
      </div>
    </div>
  )
}
