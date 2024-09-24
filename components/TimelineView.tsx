import React from 'react'
import { format, differenceInDays, addDays } from 'date-fns'
import { Project, Milestone, Task } from '@/types/project'

interface TimelineViewProps {
  project: Project
}

export function TimelineView({ project }: TimelineViewProps) {
  const startDate = new Date(project.startDate)
  const endDate = new Date(project.endDate)
  const totalDays = differenceInDays(endDate, startDate) + 1

  const getPositionPercentage = (date: Date) => {
    const daysDiff = differenceInDays(date, startDate)
    return (daysDiff / totalDays) * 100
  }

  return (
    <div className="relative mt-8 mb-16">
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-200"></div>
      <div className="absolute top-2 left-0 w-full flex justify-between text-sm text-gray-500">
        <span>{format(startDate, 'MMM d')}</span>
        <span>{format(endDate, 'MMM d')}</span>
      </div>
      {project.milestones.map((milestone) => (
        <div
          key={milestone.id}
          className="absolute top-6 h-6 bg-blue-500 rounded"
          style={{
            left: `${getPositionPercentage(milestone.startDate)}%`,
            width: `${getPositionPercentage(milestone.endDate) - getPositionPercentage(milestone.startDate)}%`,
          }}
        >
          <span className="absolute -top-6 left-0 text-xs font-medium">{milestone.name}</span>
        </div>
      ))}
      {project.milestones.flatMap((milestone) =>
        milestone.tasks.map((task) => (
          <div
            key={task.id}
            className="absolute top-14 h-4 bg-green-500 rounded"
            style={{
              left: `${getPositionPercentage(task.startDate)}%`,
              width: `${getPositionPercentage(task.endDate) - getPositionPercentage(task.startDate)}%`,
            }}
          >
            <span className="absolute -top-4 left-0 text-xs">{task.title}</span>
          </div>
        ))
      )}
    </div>
  )
}