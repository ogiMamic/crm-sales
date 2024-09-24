'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DragDropContext, DropResult } from 'react-beautiful-dnd'

import { ProjectOverview } from '@/components/ProjectOverview'
import { MilestoneBoard } from '@/components/MilestoneBoard'
import { TaskCreationDialog } from '@/components/TaskCreationDialog'
import { TaskDetailDialog } from '@/components/TaskDetailDialog'
import { TimelineView } from '@/components/TimelineView'
import { EmployeeAllocation } from '@/components/EmployeeAllocation'
import { ProjectNotes } from '@/components/ProjectNotes'
import { ProjectReminders } from '@/components/ProjectReminders'
import { ProjectProgress } from '@/components/ProjectProgress'
import { Project, Task } from '@/types/project'

export default function ProjectPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project>({
    id: params.id,
    name: "Performance Marketing \"Ads\" - ...",
    number: "47",
    client: "Fantasiefirma e.K",
    budget: "8000,00",
    currency: "€",
    startDate: "2024-04-01",
    endDate: "2024-06-01",
    status: "In Arbeit",
    description: "In diesem Projekt geht es darum, dass wir eine komplette Performance Funnel aufbauen. Strategie sehen zur Zielgruppenanalyse, Content Creation & Media Buying",
    progress: 38,
    tasksCompleted: 0,
    totalTasks: 12,
    timeSpent: 60,
    totalTime: 81,
    milestones: [
      { 
        id: '1', 
        name: 'Analysephase', 
        startDate: new Date('2024-04-01'), 
        endDate: new Date('2024-04-07'), 
        tasks: [
          { id: 't1', title: 'Marktanalyse durchführen', status: 'In Bearbeitung', description: 'Detaillierte Analyse des Marktes durchführen', priority: 'High', assignee: 'John Doe', startDate: new Date('2024-04-01'), endDate: new Date('2024-04-03'), timeSpent: 0, comments: [], attachments: [] },
          { id: 't2', title: 'Zielgruppenanalyse erstellen', status: 'Offen', description: 'Zielgruppe identifizieren und analysieren', priority: 'Medium', assignee: 'Jane Smith', startDate: new Date('2024-04-04'), endDate: new Date('2024-04-07'), timeSpent: 0, comments: [], attachments: [] },
        ]
      },
      { 
        id: '2', 
        name: 'Strategiephase', 
        startDate: new Date('2024-04-08'), 
        endDate: new Date('2024-04-14'), 
        tasks: [
          { id: 't3', title: 'Marketingstrategie entwickeln', status: 'Offen', description: 'Entwicklung einer umfassenden Marketingstrategie', priority: 'High', assignee: 'Alice Johnson', startDate: new Date('2024-04-08'), endDate: new Date('2024-04-14'), timeSpent: 0, comments: [], attachments: [] },
        ]
      },
      { 
        id: '3', 
        name: 'Contentphase', 
        startDate: new Date('2024-04-15'), 
        endDate: new Date('2024-04-28'), 
        tasks: []
      },
      { 
        id: '4', 
        name: 'Revisionsphase', 
        startDate: new Date('2024-04-29'), 
        endDate: new Date('2024-05-05'), 
        tasks: []
      },
      { 
        id: '5', 
        name: 'Media Buying', 
        startDate: new Date('2024-05-06'), 
        endDate: new Date('2024-05-26'), 
        tasks: []
      },
      { 
        id: '6', 
        name: 'Reporting', 
        startDate: new Date('2024-05-27'), 
        endDate: new Date('2024-06-02'), 
        tasks: []
      },
    ],
    notes: [],
    reminders: []
  })

  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const filteredTasks = project.milestones
    .flatMap((milestone) => milestone.tasks)
    .filter((task) => 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!statusFilter || task.status === statusFilter)
    )

  const handleCreateTask = (newTask: Task) => {
    const updatedMilestones = project.milestones.map(milestone => 
      milestone.id === newTask.milestone
        ? { ...milestone, tasks: [...milestone.tasks, newTask] }
        : milestone
    );

    setProject({
      ...project,
      milestones: updatedMilestones,
      totalTasks: project.totalTasks + 1
    });
  }

  const handleUpdateTask = (updatedTask: Task) => {
    const updatedMilestones = project.milestones.map(milestone => ({
      ...milestone,
      tasks: milestone.tasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      )
    }));

    setProject({
      ...project,
      milestones: updatedMilestones
    });
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    const updatedMilestones = [...project.milestones];
    const sourceMilestone = updatedMilestones.find(m => m.id === source.droppableId);
    const destMilestone = updatedMilestones.find(m => m.id === destination.droppableId);

    if (sourceMilestone && destMilestone) {
      const [movedTask] = sourceMilestone.tasks.splice(source.index, 1);
      destMilestone.tasks.splice(destination.index, 0, movedTask);

      setProject({ ...project, milestones: updatedMilestones });
    }
  }

  const handleProjectUpdate = (updatedProject: Project) => {
    setProject(updatedProject);
  }

  return (
    <div className="container mx-auto py-6 px-4 bg-gray-100 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{project.name}</h1>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <TaskCreationDialog 
            milestones={project.milestones} 
            onCreateTask={handleCreateTask}
          />
          <Button>Rechnung erstellen</Button>
        </div>
      </div>

      <ProjectProgress project={project} />

      <Tabs defaultValue="overview" className="space-y-4 mt-6">
        <TabsList className="flex flex-wrap justify-start gap-2 bg-white p-1 rounded-lg">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="tasks">Aufgaben</TabsTrigger>
          <TabsTrigger value="time">Zeit</TabsTrigger>
          <TabsTrigger value="milestones">Meilensteine</TabsTrigger>
          <TabsTrigger value="files">Dateien</TabsTrigger>
          <TabsTrigger value="discussions">Diskussionen</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="invoices">Rechnungen</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="employees">Mitarbeiter</TabsTrigger>
          <TabsTrigger value="notes">Notizen</TabsTrigger>
          <TabsTrigger value="reminders">Erinnerungen</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ProjectOverview project={project} />
        </TabsContent>

        <TabsContent value="milestones">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Meilensteine</CardTitle>
              <CardDescription>Wichtige Meilensteine für dieses Projekt</CardDescription>
            </CardHeader>
            <CardContent>
              <DragDropContext onDragEnd={handleDragEnd}>
                <MilestoneBoard 
                  milestones={project.milestones} 
                  onTaskClick={handleTaskClick}
                />
              </DragDropContext>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Aufgaben</CardTitle>
              <CardDescription>Alle Aufgaben für dieses Projekt</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Input
                  placeholder="Aufgaben suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Select onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle</SelectItem>
                    <SelectItem value="Offen">Offen</SelectItem>
                    <SelectItem value="In Bearbeitung">In Bearbeitung</SelectItem>
                    <SelectItem value="Abgeschlossen">Abgeschlossen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleTaskClick(task)}
                  >
                    <span>{task.title}</span>
                    <Badge variant={task.status === "Abgeschlossen" ? "success" : "default"}>
                      {task.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Zeiterfassungen</CardTitle>
              <CardDescription>Zeiterfassungen für dieses Projekt</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">Zeiterfassungen werden hier angezeigt.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Dateien</CardTitle>
              <CardDescription>Dateien für dieses Projekt</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">Dateien werden hier angezeigt.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discussions">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Diskussionen</CardTitle>
              <CardDescription>Diskussionen für dieses Projekt</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">Diskussionen werden hier angezeigt.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Tickets</CardTitle>
              <CardDescription>Tickets für dieses Projekt</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">Tickets werden hier angezeigt.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Rechnungen</CardTitle>
              <CardDescription>Rechnungen für dieses Projekt</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">Rechnungen werden hier angezeigt.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Projekt Timeline</CardTitle>
              <CardDescription>Überblick über Meilensteine und Aufgaben</CardDescription>
            </CardHeader>
            <CardContent>
              <TimelineView project={project} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Mitarbeiter Zuweisung</CardTitle>
              <CardDescription>Mitarbeiter den Aufgaben zuweisen</CardDescription>
            </CardHeader>
            <CardContent>
              <EmployeeAllocation project={project} onUpdate={handleProjectUpdate} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Projekt Notizen</CardTitle>
              <CardDescription>Notizen zum Projekt hinzufügen und anzeigen</CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectNotes project={project} onUpdate={handleProjectUpdate} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reminders">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Projekt Erinnerungen</CardTitle>
              <CardDescription>Erinnerungen zum Projekt hinzufügen und anzeigen</CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectReminders project={project} onUpdate={handleProjectUpdate} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedTask && (
        <TaskDetailDialog
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdateTask}
        />
      )}
    </div>
  )
}