'use client'

import { useState, useEffect } from 'react'
import { useUser } from "@clerk/nextjs"
import { MessageList } from '@/components/MessageList'
import { MessageWindow } from '@/components/MessageWindow'
import { NewMessageDialog } from '@/components/NewMessageDialog'
import { Button } from "@/components/ui/button"
import { PlusCircle } from 'lucide-react'

// Define the Conversation type
type Conversation = {
  id: string;
  name: string;
  type: 'individual' | 'group';
}

export default function MessagesPage() {
  const { user, isLoaded } = useUser()
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isNewMessageDialogOpen, setIsNewMessageDialogOpen] = useState(false)

  useEffect(() => {
    if (user) {
      // Konversationen des Benutzers abrufen
      fetchConversations()
    }
  }, [user])

  const fetchConversations = async () => {
    // TODO: API-Aufruf implementieren, um die Konversationen des Benutzers abzurufen
    // Vorerst verwenden wir Beispieldaten
    setConversations([
      { id: '1', name: 'Alice', type: 'individual' },
      { id: '2', name: 'Projektgruppe', type: 'group' },
      { id: '3', name: 'Bob', type: 'individual' },
    ])
  }

  if (!isLoaded) {
    return <div className="text-gray-900 dark:text-gray-100">Laden...</div>
  }

  if (!user) {
    return <div className="text-gray-900 dark:text-gray-100">Bitte melden Sie sich an, um auf Ihre Nachrichten zuzugreifen.</div>
  }

  return (
    <div className="container mx-auto py-6 px-4 bg-white dark:bg-gray-900">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Nachrichten</h1>
      <div className="flex h-[calc(100vh-200px)] bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
        <div className="w-1/4 pr-4 border-r border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Konversationen</h2>
            <Button onClick={() => setIsNewMessageDialogOpen(true)} className="bg-blue-500 hover:bg-blue-600 text-white">
              <PlusCircle className="h-4 w-4 mr-2" />
              Neu
            </Button>
          </div>
          <MessageList 
            conversations={conversations} 
            selectedConversation={selectedConversation} 
            onSelectConversation={setSelectedConversation} 
          />
        </div>
        <div className="w-3/4 pl-4">
          {selectedConversation ? (
            <MessageWindow conversation={selectedConversation} currentUser={user} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-700 dark:text-gray-300">
              Wählen Sie eine Konversation aus oder beginnen Sie eine neue.
            </div>
          )}
        </div>
      </div>
      <NewMessageDialog 
        isOpen={isNewMessageDialogOpen} 
        onClose={() => setIsNewMessageDialogOpen(false)}
        onCreateConversation={(newConversation) => {
          setConversations([...conversations, newConversation])
          setSelectedConversation(newConversation)
          setIsNewMessageDialogOpen(false)
        }}
      />
    </div>
  )
}

