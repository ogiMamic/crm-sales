'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProjectsPage() {
  const [projects, setProjects] = useState([
    { id: 1, name: "Website Redesign", client: "ABC Corp", status: "In Arbeit", progress: 60 },
    { id: 2, name: "Mobile App Entwicklung", client: "XYZ Inc", status: "Geplant", progress: 0 },
    { id: 3, name: "E-Commerce Integration", client: "123 Ltd", status: "Abgeschlossen", progress: 100 },
  ])
  const [searchTerm, setSearchTerm] = useState("")

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.client.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projekte</h1>
        <Link href="/projekte/new">
          <Button>Neues Projekt</Button>
        </Link>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Projekte suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Projekt KPIs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-100 p-4 rounded-lg">
                <h3 className="font-semibold">Aktive Projekte</h3>
                <p className="text-2xl">{projects.filter(p => p.status === "In Arbeit").length}</p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg">
                <h3 className="font-semibold">Abgeschlossene Projekte</h3>
                <p className="text-2xl">{projects.filter(p => p.status === "Abgeschlossen").length}</p>
              </div>
              <div className="bg-yellow-100 p-4 rounded-lg">
                <h3 className="font-semibold">Geplante Projekte</h3>
                <p className="text-2xl">{projects.filter(p => p.status === "Geplant").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Projektname</TableHead>
            <TableHead>Kunde</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Fortschritt</TableHead>
            <TableHead>Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProjects.map((project) => (
            <TableRow key={project.id}>
              <TableCell>{project.name}</TableCell>
              <TableCell>{project.client}</TableCell>
              <TableCell>{project.status}</TableCell>
              <TableCell>{project.progress}%</TableCell>
              <TableCell>
                <Link href={`/projekte/${project.id}`}>
                  <Button variant="outline" size="sm">Details</Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}