import React from 'react'
import { Droppable, Draggable } from 'react-beautiful-dnd'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Milestone, Task } from '@/types/project'

interface MilestoneBoardProps {
  milestones: Milestone[]
  onTaskClick: (task: Task) => void
}

export function MilestoneBoard({ milestones, onTaskClick }: MilestoneBoardProps) {
  return (
    <div className="flex space-x-4 overflow-x-auto pb-4">
      {milestones.map((milestone) => (
        <Droppable key={milestone.id} droppableId={milestone.id}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="w-72 flex-shrink-0"
            >
              <Card className="bg-white h-full">
                <CardHeader className="pb-2 bg-gray-100">
                  <CardTitle className="text-lg font-medium">{milestone.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {milestone.tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white p-3 mb-2 mt-2 rounded shadow-sm border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => onTaskClick(task)}
                        >
                          <h3 className="font-medium mb-1">{task.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{task.priority}</span>
                            <span>{task.assignee}</span>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </CardContent>
              </Card>
            </div>
          )}
        </Droppable>
      ))}
    </div>
  )
}