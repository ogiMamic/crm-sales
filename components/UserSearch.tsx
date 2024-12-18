'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getClerkUsers } from '@/app/actions/getClerkUsers'

type User = {
  id: string;
  name: string;
  imageUrl?: string;
  email: string;
}

type UserSearchProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: User) => void;
  currentUserId: string;
}

export function UserSearch({ isOpen, onClose, onSelectUser, currentUserId }: UserSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)
    if (term.length > 2) {
      const results = await getClerkUsers(term)
      setSearchResults(results.filter(user => user.id !== currentUserId))
    } else {
      setSearchResults([])
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Suche nach Benutzern</DialogTitle>
        </DialogHeader>
        <Input
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Geben Sie einen Namen oder eine E-Mail-Adresse ein"
          className="mb-4"
        />
        <ul className="space-y-2">
          {searchResults.map((user) => (
            <li 
              key={user.id}
              className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => onSelectUser(user)}
            >
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={user.imageUrl} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user.name}
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  )
}

