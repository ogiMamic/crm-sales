'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useChannel } from "@ably-labs/react-hooks"

type Conversation = {
  id: string;
  name: string;
  imageUrl?: string;
  email: string;
  hasNewMessages?: boolean;
}

type MessageListProps = {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
}

export function MessageList({ conversations: initialConversations, selectedConversation, onSelectConversation }: MessageListProps) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)

  useEffect(() => {
    setConversations(initialConversations)
  }, [initialConversations])

  useChannel("user-notifications", "new-message", (message) => {
    const { senderId } = message.data
    setConversations(prevConversations => 
      prevConversations.map(conv => 
        conv.id === senderId ? { ...conv, hasNewMessages: true } : conv
      )
    )
  })

  const handleSelectConversation = (conversation: Conversation) => {
    onSelectConversation(conversation)
    setConversations(prevConversations => 
      prevConversations.map(conv => 
        conv.id === conversation.id ? { ...conv, hasNewMessages: false } : conv
      )
    )
  }

  return (
    <ul className="space-y-2">
      {conversations.map((conversation) => (
        <li
          key={conversation.id}
          className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors duration-150 ${
            selectedConversation?.id === conversation.id
              ? 'bg-gray-100 dark:bg-gray-700'
              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
          onClick={() => handleSelectConversation(conversation)}
        >
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={conversation.imageUrl} alt={conversation.name} />
            <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-200">
              {conversation.name}
            </span>
            <p className="text-xs text-gray-600 dark:text-gray-300">{conversation.email}</p>
          </div>
          {conversation.hasNewMessages && (
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          )}
        </li>
      ))}
    </ul>
  )
}

