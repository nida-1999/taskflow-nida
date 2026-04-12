import React, { useState } from "react";
import type { Task, User, Project, TaskStatus, TaskPriority } from "../types";
import { createTask } from "../services";
import Button from "./ui/Button";
import Input from "./ui/Input";
import { Heading, Text } from "./ui/Typography";
import SingleSelect from "./ui/SingleSelect";

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
      <div className={`${isMobile ? "!min-h-[20px]" : "!min-h-[24px]"} flex items-center`}>
        {children}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col bg-[var(--bg-secondary)] w-full h-full text-[var(--text-primary)]">
      {/* Header */}
      <div className={`flex items-center justify-between border-b border-[var(--border)] ${isMobile ? "!p-4" : "!px-[24px] !py-2"}`}>
        <Heading variant={isMobile ? "h3" : "h2"} className="">
          Create a Task
        </Heading>
        <button
          onClick={onClose}
          className="!p-[6px] rounded-full hover:bg-[var(--hover-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors border border-[var(--border)]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-y-auto flex flex-col ${isMobile ? "p-5 gap-5" : "!px-[28px] !py-6 gap-4"}`}>
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
            <SingleSelect
              className="w-full h-[36px]"
              value={task.projectId as string}
              onChange={(val) => setTask((prev) => ({ ...prev, projectId: val }))}
              options={projects.map((p) => ({ value: p.id, label: p.name }))}
            />
          </PropertyItem>

          <PropertyItem label="Assignee">
            <SingleSelect
              className="w-full h-[36px]"
              value={task.assigneeId as string}
              onChange={(val) => setTask((prev) => ({ ...prev, assigneeId: val }))}
              options={users.map((u) => ({ value: u.id, label: u.name }))}
            />
          </PropertyItem>

          <PropertyItem label="Status">
            <SingleSelect
              className="w-full h-[36px]"
              value={task.status as string}
              onChange={(val) => setTask((prev) => ({ ...prev, status: val as TaskStatus }))}
              options={[
                { value: "todo", label: "To Do" },
                { value: "in-progress", label: "In Progress" },
                { value: "review", label: "Review" },
                { value: "done", label: "Done" },
              ]}
            />
          </PropertyItem>

          <PropertyItem label="Priority">
            <SingleSelect
              className="w-full h-[36px]"
              value={task.priority as string}
              onChange={(val) => setTask((prev) => ({ ...prev, priority: val as TaskPriority }))}
              options={[
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
              ]}
            />
          </PropertyItem>

          <PropertyItem label="Due Date">
            <input
              type="date"
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] rounded-lg !px-3 !py-2 text-[0.85rem] outline-none focus:border-[var(--accent)] transition-all font-medium"
              value={task.dueDate}
              onChange={(e) => setTask((prev) => ({ ...prev, dueDate: e.target.value }))}
            />
          </PropertyItem>
        </div>

        <div className="flex flex-col gap-2 !pt-5 border-t border-[var(--border)]">
          <Text variant="tiny">Description</Text>
          <textarea
            className="w-full min-h-[50px] bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] rounded-xl !p-[14px] text-[0.9rem] leading-relaxed outline-none focus:border-[var(--accent)] transition-all placeholder:text-[var(--text-secondary)]"
            value={task.description}
            placeholder="More details about this task..."
            onChange={(e) => setTask((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>
      </div>

      {/* Footer */}
      <div className={`border-t border-[var(--border)] flex gap-3 sticky bottom-0 bg-[var(--bg-secondary)] z-1 ${isMobile ? "!p-4" : "!px-[28px] !pt-4"}`}>
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
