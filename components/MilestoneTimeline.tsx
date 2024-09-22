import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Milestone } from '@/types/milestone'

interface MilestoneTimelineProps {
  milestones: Milestone[]
}

export const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({ milestones }) => {
  return (
    <div className="space-y-4">
      {milestones.map((milestone) => (
        <Card key={milestone.id} style={{ backgroundColor: milestone.color }}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-gray-900">{milestone.name}</h4>
              <span className="text-sm text-gray-700">
                {milestone.startDate.toLocaleDateString()} - {milestone.endDate.toLocaleDateString()}
              </span>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: '0%' }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}