'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from "@clerk/nextjs"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type ServiceFormData = {
    name: string
    description: string
    defaultPrice: number
    priceType: 'FIXED' | 'HOURLY'
}

type CreateServiceFormProps = {
    onServiceAdded: () => void
    onCancel: () => void
}

export function CreateServiceForm({ onServiceAdded, onCancel }: CreateServiceFormProps) {
    const { userId, getToken } = useAuth()
    const { toast } = useToast()
    const [formData, setFormData] = useState<ServiceFormData>({
        name: '',
        description: '',
        defaultPrice: 0,
        priceType: 'FIXED',
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            if (!userId) {
                throw new Error('Benutzer nicht authentifiziert')
            }

            const token = await getToken()
            if (!token) {
                throw new Error('Authentifizierungstoken konnte nicht abgerufen werden')
            }

            const response = await fetch('/api/dienstleistungen', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...formData, userId }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Dienstleistung konnte nicht hinzugefügt werden')
            }

            toast({
                title: "Erfolg",
                description: "Dienstleistung erfolgreich hinzugefügt",
            })
            onServiceAdded()
        } catch (error) {
            console.error('Fehler beim Hinzufügen der Dienstleistung:', error)
            toast({
                title: "Fehler",
                description: "Dienstleistung konnte nicht hinzugefügt werden. Bitte versuchen Sie es erneut.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name" className="text-primary">Name</Label>
                <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full text-primary"
                />
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="description" className="text-primary">Beschreibung</Label>
                <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full text-primary"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="defaultPrice" className="text-primary">Standardpreis</Label>
                <Input
                    id="defaultPrice"
                    name="defaultPrice"
                    type="number"
                    step="0.01"
                    value={formData.defaultPrice}
                    onChange={handleChange}
                    required
                    className="w-full text-primary"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="priceType" className="text-primary">Preistyp</Label>
                <Select value={formData.priceType} onValueChange={(value: 'FIXED' | 'HOURLY') => setFormData(prev => ({ ...prev, priceType: value }))}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="FIXED">Fest</SelectItem>
                        <SelectItem value="HOURLY">Stündlich</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" className="text-primary" onClick={onCancel} disabled={isSubmitting}>
                    Abbrechen
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Hinzufügen...' : 'Dienstleistung hinzufügen'}
                </Button>
            </div>
        </form>
    )
}

