
const API_URL = "/api/tasks";

async function readResponse(response, defaultMessage) {
  const result = await response.json();

  if (!response.ok) {
    const details = [result.message, result.error].filter(Boolean).join(": ");
    throw new Error(details || defaultMessage);
  }

  return result;
}

export async function getTasks() {
  const response = await fetch(`${API_URL}/count`);
  const result = await readResponse(response, "Failed to fetch tasks");
  return result.data;
}

export async function createTask(task) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });

  const result = await readResponse(response, "Failed to create task");
  return result.data;
}

export async function updateTask(id, updates) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  const result = await readResponse(response, "Failed to update task");
  return result.data;
}

export async function deleteTask(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  const result = await readResponse(response, "Failed to delete task");
  return result.data;
}
