"use client"

import { useState } from 'react'
import { DragDropContext, DropResult } from 'react-beautiful-dnd'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { ProjectOverview } from '@/components/ProjectOverview'
import { KanbanBoard } from '@/components/KanbanBoard'
import { TaskCreationDialog } from '@/components/TaskCreationDialog'
import { TaskDetailDialog } from '@/components/TaskDetailDialog'
import { Project, Milestone, Task } from '@/types/project'

export default function ProjectPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project>({
    id: params.id,
    name: "Performance Marketing \"Ads\" - ...",
    number: "47",
    client: "Fantasiefirma e.K",
    budget: "8000,00",
    currency: "€",
    startDate: "01.04.2024",
    endDate: "01.06.2024",
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
        color: '#FFFF00',
        tasks: [
          { id: 't1', title: 'Marktanalyse durchführen', status: 'In Bearbeitung', description: 'Detaillierte Analyse des Marktes durchführen' },
          { id: 't2', title: 'Zielgruppenanalyse erstellen', status: 'Offen', description: 'Zielgruppe identifizieren und analysieren' },
        ]
      },
      { 
        id: '2', 
        name: 'Strategiephase', 
        startDate: new Date('2024-04-08'), 
        endDate: new Date('2024-04-14'), 
        color: '#90EE90',
        tasks: [
          { id: 't3', title: 'Marketingstrategie entwickeln', status: 'Offen', description: 'Entwicklung einer umfassenden Marketingstrategie' },
        ]
      },
      { 
        id: '3', 
        name: 'Contentphase', 
        startDate: new Date('2024-04-15'), 
        endDate: new Date('2024-04-28'), 
        color: '#ADD8E6',
        tasks: []
      },
      { 
        id: '4', 
        name: 'Revisionsphase', 
        startDate: new Date('2024-04-29'), 
        endDate: new Date('2024-05-05'), 
        color: '#FFA07A',
        tasks: []
      },
      { 
        id: '5', 
        name: 'Media Buying', 
        startDate: new Date('2024-05-06'), 
        endDate: new Date('2024-05-26'), 
        color: '#DDA0DD',
        tasks: []
      },
      { 
        id: '6', 
        name: 'Reporting', 
        startDate: new Date('2024-05-27'), 
        endDate: new Date('2024-06-02'), 
        color: '#20B2AA',
        tasks: []
      },
    ]
  })

  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

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

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
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

    setSelectedTask(null);
  }

  return (
    <div className="container mx-auto py-6 px-4 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
        <div className="space-x-2">
          <TaskCreationDialog 
            milestones={project.milestones} 
            onCreateTask={handleCreateTask}
          />
          <Button>Rechnung erstellen</Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-4 sm:grid-cols-8 gap-2 bg-white p-1 rounded-lg">
          <TabsTrigger value="overview">Projekt Übersicht</TabsTrigger>
          <TabsTrigger value="tasks">Aufgaben</TabsTrigger>
          <TabsTrigger value="time">Zeiterfassungen</TabsTrigger>
          <TabsTrigger value="milestones">Meilensteine</TabsTrigger>
          <TabsTrigger value="files">Dateien</TabsTrigger>
          <TabsTrigger value="discussions">Diskussionen</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="invoices">Rechnungen</TabsTrigger>
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
                <KanbanBoard milestones={project.milestones} onTaskClick={handleTaskClick} />
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
              <p className="text-sm text-gray-700">Aufgabenliste wird hier angezeigt.</p>
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