import React, { useState } from "react";
import type { Task, User, Project, TaskStatus, TaskPriority } from "../types";
import { createTask } from "../services";
import Button from "./ui/Button";
import Input from "./ui/Input";
import { Heading, Text } from "./ui/Typography";

interface CreateTaskFormProps {
  users: User[];
  projects: Project[];
  onClose: () => void;
  onCreate: (task: Task) => void;
  initialProjectId?: string;
  isMobile?: boolean;
}

const CreateTaskForm: React.FC<CreateTaskFormProps> = ({
  users,
  projects,
  onClose,
  onCreate,
  initialProjectId,
  isMobile = false,
}) => {
  const [task, setTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    projectId: initialProjectId || projects[0]?.id || "",
    assigneeId: users[0]?.id || "",
    dueDate: new Date().toISOString().split("T")[0],
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!task.title || !task.projectId) return;
    setIsSaving(true);
    try {
      const created = await createTask({
        ...(task as Omit<Task, "id">),
        createdAt: new Date().toISOString(),
      });
      onCreate(created);
      onClose();
    } catch (error) {
      console.error("Failed to create task", error);
    } finally {
      setIsSaving(false);
    }
  };

  const PropertyItem = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className={`flex flex-col ${isMobile ? "gap-1" : "gap-1.5"}`}>
      <Text variant="tiny" className={isMobile ? "text-[0.6rem]" : ""}>
        {label}
      </Text>
      <div className={`${isMobile ? "min-h-[20px]" : "min-h-[24px]"} flex items-center`}>
        {children}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col bg-white w-full h-full">
      {/* Header */}
      <div className={`flex items-center justify-between border-b border-slate-100 ${isMobile ? "!p-4" : "!px-[28px] !py-6"}`}>
        <Heading variant={isMobile ? "h3" : "h2"} className="tracking-tight">
          Create a Task
        </Heading>
        <button
          onClick={onClose}
          className="!p-[6px] rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors border border-slate-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-y-auto flex flex-col ${isMobile ? "p-5 gap-5" : "!px-[28px] !py-6 gap-7"}`}>
        <Input
          label="Title"
          placeholder="What needs to be done?"
          autoFocus
          className={isMobile ? "text-[0.95rem]" : "text-lg font-bold"}
          value={task.title}
          onChange={(e) => setTask((prev) => ({ ...prev, title: e.target.value }))}
        />

        <div className={`grid grid-cols-2 ${isMobile ? "gap-4" : "gap-x-7 gap-y-6"}`}>
          <PropertyItem label="Project">
            <select
              className="w-full bg-white border border-slate-200 rounded-lg !px-3 !py-2 text-[0.85rem] outline-none focus:border-indigo-600 transition-all font-medium"
              value={task.projectId}
              onChange={(e) => setTask((prev) => ({ ...prev, projectId: e.target.value }))}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </PropertyItem>

          <PropertyItem label="Assignee">
            <select
              className="w-full bg-white border border-slate-200 rounded-lg !px-3 !py-2 text-[0.85rem] outline-none focus:border-indigo-600 transition-all font-medium"
              value={task.assigneeId}
              onChange={(e) => setTask((prev) => ({ ...prev, assigneeId: e.target.value }))}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </PropertyItem>

          <PropertyItem label="Status">
            <select
              className="w-full bg-white border border-slate-200 rounded-lg !px-3 !py-2 text-[0.85rem] outline-none focus:border-indigo-600 transition-all font-medium"
              value={task.status}
              onChange={(e) => setTask((prev) => ({ ...prev, status: e.target.value as TaskStatus }))}
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
          </PropertyItem>

          <PropertyItem label="Priority">
            <select
              className="w-full bg-white border border-slate-200 rounded-lg !px-3 !py-2 text-[0.85rem] outline-none focus:border-indigo-600 transition-all font-medium"
              value={task.priority}
              onChange={(e) => setTask((prev) => ({ ...prev, priority: e.target.value as TaskPriority }))}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </PropertyItem>

          <PropertyItem label="Due Date">
            <input
              type="date"
              className="w-full bg-white border border-slate-200 rounded-lg !px-3 !py-2 text-[0.85rem] outline-none focus:border-indigo-600 transition-all font-medium"
              value={task.dueDate}
              onChange={(e) => setTask((prev) => ({ ...prev, dueDate: e.target.value }))}
            />
          </PropertyItem>
        </div>

        <div className="flex flex-col gap-2 !pt-5 border-t border-slate-100">
          <Text variant="tiny">Description</Text>
          <textarea
            className="w-full min-h-[100px] bg-slate-50 border border-slate-200 rounded-xl !p-[14px] text-[0.9rem] leading-relaxed outline-none focus:border-indigo-600 transition-all placeholder:text-slate-400"
            value={task.description}
            placeholder="More details about this task..."
            onChange={(e) => setTask((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>
      </div>

      {/* Footer */}
      <div className={`border-t border-slate-100 flex gap-3 bg-slate-50/50 ${isMobile ? "!p-4" : "!px-[28px] !py-5"}`}>
        <Button
          className="flex-[1.5]"
          onClick={handleSave}
          isLoading={isSaving}
          disabled={!task.title}
        >
          {isSaving ? "Creating..." : "Create Task"}
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default CreateTaskForm;
