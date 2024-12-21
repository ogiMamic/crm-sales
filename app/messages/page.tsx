'use client'

import { useState, useEffect } from 'react'
import { useUser } from "@clerk/nextjs"
import { MessageList } from '@/components/MessageList'
import { MessageWindow } from '@/components/MessageWindow'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, X } from 'lucide-react'
import { getConversations } from '../actions/getConversations'
import { getClerkUsers } from '../actions/getClerkUsers'
import { useChannel } from "@ably-labs/react-hooks"
import { configureAbly } from '@ably-labs/react-hooks'

type Conversation = {
  id: string;
  name: string;
  imageUrl?: string;
  email: string;
  hasNewMessages?: boolean;
}

type User = {
  id: string;
  name: string;
  imageUrl?: string;
  email: string;
}

export default function MessagesPage() {
  const { user, isLoaded } = useUser()
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (user) {
      fetchConversations()
    }
  }, [user])

  configureAbly({ key: process.env.ABLY_API_KEY, authUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/createTokenRequest`, clientId: "crm-sales"})
  
  useChannel(`user:${user?.id}`, "new-message", (message) => {
    const { senderId } = message.data;
    setConversations(prevConversations => 
      prevConversations.map(conv => 
        conv.id === senderId ? { ...conv, hasNewMessages: true } : conv
      )
    );
  });

  const fetchConversations = async () => {
    if (user) {
      try {
        const userConversations = await getConversations(user.id)
        setConversations(userConversations)
      } catch (error) {
        console.error('Error fetching conversations:', error)
      }
    }
  }

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)
    setIsSearching(term.length > 0)
    if (term.length > 2) {
      const results = await getClerkUsers(term)
      setSearchResults(results.filter(searchUser => searchUser.id !== user?.id))
    } else {
      setSearchResults([])
    }
  }

  const handleSelectUser = (selectedUser: User) => {
    setSelectedConversation(selectedUser)
    setSearchTerm('')
    setIsSearching(false)
    fetchConversations()
  }

  const clearSearch = () => {
    setSearchTerm('')
    setIsSearching(false)
    setSearchResults([])
  }

  const handleMessagesRead = () => {
    if (selectedConversation) {
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === selectedConversation.id ? { ...conv, hasNewMessages: false } : conv
        )
      )
    }
  }

  if (!isLoaded) {
    return <div className="text-gray-900 dark:text-gray-200">Laden...</div>
  }

  if (!user) {
    return <div className="text-gray-900 dark:text-gray-200">Bitte melden Sie sich an, um auf Ihre Nachrichten zuzugreifen.</div>
  }

  return (
    <div className="container mx-auto py-6 px-4 bg-white dark:bg-gray-900">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-200">Nachrichten</h1>
      <div className="flex h-[calc(100vh-200px)] bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
        <div className="w-1/3 pr-4 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="mb-4 relative">
            <Input
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Suche nach Benutzern..."
              className="pl-10 pr-10 text-black"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            {isSearching && (
              <Button
                onClick={clearSearch}
                variant="ghost"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-auto"
              >
                <X size={20} />
              </Button>
            )}
          </div>
          <div className="overflow-y-auto flex-grow">
            {isSearching ? (
              <ul className="space-y-2">
                {searchResults.map((searchUser) => (
                  <li 
                    key={searchUser.id}
                    className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                    onClick={() => handleSelectUser(searchUser)}
                  >
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={searchUser.imageUrl} alt={searchUser.name} />
                      <AvatarFallback>{searchUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-200">
                        {searchUser.name}
                      </span>
                      <p className="text-xs text-gray-600 dark:text-gray-300">{searchUser.email}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <MessageList 
                conversations={conversations} 
                selectedConversation={selectedConversation} 
                onSelectConversation={(conv) => {
                  setSelectedConversation(conv)
                  setConversations(prevConversations => 
                    prevConversations.map(c => 
                      c.id === conv.id ? { ...c, hasNewMessages: false } : c
                    )
                  )
                }} 
              />
            )}
          </div>
        </div>
        <div className="w-2/3 pl-4">
          {selectedConversation ? (
            <MessageWindow 
              conversation={selectedConversation} 
              currentUser={user} 
              onMessageSent={fetchConversations} 
              onMessagesRead={handleMessagesRead}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-800 dark:text-gray-200">
              Wählen Sie eine Konversation aus oder suchen Sie nach einem Benutzer, um eine neue zu beginnen.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

