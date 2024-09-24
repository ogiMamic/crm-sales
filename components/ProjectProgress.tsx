import React from 'react'
import { Progress } from "@/components/ui/progress"

export function ProjectProgress({ project }) {
  const completedTasks = project.milestones.flatMap(m => m.tasks).filter(t => t.status === 'Abgeschlossen').length
  const totalTasks = project.milestones.flatMap(m => m.tasks).length
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span>Projektfortschritt</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} />
    </div>
  )
}