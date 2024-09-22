"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import format from "date-fns/format"
import { Calendar as CalendarIcon, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import Link from 'next/link'
import { Editor } from '@tinymce/tinymce-react'

export default function NewProjectPage() {
  const router = useRouter()
  const [newProject, setNewProject] = useState({
    name: "",
    kunde: "",
    fortschrittDurchAufgaben: false,
    fortschrittProzent: 0,
    abrechnungsart: "",
    status: "",
    stundensatz: "",
    geschatzteStunden: "",
    projektMitglieder: [],
    startDatum: undefined,
    deadline: undefined,
    tags: "",
    serviceart: "",
    beschreibung: "",
    emailSenden: false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("New project data:", newProject)
    router.push('/projekte')
  }

  return (
    <div className="container mx-auto py-10">
      <Link href="/projekte" className="flex items-center text-blue-500 hover:text-blue-700 mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Projects
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Neues Projekt erstellen</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="projekt">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="projekt">Projekt</TabsTrigger>
              <TabsTrigger value="einstellungen">Projekt Einstellungen</TabsTrigger>
            </TabsList>
            <TabsContent value="projekt">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Projekt Name</Label>
                  <Input
                    id="name"
                    value={newProject.name}
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="kunde">Kunde</Label>
                  <Select onValueChange={(value) => setNewProject({...newProject, kunde: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Auswählen und anfangen zu tippen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kunde1">Kunde 1</SelectItem>
                      <SelectItem value="kunde2">Kunde 2</SelectItem>
                      <SelectItem value="kunde3">Kunde 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="fortschrittDurchAufgaben"
                    checked={newProject.fortschrittDurchAufgaben}
                    onCheckedChange={(checked) => setNewProject({...newProject, fortschrittDurchAufgaben: checked as boolean})}
                  />
                  <Label htmlFor="fortschrittDurchAufgaben">Fortschritt durch Aufgaben berechnen</Label>
                </div>
                <div>
                  <Label>Fortschritt Prozent</Label>
                  <Slider
                    value={[newProject.fortschrittProzent]}
                    onValueChange={(value) => setNewProject({...newProject, fortschrittProzent: value[0]})}
                    max={100}
                    step={1}
                  />
                  <span>{newProject.fortschrittProzent}%</span>
                </div>
                <div>
                  <Label htmlFor="abrechnungsart">Abrechnungsart</Label>
                  <Select onValueChange={(value) => setNewProject({...newProject, abrechnungsart: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Wählen Sie die Abrechnungsart" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stundenaufzeichnung">Stundenaufzeichnung</SelectItem>
                      <SelectItem value="pauschal">Pauschal</SelectItem>
                      <SelectItem value="material">Material</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select onValueChange={(value) => setNewProject({...newProject, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Wählen Sie den Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nicht_gestartet">Nicht gestartet</SelectItem>
                      <SelectItem value="in_arbeit">In Arbeit</SelectItem>
                      <SelectItem value="abgeschlossen">Abgeschlossen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="stundensatz">Stundensatz</Label>
                  <Input
                    id="stundensatz"
                    type="number"
                    value={newProject.stundensatz}
                    onChange={(e) => setNewProject({...newProject, stundensatz: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="geschatzteStunden">Geschätzte Stunden</Label>
                  <Input
                    id="geschatzteStunden"
                    type="number"
                    value={newProject.geschatzteStunden}
                    onChange={(e) => setNewProject({...newProject, geschatzteStunden: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="projektMitglieder">Projekt Mitglieder</Label>
                  <Select onValueChange={(value) => setNewProject({...newProject, projektMitglieder: [...newProject.projektMitglieder, value]})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Wählen Sie Projekt Mitglieder" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mitglied1">Mitglied 1</SelectItem>
                      <SelectItem value="mitglied2">Mitglied 2</SelectItem>
                      <SelectItem value="mitglied3">Mitglied 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Datum</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !newProject.startDatum && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newProject.startDatum ? format(newProject.startDatum, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newProject.startDatum}
                          onSelect={(date) => setNewProject({...newProject, startDatum: date})}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>Deadline</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !newProject.deadline && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newProject.deadline ? format(newProject.deadline, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newProject.deadline}
                          onSelect={(date) => setNewProject({...newProject, deadline: date})}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={newProject.tags}
                    onChange={(e) => setNewProject({...newProject, tags: e.target.value})}
                    placeholder="Comma-separated tags"
                  />
                </div>
                <div>
                  <Label htmlFor="serviceart">Serviceart</Label>
                  <Select onValueChange={(value) => setNewProject({...newProject, serviceart: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Wählen Sie die Serviceart" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beratung">Beratung</SelectItem>
                      <SelectItem value="entwicklung">Entwicklung</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="beschreibung">Projekt Beschreibung</Label>
                  <Editor
                    apiKey="your-tinymce-api-key"
                    init={{
                      height: 300,
                      menubar: 'file edit view insert format tools table',
                      plugins: [
                        'advlist autolink lists link image charmap print preview anchor',
                        'searchreplace visualblocks code fullscreen',
                        'insertdatetime media table paste code help wordcount'
                      ],
                      toolbar: 'undo redo | formatselect | ' +
                      'bold italic backcolor | alignleft aligncenter ' +
                      'alignright alignjustify | bullist numlist outdent indent | ' +
                      'removeformat | help',
                    }}
                    onEditorChange={(content) => setNewProject({...newProject, beschreibung: content})}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="emailSenden"
                    checked={newProject.emailSenden}
                    onCheckedChange={(checked) => setNewProject({...newProject, emailSenden: checked as boolean})}
                  />
                  <Label htmlFor="emailSenden">E-Mail zur Projekterstellung senden</Label>
                </div>
                <Button type="submit" className="w-full">Projekt erstellen</Button>
              </form>
            </TabsContent>
            <TabsContent value="einstellungen">
              <p>Hier können Sie zusätzliche Projekteinstellungen vornehmen.</p>
              {/* Add more project settings fields here */}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}