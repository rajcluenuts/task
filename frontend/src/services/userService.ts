import type { AuthUser } from "../types/auth";

interface UserListResponse {
  success: boolean;
  data?: AuthUser[];
  message?: string;
}

export async function getUsers(): Promise<AuthUser[]> {
  const response = await fetch("/api/users", {
    credentials: "include",
  });
  const result = (await response.json()) as UserListResponse;

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch users.");
  }

  if (!Array.isArray(result.data)) {
    throw new Error("The server returned an invalid user list.");
  }

  return result.data;
}
