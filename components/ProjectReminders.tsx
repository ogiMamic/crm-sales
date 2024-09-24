import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"

export function ProjectReminders({ project, onUpdate }) {
  const [newReminder, setNewReminder] = useState({ text: '', date: new Date() })

  const handleAddReminder = () => {
    if (newReminder.text) {
      const updatedProject = {
        ...project,
        reminders: [...project.reminders, { ...newReminder, id: Date.now() }]
      }
      onUpdate(updatedProject)
      setNewReminder({ text: '', date: new Date() })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input 
          placeholder="Neue Erinnerung" 
          value={newReminder.text}
          onChange={(e) => setNewReminder({...newReminder, text: e.target.value})}
        />
        <Calendar 
          selected={newReminder.date}
          onSelect={(date) => setNewReminder({...newReminder, date})}
        />
        <Button onClick={handleAddReminder}>Hinzufügen</Button>
      </div>
      <div className="space-y-2">
        {project.reminders.map((reminder) => (
          <div key={reminder.id} className="flex justify-between items-center border p-2 rounded">
            <span>{reminder.text}</span>
            <span>{reminder.date.toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}