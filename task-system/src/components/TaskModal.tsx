import React, { useState } from "react";
import type { Task, User, Project, TaskStatus, TaskPriority } from "../types";
import { updateTask } from "../services";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Badge from "./ui/Badge";
import Avatar from "./ui/Avatar";
import { Text } from "./ui/Typography";

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

  const handleSave = async () => {
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
      <Button className="flex-[1.5]" onClick={handleSave} isLoading={isSaving}>
        Save Changes
      </Button>
      <Button variant="outline" className="flex-1" onClick={() => (initialMode === "edit" ? onClose() : setIsEditing(false))}>
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
        {/* Header (Custom for Modal) */}
        <div className="flex flex-col !gap-2 -mt-2">
          <div className="flex items-center !gap-2">
            <span className="text-[0.65rem] font-extrabold text-indigo-600 uppercase tracking-widest">
              {project?.name || "Global"}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-200"></span>
            <span className="text-[0.65rem] font-bold text-slate-400">ID: {task.id}</span>
          </div>
          {isEditing && (
            <Input
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
          <PropertyItem label="Assignee">
            {isEditing ? (
              <select
                className="w-full bg-white border border-slate-200 rounded-lg !px-3 !py-[6px] text-[0.85rem] outline-none focus:border-indigo-600 transition-all font-medium"
                value={editedTask.assigneeId}
                onChange={(e) => setEditedTask((prev) => ({ ...prev, assigneeId: e.target.value }))}
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-2.5">
                <Avatar name={user?.name} avatar={user?.avatar} size="sm" />
                <span className="text-[0.9rem] font-bold text-slate-700">{user?.name || "Unassigned"}</span>
              </div>
            )}
          </PropertyItem>

          <PropertyItem label="Priority">
            {isEditing ? (
              <select
                className="w-full bg-white border border-slate-200 rounded-lg !px-3 !py-[6px] text-[0.85rem] outline-none focus:border-indigo-600 transition-all font-medium"
                value={editedTask.priority}
                onChange={(e) => setEditedTask((prev) => ({ ...prev, priority: e.target.value as TaskPriority }))}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            ) : (
              <Badge variant={task.priority}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Badge>
            )}
          </PropertyItem>

          <PropertyItem label="Status">
            {isEditing ? (
              <select
                className="w-full bg-white border border-slate-200 rounded-lg !px-3 !py-[6px] text-[0.85rem] outline-none focus:border-indigo-600 transition-all font-medium"
                value={editedTask.status}
                onChange={(e) => setEditedTask((prev) => ({ ...prev, status: e.target.value as TaskStatus }))}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            ) : (
              <div className="bg-slate-50 border border-slate-100 !px-[10px] !py-[2px] rounded text-[0.8rem] font-bold text-slate-600 capitalize">
                {task.status.replace("-", " ")}
              </div>
            )}
          </PropertyItem>

          <PropertyItem label="Due Date">
            {isEditing ? (
              <input
                type="date"
                className="w-full bg-white border border-slate-200 rounded-lg !px-3 !py-[6px] text-[0.85rem] outline-none focus:border-indigo-600 transition-all font-medium"
                value={editedTask.dueDate || ""}
                onChange={(e) => setEditedTask((prev) => ({ ...prev, dueDate: e.target.value }))}
              />
            ) : (
              <span className="text-[0.9rem] font-bold text-slate-700">{task.dueDate || "No date set"}</span>
            )}
          </PropertyItem>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2 !pt-4 border-t border-slate-100">
          <Text variant="tiny">Description</Text>
          {isEditing ? (
            <textarea
              className="w-full min-h-[120px] bg-slate-50 border border-slate-200 rounded-xl !p-[14px] text-[0.95rem] leading-relaxed outline-none focus:border-indigo-600 transition-all placeholder:text-slate-400"
              value={editedTask.description}
              placeholder="Description..."
              onChange={(e) => setEditedTask((prev) => ({ ...prev, description: e.target.value }))}
            />
          ) : (
            <div className="text-[0.95rem] text-slate-600 leading-relaxed whitespace-pre-wrap">
              {task.description || <span className="italic text-slate-400">No description provided.</span>}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default TaskModal;
