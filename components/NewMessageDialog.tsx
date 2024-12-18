import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Conversation = {
  id: string;
  name: string;
  imageUrl?: string;
  email: string;
}

type NewMessageDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreateConversation: (conversation: Conversation) => void;
}

export function NewMessageDialog({ isOpen, onClose, onCreateConversation }: NewMessageDialogProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name && email) {
      onCreateConversation({
        id: Date.now().toString(), // Ovo je privremeni ID. U pravoj aplikaciji, dobili biste ga sa backend-a.
        name,
        email,
      })
      setName('')
      setEmail('')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Započni novu konverzaciju</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">
                Ime
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email" className="text-right">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Započni konverzaciju</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

