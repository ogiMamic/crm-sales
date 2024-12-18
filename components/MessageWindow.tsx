'use client'

import { useState, useEffect, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from 'lucide-react'
import { UserResource } from '@clerk/types'

type Message = {
  id: string
  content: string
  sender: {
    id: string
    name: string
  }
  timestamp: Date
}

type MessageWindowProps = {
  conversation: {
    id: string
    name: string
  }
  currentUser: UserResource
}

export function MessageWindow({ conversation, currentUser }: MessageWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Nachrichten für die ausgewählte Konversation abrufen
    // Vorerst verwenden wir Beispieldaten
    setMessages([
      {
        id: '1',
        content: 'Hallo, wie geht es dir?',
        sender: { id: 'other', name: conversation.name },
        timestamp: new Date(Date.now() - 1000 * 60 * 5) // 5 Minuten zuvor
      },
      {
        id: '2',
        content: 'Mir geht es gut, danke! Und dir?',
        sender: { id: currentUser.id, name: currentUser.fullName || 'Unbekannt' },
        timestamp: new Date(Date.now() - 1000 * 60 * 4) // 4 Minuten zuvor
      }
    ])
  }, [conversation.id, currentUser.id, currentUser.fullName])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputMessage.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        content: inputMessage,
        sender: { id: currentUser.id, name: currentUser.fullName || 'Unbekannt' },
        timestamp: new Date()
      }
      setMessages([...messages, newMessage])
      setInputMessage('')
      // TODO: Implementieren Sie hier den API-Aufruf zum Senden der Nachricht
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${conversation.name}`} />
          <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">{conversation.name}</h2>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender.id === currentUser.id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender.id === currentUser.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
              }`}
            >
              <p>{message.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700 flex">
        <Input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Schreiben Sie eine Nachricht..."
          className="flex-1 mr-2 text-gray-900 dark:text-gray-100"
        />
        <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}

