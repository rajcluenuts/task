import { useEffect, useMemo, useState } from "react";
import type { Task, TaskStatus } from "./types/task";
import {
  Plus,
  Search,
  CalendarDays,
  ListFilter,
  Circle,
  Trash2,
} from "lucide-react";

import {
  getTasks,
  createTask as saveTask,
  updateTask as saveTaskUpdate,
  deleteTask as removeTask,
} from "./services/taskService";
import { getUsers } from "./services/userService";

import Sidebar from "./components/layout/Sidebar";
import SummaryGrid from "./components/dashboard/SummaryGrid";
import TaskFormDrawer from "./components/tasks/TaskFormDrawer";
import ComingSoon from "./components/layout/ComingSoon";
import ProfilePage from "./components/layout/ProfilePage";
import LoginPage from "./components/landing/landingPage";
import type { AuthUser } from "./types/auth";

import "./App.css";

const taskStatuses: TaskStatus[] = ["Pending", "In Progress", "Completed"];

interface AuthSessionResponse {
  message?: string;
  user?: AuthUser;
}

function formatDate(date: string) {
  if (!date) return "No due date";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function isAssignedToUser(task: Task, user: AuthUser | null) {
  return task.assignedTo === user?.id || task.assignedTo === user?.name;
}

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [authCheckError, setAuthCheckError] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [usersError, setUsersError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "All">("All");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const myTasks = useMemo(
    () => tasks.filter((task) => isAssignedToUser(task, user)),
    [tasks, user]
  );
  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (response.status === 401) {
          return;
        }

        const result = (await response.json()) as AuthSessionResponse;
        if (!response.ok || !result.user) {
          throw new Error(result.message || "Unable to verify your session.");
        }

        if (active) {
          setUser(result.user);
        }
      } catch (error) {
        if (active) {
          setAuthCheckError(
            error instanceof Error ? error.message : "Unable to verify your session."
          );
        }
      } finally {
        if (active) {
          setIsCheckingSession(false);
        }
      }
    }

    void checkSession();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    if (!user) {
      return;
    }

    async function loadTasks() {
      try {
        setApiError("");
        setIsLoading(true);
        const data = await getTasks();
        if (active) {
          setTasks(data);
        }
      } catch (error) {
        if (active) {
          setApiError(error instanceof Error ? error.message : "Unable to load tasks.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadTasks();

    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    let active = true;

    if (!user) {
      return;
    }

    async function loadUsers() {
      try {
        setUsersError("");
        const data = await getUsers();
        if (active) {
          setUsers(data);
        }
      } catch (error) {
        if (active) {
          setUsersError(
            error instanceof Error ? error.message : "Unable to load users."
          );
        }
      }
    }

    void loadUsers();

    return () => {
      active = false;
    };
  }, [user]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const query = search.trim().toLowerCase();

      const matchesSearch =
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || task.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tasks, search, statusFilter]);
  const pageTasks = useMemo(
    () =>
      activePage === "my-tasks"
        ? filteredTasks.filter((task) => isAssignedToUser(task, user))
        : filteredTasks,
    [activePage, filteredTasks, user]
  );

  if (isCheckingSession) {
    return <main className="auth-page min-h-screen p-8">Checking your session...</main>;
  }

  if (!user) {
    return (
      <>
        {authCheckError && (
          <p role="alert" className="api-error">
            {authCheckError}
          </p>
        )}
        <LoginPage
          onLogin={(signedInUser) => {
            setAuthCheckError("");
            setActivePage("dashboard");
            setUser(signedInUser);
          }}
        />
      </>
    );
  }

  function navigateTo(page: string) {
    setActivePage(page);
    setIsDrawerOpen(false);
  }

  async function logout() {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      const result = (await response.json()) as AuthSessionResponse;

      if (!response.ok) {
        throw new Error(result.message || "Unable to sign out.");
      }

      setApiError("");
      setActivePage("dashboard");
      setUser(null);
      setTasks([]);
      setUsers([]);
      setIsLoading(false);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Unable to sign out.");
    }
  }


  async function createTask(formData: Omit<Task, "id">) {
    try {
      setApiError("");

      const newTask = await saveTask(formData);

      setTasks((current) => [newTask, ...current]);
      setIsDrawerOpen(false);
      setSearch("");
      setStatusFilter("All");
      setActivePage("dashboard");
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Failed to create task.");
    }
  }

  async function updateTaskStatus(id: string, status: TaskStatus) {
    try {
      setApiError("");

      const updatedTask = await saveTaskUpdate(id, { status });

      setTasks((current) =>
        current.map((task) => (task.id === id ? updatedTask : task))
      );
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Failed to update task.");
    }
  }

  async function deleteTask(id: string) {
    try {
      setApiError("");

      await removeTask(id);

      setTasks((current) => current.filter((task) => task.id !== id));
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Failed to delete task.");
    }
  }

  return (
    <div className="app-shell">
      <Sidebar
        userName={user.name}
        userRole={user.role}
        totalTasks={tasks.length}
        myTaskCount={myTasks.length}
        activePage={activePage}
        onNavigate={navigateTo}
      />

      <main className="main-content">
        {isLoading && <p>Loading tasks...</p>}

        {apiError && (
          <p role="alert" className="api-error">
            {apiError}
          </p>
        )}
        {usersError && (
          <p role="alert" className="api-error">
            {usersError}
          </p>
        )}
        {(activePage === "dashboard" ||
          activePage === "all-tasks" ||
          activePage === "my-tasks") && (
            <>
              <header className="page-header">
                <div>
                  <p className="eyebrow">
                    {activePage === "dashboard"
                      ? "WORKSPACE / OVERVIEW"
                      : activePage === "my-tasks"
                        ? "MY WORK / TASKS"
                        : "WORKSPACE / TASKS"}
                  </p>
                  <h1>
                    {activePage === "dashboard"
                      ? "My tasks"
                      : activePage === "my-tasks"
                        ? "Tasks"
                        : "All tasks"}
                  </h1>
                  <p className="page-description">
                    {activePage === "dashboard"
                      ? "A clear view of what needs to get done."
                      : activePage === "my-tasks"
                        ? "Tasks assigned to you."
                        : "Manage and track all workspace tasks."}
                  </p>
                </div>

                {activePage !== "my-tasks" && (
                  <button
                    className="primary-button"
                    onClick={() => setIsDrawerOpen(true)}
                  >
                    <Plus size={17} />
                    New task
                  </button>
                )}
              </header>

              {activePage === "dashboard" && (
                <>
                  <SummaryGrid tasks={tasks} />

                  <section className="task-section kanban-section">
                    <div className="section-heading">
                      <div>
                        <h2>Task board</h2>
                        <p>Move work forward by updating its status.</p>
                      </div>
                      <span className="task-total">{tasks.length} tasks</span>
                    </div>

                    <div className="kanban-board">
                      {taskStatuses.map((status) => {
                        const statusTasks = tasks.filter(
                          (task) => task.status === status
                        );
                        const statusClass =
                          status === "In Progress"
                            ? "in-progress"
                            : status.toLowerCase();

                        return (
                          <section
                            className={`kanban-column ${statusClass}`}
                            key={status}
                            aria-label={`${status} tasks`}
                          >
                            <header className="kanban-column-header">
                              <div className="kanban-column-title">
                                <Circle size={9} aria-hidden="true" />
                                <h3>{status}</h3>
                              </div>
                              <span className="kanban-count">
                                {statusTasks.length}
                              </span>
                            </header>

                            <div className="kanban-cards">
                              {statusTasks.map((task) => (
                                <article className="kanban-card" key={task.id}>
                                  <div className="kanban-card-top">
                                    <span className="kanban-card-label">
                                      TASK
                                    </span>
                                    <select
                                      className={`status-select ${statusClass}`}
                                      value={task.status}
                                      onChange={(event) =>
                                        updateTaskStatus(
                                          task.id,
                                          event.target.value as TaskStatus
                                        )
                                      }
                                      aria-label={`Move ${task.title} to another status`}
                                    >
                                      {taskStatuses.map((taskStatus) => (
                                        <option
                                          key={taskStatus}
                                          value={taskStatus}
                                        >
                                          {taskStatus}
                                        </option>
                                      ))}
                                    </select>
                                    <button
                                      type="button"
                                      className="delete-task-button"
                                      onClick={() => deleteTask(task.id)}
                                      aria-label={`Delete ${task.title}`}
                                      title="Delete task"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  </div>
                                  <h4>{task.title}</h4>
                                  <p>
                                    {task.description || "No description"}
                                  </p>
                                  <footer className="kanban-card-footer">
                                    <CalendarDays size={14} />
                                    <span>{formatDate(task.dueDate)}</span>
                                  </footer>
                                </article>
                              ))}

                              {statusTasks.length === 0 && (
                                <p className="kanban-empty">
                                  No tasks in this column
                                </p>
                              )}
                            </div>
                          </section>
                        );
                      })}
                    </div>
                  </section>
                </>
              )}

              {(activePage === "all-tasks" || activePage === "my-tasks") && (
                <section className="task-section" id="tasks">
                  <div className="section-heading">
                    <div>
                      <h2>{activePage === "my-tasks" ? "Tasks" : "All tasks"}</h2>
                      <p>
                        {activePage === "my-tasks"
                          ? "Tasks assigned to you."
                          : "Manage and track all workspace tasks."}
                      </p>
                    </div>

                    <span className="task-total">
                      {pageTasks.length} total
                    </span>
                  </div>

                  <div className="toolbar">
                    <label className="search-box">
                      <Search size={18} />
                      <input
                        type="search"
                        placeholder="Search tasks..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        aria-label="Search tasks"
                      />
                    </label>

                    <label className="filter-box">
                      <ListFilter size={17} />
                      <select
                        value={statusFilter}
                        onChange={(event) =>
                          setStatusFilter(event.target.value as TaskStatus | "All")
                        }
                        aria-label="Filter tasks by status"
                      >
                        <option value="All">All statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </label>
                  </div>

                  <div className="task-table-wrapper">
                    <table className="task-table">
                      <thead>
                        <tr>
                          <th>Task</th>
                          <th>Due date</th>
                          <th>Status</th>
                          <th>
                            <span className="visually-hidden">Actions</span>
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {pageTasks.map((task) => (
                          <tr key={task.id}>
                            <td>
                              <div className="task-title">{task.title}</div>
                              <div className="task-description">
                                {task.description || "No description"}
                              </div>
                            </td>

                            <td>
                              <span className="due-date">
                                <CalendarDays size={15} />
                                {formatDate(task.dueDate)}
                              </span>
                            </td>

                            <td>
                              <select
                                className={`status-select ${task.status === "In Progress"
                                  ? "in-progress"
                                  : task.status.toLowerCase()
                                  }`}
                                value={task.status}
                                onChange={(event) =>
                                  updateTaskStatus(task.id, event.target.value as TaskStatus)
                                }
                                aria-label={`Status for ${task.title}`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In progress</option>
                                <option value="Completed">Completed</option>
                              </select>
                            </td>
                            <td className="task-actions-cell">
                              <button
                                type="button"
                                className="delete-task-button"
                                onClick={() => deleteTask(task.id)}
                                aria-label={`Delete ${task.title}`}
                                title="Delete task"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}

                        {pageTasks.length === 0 && (
                          <tr>
                            <td colSpan={4} className="empty-state">
                              {activePage === "my-tasks" &&
                                search.length === 0 &&
                                statusFilter === "All"
                                ? "No tasks have been assigned to you yet."
                                : "No tasks found. Try changing your search or filter."}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </>
          )}

        {activePage === "settings" && (
          <ComingSoon
            type="settings"
            onBack={() => navigateTo("dashboard")}
          />
        )}

        {activePage === "help" && (
          <ComingSoon
            type="help"
            onBack={() => navigateTo("dashboard")}
          />
        )}

        {activePage === "profile" && (
          <ProfilePage
            name={user.name}
            email={user.email}
            role={user.role}
            onBack={() => navigateTo("dashboard")}
            onLogout={logout}
          />
        )}
      </main>

      {isDrawerOpen &&
        (activePage === "dashboard" ||
          activePage === "all-tasks") && (
          <TaskFormDrawer
            users={users}
            onClose={() => setIsDrawerOpen(false)}
            onCreate={createTask}
          />
        )}
    </div>
  );
}