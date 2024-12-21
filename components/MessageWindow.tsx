'use client'

import { useState, useEffect, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Check, CheckCheck } from 'lucide-react'
import { UserResource } from '@clerk/types'
import { fetchMessages, sendMessage, markAllMessagesAsRead } from '@/app/actions/messageActions'
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
    id: string;
    name: string;
    imageUrl?: string;
    email: string;
    hasNewMessages?: boolean;
  }
  currentUser: UserResource
  onMessageSent: () => void
  onMessagesRead: () => void
}

export function MessageWindow({ conversation, currentUser, onMessageSent, onMessagesRead }: MessageWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const windowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchAndSetMessages()
    const markAsRead = () => {
      markAllMessagesAsRead(currentUser.id, conversation.id)
      onMessagesRead()
    }
    markAsRead()
    windowRef.current?.addEventListener('focus', markAsRead)
    return () => {
      windowRef.current?.removeEventListener('focus', markAsRead)
    }
  }, [conversation.id, currentUser.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleMessage = (message: any) => {
    if (message.name === "new-message") {
      const newMessage = message.data as Message
      setMessages(prevMessages => {
        if (!prevMessages.some(msg => msg.id === newMessage.id)) {
          return [...prevMessages, newMessage]
        }
        return prevMessages
      })
      if (newMessage.receiverId === currentUser.id) {
        markAllMessagesAsRead(currentUser.id, conversation.id)
        onMessagesRead()
      }
    } else if (message.name === "messages-read") {
      const { readerId, messageIds } = message.data
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          messageIds.includes(msg.id) ? { ...msg, read: true } : msg
        )
      )
    }
  }

  // Subscribe to the conversation partner's channel
  useChannel(`conversation:${conversation.id}`, handleMessage)

  // Subscribe to the current user's channel
  useChannel(`conversation:${currentUser.id}`, handleMessage)

  const fetchAndSetMessages = async () => {
    try {
      const fetchedMessages = await fetchMessages(currentUser.id, conversation.id)
      setMessages(fetchedMessages)
      
      // Mark messages as read if there are any unread ones
      const hasUnreadMessages = fetchedMessages.some(
        msg => !msg.read && msg.receiverId === currentUser.id
      )
      if (hasUnreadMessages) {
        await markAllMessagesAsRead(currentUser.id, conversation.id)
        onMessagesRead()
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (inputMessage.trim()) {
      try {
        const messageToSend = inputMessage
        setInputMessage('')
        await sendMessage(messageToSend, currentUser.id, conversation.id)
        onMessageSent()
      } catch (error) {
        console.error('Error sending message:', error)
      }
    }
  }

  return (
    <div ref={windowRef} className="flex flex-col h-full bg-white dark:bg-gray-900" tabIndex={0}>
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
              className={`flex ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${message.senderId === currentUser.id
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

