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
        <div key={milestone.id} className="w-72 flex-shrink-0">
          <Card className="bg-white h-full">
            <CardHeader className="pb-2" style={{ backgroundColor: milestone.color }}>
              <CardTitle className="text-lg">{milestone.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {milestone.tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-gray-100 p-2 mb-2 rounded cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => onTaskClick(task)}
                >
                  {task.title}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}