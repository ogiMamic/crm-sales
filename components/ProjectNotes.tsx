import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function ProjectNotes({ project, onUpdate }) {
  const [newNote, setNewNote] = useState({ title: '', content: '' })

  const handleAddNote = () => {
    if (newNote.title && newNote.content) {
      const updatedProject = {
        ...project,
        notes: [...project.notes, { ...newNote, id: Date.now() }]
      }
      onUpdate(updatedProject)
      setNewNote({ title: '', content: '' })
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Input 
          placeholder="Notiz Titel" 
          value={newNote.title}
          onChange={(e) => setNewNote({...newNote, title: e.target.value})}
        />
      </div>
      <div>
        <Textarea 
          placeholder="Notiz Inhalt" 
          value={newNote.content}
          onChange={(e) => setNewNote({...newNote, content: e.target.value})}
        />
      </div>
      <Button onClick={handleAddNote}>Notiz hinzufügen</Button>
      <div className="space-y-2">
        {project.notes.map((note) => (
          <div key={note.id} className="border p-2 rounded">
            <h3 className="font-semibold">{note.title}</h3>
            <p>{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}