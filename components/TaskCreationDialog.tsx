import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarIcon, PlusCircleIcon } from 'lucide-react'
import { format } from 'date-fns'
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Milestone, Task } from '@/types/project'

interface TaskCreationDialogProps {
  milestones: Milestone[]
  onCreateTask: (task: Task) => void
}

export function TaskCreationDialog({ milestones, onCreateTask }: TaskCreationDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [task, setTask] = useState<Task>({
    id: '',
    title: '',
    milestone: '',
    startDate: new Date(),
    endDate: new Date(),
    priority: '',
    assignee: '',
    project: 'Performance Marketing "Ads" - ...',
    follower: '',
    checklist: '',
    tags: '',
    description: '',
    billable: false,
    visibleToClient: false,
    status: 'Offen'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTask({ ...task, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (name: string) => (value: string) => {
    setTask({ ...task, [name]: value })
  }

  const handleCheckboxChange = (name: string) => (checked: boolean) => {
    setTask({ ...task, [name]: checked })
  }

  const handleDateChange = (name: string) => (date: Date | undefined) => {
    if (date) {
      setTask({ ...task, [name]: date })
    }
  }

  const handleSubmit = () => {
    if (!task.title.trim()) {
      alert('Aufgabenname ist erforderlich');
      return;
    }
    const newTask = { ...task, id: `t${Date.now()}` }
    onCreateTask(newTask)
    setIsOpen(false)
    setTask({
      id: '',
      title: '',
      milestone: '',
      startDate: new Date(),
      endDate: new Date(),
      priority: '',
      assignee: '',
      project: 'Performance Marketing "Ads" - ...',
      follower: '',
      checklist: '',
      tags: '',
      description: '',
      billable: false,
      visibleToClient: false,
      status: 'Offen'
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircleIcon className="mr-2 h-4 w-4" />
          Aufgabe erstellen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px] bg-white">
        <DialogHeader>
          <DialogTitle>Neu hinzufügen</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="billable"
              checked={task.billable}
              onCheckedChange={handleCheckboxChange('billable')}
            />
            <label htmlFor="billable" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Abrechenbar
            </label>
            <Checkbox
              id="visibleToClient"
              checked={task.visibleToClient}
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
              value={task.title}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="milestone" className="text-right">
              Meilenstein
            </Label>
            <Select onValueChange={handleSelectChange('milestone')}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Meilenstein auswählen" />
              </SelectTrigger>
              <SelectContent>
                {milestones.map((milestone) => (
                  <SelectItem key={milestone.id} value={milestone.id}>
                    {milestone.name}
                  </SelectItem>
                ))}
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
                    !task.startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {task.startDate ? format(task.startDate, "PPP") : <span>Datum auswählen</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white">
                <Calendar
                  mode="single"
                  selected={task.startDate}
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
                    !task.endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {task.endDate ? format(task.endDate, "PPP") : <span>Datum auswählen</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white">
                <Calendar
                  mode="single"
                  selected={task.endDate}
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
            <Select onValueChange={handleSelectChange('priority')}>
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
            <Select onValueChange={handleSelectChange('assignee')}>
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
            <Label htmlFor="project" className="text-right">
              Projekt
            </Label>
            <Input
              id="project"
              name="project"
              value={task.project}
              onChange={handleChange}
              className="col-span-3"
              disabled
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="follower" className="text-right">
              Follower
            </Label>
            <Select onValueChange={handleSelectChange('follower')}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Follower auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user1">User 1</SelectItem>
                <SelectItem value="user2">User 2</SelectItem>
                <SelectItem value="user3">User 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="checklist" className="text-right">
              Checklistenvorlagen anfügen
            </Label>
            <Select onValueChange={handleSelectChange('checklist')}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Vorlage auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="template1">Vorlage 1</SelectItem>
                <SelectItem value="template2">Vorlage 2</SelectItem>
                <SelectItem value="template3">Vorlage 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tags" className="text-right">
              Tags
            </Label>
            <Input
              id="tags"
              name="tags"
              value={task.tags}
              onChange={handleChange}
              className="col-span-3"
              placeholder="Tags eingeben"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Beschreibung
            </Label>
            <Textarea
              id="description"
              name="description"
              value={task.description}
              onChange={handleChange}
              className="col-span-3"
              placeholder="Beschreibung hinzufügen"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>Schließen</Button>
          <Button onClick={handleSubmit}>Speichern</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}