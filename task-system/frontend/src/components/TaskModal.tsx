import React, { useState } from "react";
import type { Task, User, Project, TaskStatus, TaskPriority } from "../types";
import { updateTask } from "../services";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Badge from "./ui/Badge";
import Avatar from "./ui/Avatar";
import { Text } from "./ui/Typography";
import SingleSelect from "./ui/SingleSelect";

interface TaskModalProps {
  task: Task;
  user?: User;
  project?: Project;
  users: User[];
  onClose: () => void;
  onUpdate: (updatedTask: Task) => void;
  initialMode?: "view" | "edit";
}

const TaskModal: React.FC<TaskModalProps> = ({
  task,
  user,
  project,
  users,
  onClose,
  onUpdate,
  initialMode = "view",
}) => {
  const [isEditing, setIsEditing] = useState(initialMode === "edit");
  const [editedTask, setEditedTask] = useState<Task>(JSON.parse(JSON.stringify(task)));
  const [isSaving, setIsSaving] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const [error, setError] = useState<string | null>(null);

  const isValid = !!(editedTask.title && editedTask.status && editedTask.priority && editedTask.assigneeId);

  const handleSave = async () => {
    if (!isValid) {
      setError("Please fill in all mandatory fields (*) to save changes.");
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      await updateTask(editedTask.id, editedTask);
      onUpdate(editedTask);
      onClose();
    } catch (error) {
      console.error("Failed to update task", error);
    } finally {
      setIsSaving(false);
    }
  };

  const PropertyItem = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex flex-col gap-1.5">
      <Text variant="tiny">{label}</Text>
      <div className="min-h-[24px] flex items-center">{children}</div>
    </div>
  );

  const footer = isEditing ? (
    <>
      <Button 
        className={`flex-[1.5] ${!isValid ? "opacity-60" : ""}`}
        onClick={handleSave} 
        isLoading={isSaving}
      >
        Save Changes
      </Button>
      <Button variant="outline" className="flex-1" onClick={() => {
        setError(null);
        initialMode === "edit" ? onClose() : setIsEditing(false);
      }}>
        Cancel
      </Button>
    </>
  ) : (
    <>
      <Button className="flex-[1.5]" onClick={() => setIsEditing(true)}>
        Edit Task
      </Button>
      <Button variant="outline" className="flex-1" onClick={onClose}>
        Close
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEditing ? undefined : task.title}
      footer={footer}
    >
      <div className="flex flex-col !gap-6">
        {error && (
          <div className="!py-3 !px-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[0.82rem] font-bold animate-in fade-in slide-in-from-top-2">
            ⚠️ {error}
          </div>
        )}
        {/* Header (Custom for Modal) */}
        <div className="flex flex-col !gap-2 -mt-2">
          <div className="flex items-center !gap-2">
            <span className="text-[0.65rem] font-extrabold text-indigo-600 uppercase tracking-widest">
              {project?.name || "Global"}
            </span>
            <span className="w-1 h-1 rounded-full bg-[var(--border)]"></span>
            {/* <span className="text-[0.65rem] font-bold text-[var(--text-secondary)]">ID: {task.id}</span> */}
          </div>
          {isEditing && (
            <Input
              label="Title *"
              className="text-xl font-extrabold !p-0 border-none focus:ring-0"
              value={editedTask.title}
              autoFocus
              placeholder="Task Title"
              onChange={(e) => setEditedTask((prev) => ({ ...prev, title: e.target.value }))}
            />
          )}
        </div>

        {/* 2x2 Property Grid */}
        <div className="grid grid-cols-2 !gap-x-6 !gap-y-5">
          <PropertyItem label={isEditing ? "Assignee *" : "Assignee"}>
            {isEditing ? (
              <SingleSelect
                className="w-full h-[36px]"
                value={editedTask.assigneeId as string}
                onChange={(val) => setEditedTask((prev) => ({ ...prev, assigneeId: val }))}
                options={users.map((u) => ({ value: u.id, label: u.name }))}
              />
            ) : (
              <div className="flex items-center gap-2.5">
                <Avatar name={user?.name} avatar={user?.avatar} size="sm" />
                <span className="text-[0.9rem] font-bold text-[var(--heading-color)]">{user?.name || "Unassigned"}</span>
              </div>
            )}
          </PropertyItem>

          <PropertyItem label={isEditing ? "Priority *" : "Priority"}>
            {isEditing ? (
              <SingleSelect
                className="w-full h-[36px]"
                value={editedTask.priority as string}
                onChange={(val) => setEditedTask((prev) => ({ ...prev, priority: val as TaskPriority }))}
                options={[
                  { value: "low", label: "Low" },
                  { value: "medium", label: "Medium" },
                  { value: "high", label: "High" },
                ]}
              />
            ) : (
              <Badge variant={task.priority}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Badge>
            )}
          </PropertyItem>

          <PropertyItem label={isEditing ? "Status *" : "Status"}>
            {isEditing ? (
              <SingleSelect
                className="w-full h-[36px]"
                value={editedTask.status as string}
                onChange={(val) => setEditedTask((prev) => ({ ...prev, status: val as TaskStatus }))}
                options={[
                  { value: "todo", label: "To Do" },
                  { value: "in-progress", label: "In Progress" },
                  { value: "review", label: "Review" },
                  { value: "done", label: "Done" },
                ]}
              />
            ) : (
              <div className="bg-[var(--nav-bg)] border border-[var(--border)] !px-[10px] !py-[2px] rounded text-[0.8rem] font-bold text-[var(--text-secondary)] capitalize">
                {task.status.replace("-", " ")}
              </div>
            )}
          </PropertyItem>

          <PropertyItem label="Due Date">
            {isEditing ? (
              <input
                type="date"
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] rounded-lg !px-3 !py-[6px] text-[0.85rem] outline-none focus:border-[var(--accent)] transition-all font-medium"
                value={editedTask.dueDate || ""}
                min={today}
                onChange={(e) => setEditedTask((prev) => ({ ...prev, dueDate: e.target.value }))}
              />
            ) : (
              <span className="text-[0.9rem] font-bold text-[var(--heading-color)]">{task.dueDate || "No date set"}</span>
            )}
          </PropertyItem>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2 !pt-4 border-t border-[var(--border)]">
          <Text variant="tiny">Description</Text>
          {isEditing ? (
            <textarea
              className="w-full min-h-[50px] bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] rounded-xl !p-[14px] text-[0.95rem] leading-relaxed outline-none focus:border-[var(--accent)] transition-all placeholder:text-[var(--text-secondary)]"
              value={editedTask.description}
              placeholder="Description..."
              onChange={(e) => setEditedTask((prev) => ({ ...prev, description: e.target.value }))}
            />
          ) : (
            <div className="text-[0.95rem] text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
              {task.description || <span className="italic text-[var(--text-secondary)]">No description provided.</span>}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default TaskModal;
