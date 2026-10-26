
import type { Task, TaskInput } from "../types/task";

const API_URL = "/api/tasks";

interface ApiResult<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

async function readResponse<T>(response: Response, defaultMessage: string): Promise<ApiResult<T>> {
  const result = (await response.json()) as ApiResult<T>;

  if (!response.ok) {
    const details = [result.message, result.error].filter(Boolean).join(": ");
    throw new Error(details || defaultMessage);
  }

  return result;
}

function requireData<T>(result: ApiResult<T>): T {
  if (result.data === undefined) {
    throw new Error("The server returned an empty response.");
  }

  return result.data;
}

export async function getTasks(): Promise<Task[]> {
  const response = await fetch(`${API_URL}/count`);
  const result = await readResponse<Task[]>(response, "Failed to fetch tasks");
  return requireData(result);
}

export async function createTask(task: TaskInput): Promise<Task> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });

  const result = await readResponse<Task>(response, "Failed to create task");
  return requireData(result);
}

export async function updateTask(id: string, updates: Partial<TaskInput>): Promise<Task> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  const result = await readResponse<Task>(response, "Failed to update task");
  return requireData(result);
}

export async function deleteTask(id: string): Promise<Task> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  const result = await readResponse<Task>(response, "Failed to delete task");
  return requireData(result);
}
