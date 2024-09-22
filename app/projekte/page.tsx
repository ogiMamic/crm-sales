"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Search, ExternalLink } from 'lucide-react'
import Link from 'next/link'

// Mock data for projects
const projectsData = [
  { 
    id: 1, 
    name: "Website Redesign", 
    kunde: "Acme Corp", 
    tags: ["Web", "Design"], 
    startDatum: "2023-06-01", 
    deadline: "2023-08-31", 
    mitglieder: ["John Doe", "Jane Smith"], 
    status: "in arbeit", 
    serviceart: "Web Development"
  },
  { 
    id: 2, 
    name: "Mobile App Development", 
    kunde: "TechStart Inc", 
    tags: ["Mobile", "iOS", "Android"], 
    startDatum: "2023-07-15", 
    deadline: "2023-12-31", 
    mitglieder: ["Alice Johnson", "Bob Williams"], 
    status: "nicht gestartet", 
    serviceart: "App Development"
  },
  { 
    id: 3, 
    name: "CRM Integration", 
    kunde: "Global Services LLC", 
    tags: ["CRM", "Integration"], 
    startDatum: "2023-05-01", 
    deadline: "2023-07-31", 
    mitglieder: ["Charlie Brown", "Diana Prince"], 
    status: "beendet", 
    serviceart: "System Integration"
  },
]

export default function ProjektePage() {
  const [projects, setProjects] = useState(projectsData)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.kunde.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      project.status.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const kpis = {
    nichtGestartet: projects.filter((p) => p.status === "nicht gestartet").length,
    inArbeit: projects.filter((p) => p.status === "in arbeit").length,
    wartend: projects.filter((p) => p.status === "wartend").length,
    abgebrochen: projects.filter((p) => p.status === "abgebrochen").length,
    beendet: projects.filter((p) => p.status === "beendet").length,
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Projekte</h1>
      
      <div className="grid grid-cols-5 gap-4 mb-6">
        {Object.entries(kpis).map(([key, value]) => (
          <Card key={key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Link href="/projekte/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Neuer Projekt
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="w-[100px]">#</TableHead>
              <TableHead>Projekt Name</TableHead>
              <TableHead>Kunde</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Start Datum</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Projekt Mitglieder</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Serviceart</TableHead>
              <TableHead>Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.map((project) => (
              <TableRow key={project.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{project.id}</TableCell>
                <TableCell>{project.name}</TableCell>
                <TableCell>{project.kunde}</TableCell>
                <TableCell>
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="mr-1">
                      {tag}
                    </Badge>
                  ))}
                </TableCell>
                <TableCell>{project.startDatum}</TableCell>
                <TableCell>{project.deadline}</TableCell>
                <TableCell>{project.mitglieder.join(", ")}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      project.status === "in arbeit"
                        ? "default"
                        : project.status === "beendet"
                        ? "success"
                        : "secondary"
                    }
                  >
                    {project.status}
                  </Badge>
                </TableCell>
                <TableCell>{project.serviceart}</TableCell>
                <TableCell>
                  <Link href={`/projekte/${project.id}`}>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}