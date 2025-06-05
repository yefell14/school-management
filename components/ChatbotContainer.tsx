"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MessageSquare, Bot } from "lucide-react"
import ChatBot from "@/components/ChatBot"
import ChatBot1 from "@/components/ChatBot1"

export default function ChatbotContainer() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeBot, setActiveBot] = useState<"chatbot" | "chatbot1">("chatbot")

  const handleBotChange = (bot: "chatbot" | "chatbot1") => {
    setActiveBot(bot)
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <div className="fixed bottom-4 md:bottom-6 right-4 md:right-6 z-50">
          <div className="relative">
            <div className="absolute inset-0 rounded-full border-2 border-yellow-400 animate-ping"></div>
            <div className="absolute inset-0 rounded-full border-2 border-yellow-400 animate-pulse"></div>
            <Button
              onClick={() => setIsOpen(true)}
              className="relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg border-2 border-yellow-400 transition-all duration-300 hover:scale-110 p-1"
            >
              <MessageSquare className="w-6 h-6 md:w-8 md:h-8" />
            </Button>
          </div>
        </div>
      )}

      {/* Chat Window with Navigation */}
      {isOpen && (
        <Card className="fixed bottom-4 md:bottom-6 right-4 md:right-6 w-72 md:w-80 h-[500px] shadow-2xl z-50 flex flex-col overflow-hidden">
          {/* Mini Navigation */}
          <div className="flex items-center justify-between p-2 border-b bg-gradient-to-r from-blue-600 to-blue-700">
            <Button
              variant={activeBot === "chatbot" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleBotChange("chatbot")}
              className="flex-1 text-white hover:text-blue-900"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat General
            </Button>
            <Button
              variant={activeBot === "chatbot1" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleBotChange("chatbot1")}
              className="flex-1 text-white hover:text-blue-900"
            >
              <img
                src="/images/chatbot-icon.gif"
                alt="Angelita"
                className="w-4 h-4 mr-2 rounded-full"
              />
              Angelita
            </Button>
          </div>

          {/* Active Chatbot */}
          <div className="flex-1 overflow-hidden">
            {activeBot === "chatbot" ? (
              <ChatBot />
            ) : (
              <ChatBot1 setIsChatbotOpen={() => {}} />
            )}
          </div>

          {/* Close Button */}
          <div className="p-2 border-t bg-white">
            <Button
              onClick={() => setIsOpen(false)}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Cerrar Chat
            </Button>
          </div>
        </Card>
      )}
    </>
  )
} 