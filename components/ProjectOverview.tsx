import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Project } from '@/types/project'

export function ProjectOverview({ project }: { project: Project }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Projekt Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-gray-200">
              <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium text-gray-900">Projekt #</dt>
                <dd className="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">{project.number}</dd>
              </div>
              <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium text-gray-900">Kunde</dt>
                <dd className="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">{project.client}</dd>
              </div>
              <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium text-gray-900">Budget</dt>
                <dd className="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">{project.currency}{project.budget}</dd>
              </div>
              <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium text-gray-900">Start Datum</dt>
                <dd className="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">{project.startDate}</dd>
              </div>
              <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium text-gray-900">Deadline</dt>
                <dd className="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">{project.endDate}</dd>
              </div>
              <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium text-gray-900">Status</dt>
                <dd className="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">{project.status}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Projekt Beschreibung</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">{project.description}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Aufgaben Fortschritt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={project.progress} className="w-full" />
              <div className="flex justify-between text-sm text-gray-700">
                <span>{project.tasksCompleted} / {project.totalTasks} Aufgaben</span>
                <span>{project.progress}% abgeschlossen</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Zeit Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={(project.timeSpent / project.totalTime) * 100} className="w-full" />
              <div className="flex justify-between text-sm text-gray-700">
                <span>{project.timeSpent} / {project.totalTime} Tage</span>
                <span>{Math.round((project.timeSpent / project.totalTime) * 100)}% verbraucht</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}