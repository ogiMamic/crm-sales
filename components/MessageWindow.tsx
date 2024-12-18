'use client'

import { useState, useEffect, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Check, CheckCheck } from 'lucide-react'
import { UserResource } from '@clerk/types'
import { fetchMessages, sendMessage, markMessageAsRead } from '@/app/actions/messageActions'
import { useChannel } from "@ably-labs/react-hooks"

type Message = {
  id: string
  content: string
  senderId: string
  receiverId: string
  timestamp: Date
  read: boolean
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

  useChannel(`conversation:${conversation.id}`, "new-message", (message) => {
    setMessages(prevMessages => [...prevMessages, message.data]);
    if (message.data.receiverId === currentUser.id) {
      markMessageAsRead(message.data.id);
    }
  });

  const fetchAndSetMessages = async () => {
    try {
      const fetchedMessages = await fetchMessages(currentUser.id, conversation.id)
      console.log("Fetched messages:", fetchedMessages) // Debug log
      setMessages(fetchedMessages)
      // Mark all received messages as read
      fetchedMessages.forEach(message => {
        if (message.receiverId === currentUser.id && !message.read) {
          markMessageAsRead(message.id);
        }
      });
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (inputMessage.trim()) {
      try {
        const newMessage = await sendMessage(inputMessage, currentUser.id, conversation.id)
        setMessages(prevMessages => [...prevMessages, newMessage])
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
        {messages.length === 0 ? (
          <p className="text-center text-gray-500">No messages yet</p>
        ) : (
          messages.map((message) => (
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
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                  {message.senderId === currentUser.id && (
                    <span className="text-xs">
                      {message.read ? <CheckCheck size={16} /> : <Check size={16} />}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
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

