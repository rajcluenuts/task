export type TaskStatus = 'Pending' | 'In Progress' | 'Completed'
export type priorityStatus = 'Low' | 'Medium' | 'High'

export interface Task {
  id: string
  title: string
  description: string
  dueDate: string
  status: TaskStatus
  priority: priorityStatus
  assignedTo: string
}

export interface TaskInput {
  title: string
  description: string
  dueDate: string
  status: TaskStatus
  priority: priorityStatus
  assignedTo: string
}

export type TaskSummaryType = 'total' | 'pending' | 'inProgress' | 'completed'
