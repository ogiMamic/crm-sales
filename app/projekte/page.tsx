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
    <div className="container mx-auto py-6 px-4 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary border-b pb-2 mb-4">Projekte</h1>
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
              <div className="bg-blue-100 p-4 rounded-lg shadow-sm border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Aktive Projekte</h3>
                <p className="text-3xl font-bold text-blue-700">{projects.filter(p => p.status === "In Arbeit").length}</p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg shadow-sm border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2">Abgeschlossene Projekte</h3>
                <p className="text-3xl font-bold text-green-700">{projects.filter(p => p.status === "Abgeschlossen").length}</p>
              </div>
              <div className="bg-yellow-100 p-4 rounded-lg shadow-sm border border-yellow-200">
                <h3 className="font-semibold text-yellow-900 mb-2">Geplante Projekte</h3>
                <p className="text-3xl font-bold text-yellow-700">{projects.filter(p => p.status === "Geplant").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="font-semibold text-gray-900">Projektname</TableHead>
            <TableHead className="font-semibold text-gray-900">Kunde</TableHead>
            <TableHead className="font-semibold text-gray-900">Status</TableHead>
            <TableHead className="font-semibold text-gray-900">Fortschritt</TableHead>
            <TableHead className="font-semibold text-gray-900">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProjects.map((project) => (
            <TableRow key={project.id} className="hover:bg-gray-50">
              <TableCell className="font-medium text-gray-900">{project.name}</TableCell>
              <TableCell className="text-gray-700">{project.client}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  project.status === "In Arbeit" ? "bg-blue-100 text-blue-800" :
                  project.status === "Abgeschlossen" ? "bg-green-100 text-green-800" :
                  "bg-yellow-100 text-yellow-800"
                }`}>
                  {project.status}
                </span>
              </TableCell>
              <TableCell>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
                </div>
              </TableCell>
              <TableCell>
                <Link href={`/projekte/${project.id}`}>
                  <Button variant="outline" size="sm" className="text-gray-700 border-gray-300 hover:bg-gray-100">Details</Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}