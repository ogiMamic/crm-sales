export interface Project {
  id: string;
  name: string;
  number: string;
  client: string;
  budget: string;
  currency: string;
  startDate: string;
  endDate: string;
  status: string;
  description: string;
  progress: number;
  tasksCompleted: number;
  totalTasks: number;
  timeSpent: number;
  totalTime: number;
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  color: string;
  tasks: Task[];
}

export interface Task {
  id: string;
  title: string;
  milestone: string;
  startDate: Date;
  endDate: Date;
  priority: string;
  assignee: string;
  project: string;
  follower: string;
  checklist: string;
  tags: string;
  description: string;
  billable: boolean;
  visibleToClient: boolean;
  status: string;
}