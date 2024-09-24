import React, { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export function EmployeeAllocation({ project, onUpdate }) {
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [selectedTask, setSelectedTask] = useState('')

  const handleAllocate = () => {
    if (selectedEmployee && selectedTask) {
      const updatedProject = {
        ...project,
        milestones: project.milestones.map(milestone => ({
          ...milestone,
          tasks: milestone.tasks.map(task => 
            task.id === selectedTask ? { ...task, assignee: selectedEmployee } : task
          )
        }))
      }
      onUpdate(updatedProject)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Mitarbeiter zuweisen</h2>
      <Select onValueChange={setSelectedEmployee}>
        <SelectTrigger>
          <SelectValue placeholder="Mitarbeiter auswählen" />
        </SelectTrigger>
        <SelectContent>
          {/* Mitarbeiterliste hier einfügen */}
          <SelectItem value="employee1">Max Mustermann</SelectItem>
          <SelectItem value="employee2">Erika Musterfrau</SelectItem>
        </SelectContent>
      </Select>
      <Select onValueChange={setSelectedTask}>
        <SelectTrigger>
          <SelectValue placeholder="Aufgabe auswählen" />
        </SelectTrigger>
        <SelectContent>
          {project.milestones.flatMap(milestone => 
            milestone.tasks.map(task => (
              <SelectItem key={task.id} value={task.id}>{task.title}</SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      <Button onClick={handleAllocate}>Zuweisen</Button>
    </div>
  )
}