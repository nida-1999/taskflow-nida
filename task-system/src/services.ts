import api from "./api";
import type { Project, Task, User } from "./types";

// ── Users ──────────────────────────────────────────────
export const getUsers = () => api.get<User[]>("/users").then((r) => r.data);

export const getUserById = (id: string) =>
  api.get<User>(`/users/${id}`).then((r) => r.data);

// ── Projects ───────────────────────────────────────────
export const getProjects = () =>
  api.get<Project[]>("/projects").then((r) => r.data);

export const getProjectById = (id: string) =>
  api.get<Project>(`/projects/${id}`).then((r) => r.data);

export const createProject = (data: Omit<Project, "id">) =>
  api.post<Project>("/projects", data).then((r) => r.data);

export const deleteProject = (id: string) =>
  api.delete(`/projects/${id}`).then((r) => r.data);

export const updateProject = (id: string, data: Partial<Project>) =>
  api.patch<Project>(`/projects/${id}`, data).then((r) => r.data);

// ── Tasks ──────────────────────────────────────────────
export const getTasksByProject = async (projectId: string) => {
  const all = await getAllTasks();
  return all.filter((t) => t.projectId === projectId);
};

export const getAllTasks = () => api.get<Task[]>("/tasks").then((r) => r.data);

export const createTask = (data: Omit<Task, "id">) =>
  api.post<Task>("/tasks", data).then((r) => r.data);

export const updateTask = (id: string, data: Partial<Task>) =>
  api.patch<Task>(`/tasks/${id}`, data).then((r) => r.data);

export const deleteTask = (id: string) =>
  api.delete(`/tasks/${id}`).then((r) => r.data);

export const deleteTasksByProject = async (projectId: string) => {
  const all = await getAllTasks();
  const projectTasks = all.filter((t) => t.projectId === projectId);
  await Promise.all(projectTasks.map((t) => deleteTask(t.id)));
};
