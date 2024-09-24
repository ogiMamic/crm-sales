'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function MessagesPage() {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState({ recipient: '', subject: '', content: '' })

  const handleSendMessage = () => {
    if (newMessage.recipient && newMessage.subject && newMessage.content) {
      setMessages([...messages, { ...newMessage, id: Date.now(), date: new Date() }])
      setNewMessage({ recipient: '', subject: '', content: '' })
    }
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Nachrichten</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Neue Nachricht</h2>
          <div className="space-y-4">
            <Input 
              placeholder="Empfänger" 
              value={newMessage.recipient}
              onChange={(e) => setNewMessage({...newMessage, recipient: e.target.value})}
            />
            <Input 
              placeholder="Betreff" 
              value={newMessage.subject}
              onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
            />
            <Textarea 
              placeholder="Nachricht" 
              value={newMessage.content}
              onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
            />
            <Button onClick={handleSendMessage}>Senden</Button>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Empfangene Nachrichten</h2>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="border p-4 rounded">
                <p className="font-semibold">{message.subject}</p>
                <p className="text-sm text-gray-500">Von: {message.recipient}</p>
                <p className="text-sm text-gray-500">{message.date.toLocaleString()}</p>
                <p className="mt-2">{message.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}