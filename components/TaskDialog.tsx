import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Task } from '@/types/project'

export function TaskDialog({ isOpen, onClose, task, onUpdate }: { isOpen: boolean, onClose: () => void, task: Task | null, onUpdate: (task: Task) => void }) {
  const [editedTask, setEditedTask] = useState<Task | null>(null)

  useEffect(() => {
    setEditedTask(task)
  }, [task])

  if (!editedTask) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditedTask({ ...editedTask, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (name: string) => (value: string) => {
    setEditedTask({ ...editedTask, [name]: value })
  }

  const handleCheckboxChange = (name: string) => (checked: boolean) => {
    setEditedTask({ ...editedTask, [name]: checked })
  }

  const handleSave = () => {
    onUpdate(editedTask)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px] bg-white">
        <DialogHeader>
          <DialogTitle>Aufgabe bearbeiten</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="billable"
              checked={editedTask.billable}
              onCheckedChange={handleCheckboxChange('billable')}
            />
            <label htmlFor="billable" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Abrechenbar
            </label>
            <Checkbox
              id="visibleToClient"
              checked={editedTask.visibleToClient}
              onCheckedChange={handleCheckboxChange('visibleToClient')}
            />
            <label htmlFor="visibleToClient" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Für Kunde sichtbar
            </label>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Betreff
            </Label>
            <Input
              id="title"
              name="title"
              value={editedTask.title}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          {/* Add other fields here (startDate, endDate, priority, assignee, etc.) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Beschreibung
            </Label>
            <Textarea
              id="description"
              name="description"
              value={editedTask.description}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Schließen</Button>
          <Button onClick={handleSave}>Speichern</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}