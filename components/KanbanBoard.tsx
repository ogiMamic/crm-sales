import { Droppable, Draggable } from 'react-beautiful-dnd'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Milestone, Task } from '@/types/project'

interface KanbanBoardProps {
  milestones: Milestone[]
  onTaskClick: (task: Task) => void
}

export function KanbanBoard({ milestones, onTaskClick }: KanbanBoardProps) {
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
                <CardHeader className="pb-2" style={{ backgroundColor: milestone.color }}>
                  <CardTitle className="text-lg">{milestone.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {milestone.tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-gray-100 p-2 mb-2 rounded cursor-pointer hover:bg-gray-200 transition-colors"
                          onClick={() => onTaskClick(task)}
                        >
                          {task.title}
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