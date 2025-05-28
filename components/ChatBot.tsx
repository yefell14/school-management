"use client"

import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Paperclip } from 'lucide-react'
import { Button } from './ui/button'

interface Message {
  text: string
  isUser: boolean
  timestamp: Date
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
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
    const res = await fetch(`https://magicloops.dev/api/loop/1960adb6-d743-4f79-97e1-3f1177337b71/upload`, {
      method: 'POST',
      body: formData
    })
    const output = await res.json()
    return output.url
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() && !selectedFile) return

    const newMessage: Message = {
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
    setInputMessage('')

    let fileUrl = ''
    if (selectedFile) {
      fileUrl = await uploadFile(selectedFile)
      setSelectedFile(null)
    }

    try {
      console.log('Sending request with:', {
        message: inputMessage,
        archivo: fileUrl
      })

      const triggerRes = await fetch('https://magicloops.dev/api/loop/1960adb6-d743-4f79-97e1-3f1177337b71/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          message: inputMessage,
          archivo: fileUrl
        }),
      })

      console.log('Response status:', triggerRes.status)
      const responseText = await triggerRes.text()
      console.log('Raw response:', responseText)

      let response
      try {
        response = JSON.parse(responseText)
        console.log('Parsed response:', response)
      } catch (e) {
        console.error('Error parsing response:', e)
        throw new Error('Invalid JSON response')
      }

      // Handle the response based on the API documentation
      let botResponse
      if (response === 'none') {
        // Si la API devuelve 'none', intentamos obtener la respuesta del CHATBOT_RESPONSE
        botResponse = "¡Hola! ¿Cómo estás? Estoy aquí para ayudarte con cualquier pregunta o conversación que quieras tener. ¿En qué puedo asistirte hoy?"
      } else if (typeof response === 'object' && response !== null) {
        // Si es un objeto JSON, buscamos la respuesta en las propiedades documentadas
        botResponse = response.response || response.message || "Lo siento, no pude procesar tu mensaje."
      } else {
        botResponse = "Lo siento, recibí una respuesta inesperada del servidor."
      }

      const botMessage: Message = {
        text: botResponse,
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error in sendMessage:', error)
      const errorMessage: Message = {
        text: "Lo siento, hubo un error al procesar tu mensaje.",
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-fuchsia-600 text-white rounded-full shadow-lg hover:bg-fuchsia-700 transition-all duration-300 flex items-center justify-center z-50"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-lg shadow-xl flex flex-col z-50">
          {/* Chat Header */}
          <div className="bg-fuchsia-600 text-white p-4 rounded-t-lg flex items-center">
            <MessageSquare className="mr-2" />
            <h3 className="font-semibold">Asistente Virtual</h3>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                  <p>{message.text}</p>
                  <span className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex items-center space-x-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Paperclip className="text-gray-500 hover:text-fuchsia-600" />
              </label>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Escribe un mensaje..."
                className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:border-fuchsia-600"
              />
              <Button
                onClick={sendMessage}
                className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-full p-2"
              >
                <Send size={20} />
              </Button>
            </div>
            {selectedFile && (
              <div className="mt-2 text-sm text-gray-500">
                Archivo seleccionado: {selectedFile.name}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
