import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type NewMessageDialogProps = {
  isOpen: boolean
  onClose: () => void
  onCreateConversation: (conversation: { id: string; name: string; type: 'individual' | 'group' }) => void
}

export function NewMessageDialog({ isOpen, onClose, onCreateConversation }: NewMessageDialogProps) {
  const [conversationName, setConversationName] = useState('')
  const [conversationType, setConversationType] = useState<'individual' | 'group'>('individual')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (conversationName) {
      onCreateConversation({
        id: Date.now().toString(),
        name: conversationName,
        type: conversationType,
      })
      setConversationName('')
      setConversationType('individual')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">Neue Konversation erstellen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="conversationName" className="text-gray-900 dark:text-gray-100">Name</Label>
            <Input
              id="conversationName"
              value={conversationName}
              onChange={(e) => setConversationName(e.target.value)}
              placeholder="Konversationsname oder Benutzername"
              className="text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="conversationType" className="text-gray-900 dark:text-gray-100">Konversationstyp</Label>
            <Select value={conversationType} onValueChange={(value: 'individual' | 'group') => setConversationType(value)}>
              <SelectTrigger id="conversationType" className="text-gray-900 dark:text-gray-100">
                <SelectValue placeholder="Wählen Sie den Konversationstyp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Einzelgespräch</SelectItem>
                <SelectItem value="group">Gruppe</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} className="text-gray-900 dark:text-gray-100">
              Abbrechen
            </Button>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">Erstellen</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

