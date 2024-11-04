import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarIcon, ClockIcon, UserIcon, TagIcon, PaperclipIcon, PlayIcon, PauseIcon, StopIcon } from 'lucide-react'
import { format } from 'date-fns'
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Task } from '@/types/project'

interface TaskDetailDialogProps {
  task: Task
  onClose: () => void
  onUpdate: (task: Task) => void
}

export function TaskDetailDialog({ task, onClose, onUpdate }: TaskDetailDialogProps) {
  const [editedTask, setEditedTask] = useState<Task>(task)
  const [newComment, setNewComment] = useState("")
  const [isTracking, setIsTracking] = useState(false)
  const [trackingStart, setTrackingStart] = useState<Date | null>(null)

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

  const handleAddComment = () => {
    if (newComment.trim()) {
      const updatedTask = {
        ...editedTask,
        comments: [
          ...editedTask.comments,
          {
            id: `c${Date.now()}`,
            author: "Current User", // Replace with actual user data
            content: newComment,
            createdAt: new Date(),
          },
        ],
      }
      setEditedTask(updatedTask)
      setNewComment("")
    }
  }

  const handleStartTracking = () => {
    setIsTracking(true)
    setTrackingStart(new Date())
  }

  const handleStopTracking = () => {
    if (trackingStart) {
      const timeSpent = Math.round((new Date().getTime() - trackingStart.getTime()) / 60000)
      setEditedTask({
        ...editedTask,
        timeSpent: (editedTask.timeSpent || 0) + timeSpent,
      })
    }
    setIsTracking(false)
    setTrackingStart(null)
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real application, you would upload the file to a server here
      // and get back a URL. For this example, we'll just use a fake URL.
      const newAttachment = {
        id: `a${Date.now()}`,
        name: file.name,
        url: URL.createObjectURL(file),
      }
      setEditedTask({
        ...editedTask,
        attachments: [...editedTask.attachments, newAttachment],
      })
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
      <DialogContent className="sm:max-w-[700px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{editedTask.title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex items-start space-x-4">
            <div className="flex-grow">
              <Label htmlFor="title" className="font-medium">
                Betreff
              </Label>
              <Input
                id="title"
                name="title"
                value={editedTask.title}
                onChange={handleChange}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="status" className="font-medium">
                Status
              </Label>
              <Select onValueChange={handleSelectChange('status')} value={editedTask.status}>
                <SelectTrigger className="mt-1 w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Offen">Offen</SelectItem>
                  <SelectItem value="In Bearbeitung">In Bearbeitung</SelectItem>
                  <SelectItem value="Abgeschlossen">Abgeschlossen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="font-medium">
              Beschreibung
            </Label>
            <Textarea
              id="description"
              name="description"
              value={editedTask.description}
              onChange={handleChange}
              className="mt-1"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-medium">Startdatum</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
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
            <div>
              <Label className="font-medium">Enddatum</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority" className="font-medium">
                Priorität
              </Label>
              <Select onValueChange={handleSelectChange('priority')} value={editedTask.priority}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Priorität auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Niedrig</SelectItem>
                  <SelectItem value="Medium">Normal</SelectItem>
                  <SelectItem value="High">Hoch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="assignee" className="font-medium">
                Zuständig
              </Label>
              <Select onValueChange={handleSelectChange('assignee')} value={editedTask.assignee}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Zuständigen auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="John Doe">John Doe</SelectItem>
                  <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                  <SelectItem value="Alice Johnson">Alice Johnson</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="billable"
              checked={editedTask.billable}
              onCheckedChange={handleCheckboxChange('billable')}
            />
            <label htmlFor="billable" className="text-sm font-medium">
              Abrechenbar
            </label>
            <Checkbox
              id="visibleToClient"
              checked={editedTask.visibleToClient}
              onCheckedChange={handleCheckboxChange('visibleToClient')}
            />
            <label htmlFor="visibleToClient" className="text-sm font-medium">
              Für Kunde sichtbar
            </label>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Zeiterfassung</h3>
            <div className="flex items-center space-x-2">
              <p>Gesamtzeit: {formatTime(editedTask.timeSpent || 0)}</p>
              {!isTracking ? (
                <Button onClick={handleStartTracking} size="sm">
                  <PlayIcon className="w-4 h-4 mr-1" /> Start
                </Button>
              ) : (
                <>
                  <Button onClick={() => setIsTracking(false)} size="sm" variant="outline">
                    <PauseIcon className="w-4 h-4 mr-1" /> Pause
                  </Button>
                  <Button onClick={handleStopTracking} size="sm" variant="destructive">
                    <StopIcon className="w-4 h-4 mr-1" /> Stop
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Anhänge</h3>
            <div className="space-y-2">
              {editedTask.attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center space-x-2">
                  <PaperclipIcon className="w-4 h-4" />
                  <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {attachment.name}
                  </a>
                </div>
              ))}
            </div>
            <div className="mt-2">
              <Input type="file" onChange={handleFileUpload} />
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Kommentare</h3>
            <div className="space-y-4 max-h-60 overflow-y-auto mb-4">
              {editedTask.comments.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback>{comment.author[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{comment.author}</p>
                    <p className="text-sm text-gray-500">{format(comment.createdAt, "PPp")}</p>
                    <p className="mt-1">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Kommentar hinzufügen..."
                className="flex-grow"
              />
              <Button onClick={handleAddComment}>Senden</Button>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>Schließen</Button>
            <Button onClick={handleSubmit}>Speichern</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}