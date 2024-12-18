'use client'

import { useState, useEffect, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from 'lucide-react'
import { UserResource } from '@clerk/types'
import { fetchMessages, sendMessage } from '@/app/actions/messageActions'

type Message = {
  id: string
  content: string
  senderId: string
  timestamp: Date
}

type MessageWindowProps = {
  conversation: {
    id: string
    name: string
    imageUrl?: string
  }
  currentUser: UserResource
  onMessageSent: () => void
}

export function MessageWindow({ conversation, currentUser, onMessageSent }: MessageWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchAndSetMessages()
  }, [conversation.id, currentUser.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchAndSetMessages = async () => {
    const fetchedMessages = await fetchMessages(currentUser.id, conversation.id)
    setMessages(fetchedMessages)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (inputMessage.trim()) {
      try {
        console.log(conversation.id + " " + currentUser.id +" "+ inputMessage)

        const newMessage = await sendMessage(inputMessage, currentUser.id, conversation.id)

        setMessages([...messages, newMessage])
        setInputMessage('')
        onMessageSent()
      } catch (error) {
        console.error('Error sending message:', error)
      }
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={conversation.imageUrl} alt={conversation.name} />
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
              message.senderId === currentUser.id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.senderId === currentUser.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
              }`}
            >
              <p>{message.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {new Date(message.timestamp).toLocaleTimeString()}
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

