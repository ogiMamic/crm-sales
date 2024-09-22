import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Task } from '@/types/project'

interface TaskDetailDialogProps {
  task: Task
  onClose: () => void
  onUpdate: (task: Task) => void
}

export function TaskDetailDialog({ task, onClose, onUpdate }: TaskDetailDialogProps) {
  const [editedTask, setEditedTask] = useState<Task>(task)

  useEffect(() => {
    setEditedTask(task)
  }, [task])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditedTask({ ...editedTask, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (name: string) => (value: string) => {
    setEditedTask({ ...editedTask, [name]: value })
  }

  const handleCheckboxChange = (name: string) => (checked: boolean) => {
    setEditedTask({ ...editedTask, [name]: checked })
  }

  const handleDateChange = (name: string) => (date: Date | undefined) => {
    if (date) {
      setEditedTask({ ...editedTask, [name]: date })
    }
  }

  const handleSubmit = () => {
    if (!editedTask.title.trim()) {
      alert('Aufgabenname ist erforderlich');
      return;
    }
    onUpdate(editedTask)
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
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
              Betreff *
            </Label>
            <Input
              id="title"
              name="title"
              value={editedTask.title}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select onValueChange={handleSelectChange('status')} value={editedTask.status}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Status auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Offen">Offen</SelectItem>
                <SelectItem value="In Bearbeitung">In Bearbeitung</SelectItem>
                <SelectItem value="Abgeschlossen">Abgeschlossen</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDate" className="text-right">
              Startdatum
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !editedTask.startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {editedTask.startDate ? format(editedTask.startDate, "PPP") : <span>Datum auswählen</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white">
                <Calendar
                  mode="single"
                  selected={editedTask.startDate}
                  onSelect={handleDateChange('startDate')}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endDate" className="text-right">
              Enddatum
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !editedTask.endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {editedTask.endDate ? format(editedTask.endDate, "PPP") : <span>Datum auswählen</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white">
                <Calendar
                  mode="single"
                  selected={editedTask.endDate}
                  onSelect={handleDateChange('endDate')}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="priority" className="text-right">
              Priorität
            </Label>
            <Select onValueChange={handleSelectChange('priority')} value={editedTask.priority}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Priorität auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Niedrig</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="High">Hoch</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="assignee" className="text-right">
              Zuständig
            </Label>
            <Select onValueChange={handleSelectChange('assignee')} value={editedTask.assignee}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Zuständigen auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user1">User 1</SelectItem>
                <SelectItem value="user2">User 2</SelectItem>
                <SelectItem value="user3">User 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
              placeholder="Beschreibung hinzufügen"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Schließen</Button>
          <Button onClick={handleSubmit}>Speichern</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}