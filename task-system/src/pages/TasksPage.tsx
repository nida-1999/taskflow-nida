import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  pointerWithin,
  closestCenter,
} from "@dnd-kit/core";
import type {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getAllTasks, getUsers, getProjects, updateTask, createTask } from "../services";
import type { Task, User, Project, TaskStatus, TaskPriority } from "../types";
import Card from "../components/input/Card";
import Heading from "../components/input/Heading";
import Button from "../components/input/Button";
import Input from "../components/input/Input";
import TextArea from "../components/input/TextArea";
import Select from "../components/input/Select";

// --- Components ---

const PriorityBadge = ({ priority }: { priority: TaskPriority }) => {
  const styles: Record<TaskPriority, { bg: string; text: string; label: string }> = {
    high: { bg: "#fef2f2", text: "#ef4444", label: "High" },
    medium: { bg: "#fffbeb", text: "#f59e0b", label: "Med" },
    low: { bg: "#f0fdf4", text: "#10b981", label: "Low" },
  };
  const { bg, text, label } = styles[priority];
  return (
    <span
      style={{
        padding: "4px 8px",
        borderRadius: 6,
        fontSize: "0.7rem",
        fontWeight: 700,
        background: bg,
        color: text,
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      {label}
    </span>
  );
};

const TaskCard = ({
  task,
  user,
  project,
  onClick,
  onEditClick,
  isOverlay = false,
}: {
  task: Task;
  user?: User;
  project?: Project;
  onClick?: () => void;
  onEditClick?: (e: React.MouseEvent) => void;
  isOverlay?: boolean;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const isDone = task.status === "done";
  const isInProgress = task.status === "in-progress";

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : (isDone ? 0.6 : 1),
    cursor: isOverlay ? "grabbing" : "grab",
    borderLeft: isInProgress ? "4px solid var(--accent)" : "1px solid var(--border)",
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`task-card ${isDragging ? 'is-dragging' : ''}`}
      onClick={() => {
        if (!isDragging && onClick) onClick();
      }}
    >
      <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Project Tag */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: -2 }}>
           <span style={{ 
             width: 6, 
             height: 6, 
             borderRadius: "50%", 
             background: isInProgress ? "var(--accent)" : (isDone ? "var(--success)" : "var(--text-secondary)") 
           }}></span>
           <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.02em" }}>
             {project?.name || "Task"}
           </span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <Heading level={4} style={{ 
            lineHeight: 1.4, 
            flex: 1,
            textDecoration: isDone ? "line-through" : "none",
            color: isDone ? "var(--text-secondary)" : "var(--text-primary)"
          }}>
            {task.title}
          </Heading>
          {!isOverlay && onEditClick && (
            <button 
              className="edit-trigger"
              onClick={(e) => {
                e.stopPropagation();
                onEditClick(e);
              }}
              style={{
                border: "none",
                background: "transparent",
                padding: "2px",
                cursor: "pointer",
                opacity: 0,
                color: "var(--text-secondary)",
                transition: "all 0.2s",
                borderRadius: "4px"
              }}
              title="Quick Edit"
            >
              ✎
            </button>
          )}
        </div>

        {/* Footer info */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <PriorityBadge priority={task.priority} />
            {task.dueDate && (
              <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-secondary)", fontSize: "0.7rem", fontWeight: 600 }}>
                <span>📅</span>
                <span>{task.dueDate.split('-').slice(1).join('/')}</span>
              </div>
            )}
            {task.description && (
              <div style={{ color: "var(--text-secondary)", fontSize: "0.7rem" }}>
                <span>💬</span>
              </div>
            )}
          </div>

          {user && (
            <div
              title={user.name}
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: isDone ? "#f1f5f9" : "var(--accent-light)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.7rem",
                fontWeight: 800,
                color: isDone ? "var(--text-secondary)" : "var(--accent)",
                transition: "all 0.2s"
              }}
            >
              {user.avatar}
            </div>
          )}
        </div>
      </div>
      <style>{`.task-card:hover .edit-trigger { opacity: 0.6 !important; } .edit-trigger:hover { opacity: 1 !important; background: #f1f5f9 !important; }`}</style>
    </Card>
  );
};

const KanbanColumn = ({
  id,
  title,
  tasks,
  users,
  projects,
  onTaskClick,
  onTaskEdit,
}: {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  users: User[];
  projects: Project[];
  onTaskClick: (task: Task) => void;
  onTaskEdit: (task: Task) => void;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `col-${id}`,
    data: {
      type: "Column",
      status: id,
    },
  });

  const [isCollapsed, setIsCollapsed] = useState(false);
  const isDoneColumn = id === "done";
  
  const dotColors: Record<TaskStatus, string> = {
    "todo": "#94a3b8",
    "in-progress": "var(--accent)",
    "review": "#f59e0b",
    "done": "var(--success)"
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        background: isOver ? "#eff6ff" : "rgba(241, 245, 249, 0.5)",
        borderRadius: 20,
        padding: "16px",
        width: "100%",
        minWidth: 280,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        minHeight: 600,
        border: isOver ? "1px solid #3b82f6" : "1px solid var(--border)",
        transition: "all 0.2s ease",
        height: "fit-content"
      }}
    >
      <div className="column-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: dotColors[id] }}></span>
          <Heading level={2} style={{ color: isOver ? "#2563eb" : "var(--text-primary)", margin: 0 }}>
            {title}
          </Heading>
          <span style={{ 
            fontSize: "0.7rem", 
            fontWeight: 700, 
            background: "white", 
            color: "var(--text-secondary)", 
            padding: "2px 8px", 
            borderRadius: 99, 
            border: "1px solid var(--border)"
          }}>
            {tasks.length}
          </span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <Button variant="outline" style={{ width: 28, height: 28, borderRadius: 8, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: 300, opacity: 0, pointerEvents: "none" }}>
            +
          </Button>
        </div>
      </div>
      
      {!isCollapsed && (
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                user={users.find((u) => u.id === task.assigneeId)}
                project={projects.find((p) => p.id === task.projectId)}
                onClick={() => onTaskClick(task)}
                onEditClick={() => onTaskEdit(task)}
              />
            ))}
          </div>
        </SortableContext>
      )}
      {isCollapsed && tasks.length > 0 && (
         <div style={{ textAlign: "center", padding: "10px", color: "var(--text-secondary)", fontSize: "0.8rem", fontWeight: 600 }}>
           +{tasks.length} more tasks
         </div>
      )}
    </div>
  );
};

const TaskModal = ({
  task,
  user,
  project,
  users,
  onClose,
  onUpdate,
  initialMode = "view",
}: {
  task: Task;
  user?: User;
  project?: Project;
  users: User[];
  onClose: () => void;
  onUpdate: (updatedTask: Task) => void;
  initialMode?: "view" | "edit";
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

  const PropertyItem = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: "0.65rem", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
      <div style={{ fontSize: "0.9rem", color: "var(--text-primary)", minHeight: 24, display: "flex", alignItems: "center" }}>{children}</div>
    </div>
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "rgba(15, 23, 42, 0.4)",
        backdropFilter: "blur(4px)",
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { transform: scale(0.98); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .modal-container { animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
      <Card
        className="modal-container"
        style={{
          width: "100%",
          maxWidth: 620,
          background: "white",
          borderRadius: 20,
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "24px 28px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {project?.name || "Global"}
              </span>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#cbd5e1" }}></span>
              <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-secondary)" }}>ID: {task.id}</span>
            </div>
            {isEditing ? (
              <Input 
                style={{ fontSize: "1.5rem", fontWeight: 800, width: "100%", padding: "4px 0" }}
                value={editedTask.title}
                autoFocus
                placeholder="Task Title"
                onChange={(e) => setEditedTask(prev => ({ ...prev, title: e.target.value }))}
              />
            ) : (
              <Heading level={2}>{task.title}</Heading>
            )}
          </div>
          <Button 
            variant="outline" 
            onClick={onClose} 
            style={{ borderRadius: "50%", padding: 0, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e2e8f0", background: "white" }}
          >
            ✕
          </Button>
        </div>

        {/* Content */}
        <div style={{ padding: "24px 28px", overflowY: "auto", maxHeight: "65vh", display: "flex", flexDirection: "column", gap: 24 }}>
          {/* 2x2 Property Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 24px" }}>
            <PropertyItem label="Assignee">
              {isEditing ? (
                <select className="input-minimal" style={{ width: "100%", fontSize: "0.85rem" }} value={editedTask.assigneeId} onChange={(e) => setEditedTask(prev => ({ ...prev, assigneeId: e.target.value }))}>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--accent)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.7rem" }}>{user?.avatar || "?"}</div>
                  <span style={{ fontWeight: 600 }}>{user?.name || "Unassigned"}</span>
                </div>
              )}
            </PropertyItem>

            <PropertyItem label="Priority">
              {isEditing ? (
                <Select style={{ width: "100%", fontSize: "0.85rem" }} value={editedTask.priority} onChange={(e) => setEditedTask(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}>
                   <option value="low">Low</option>
                   <option value="medium">Medium</option>
                   <option value="high">High</option>
                </Select>
              ) : (
                <PriorityBadge priority={task.priority} />
              )}
            </PropertyItem>

            <PropertyItem label="Status">
              {isEditing ? (
                <Select style={{ width: "100%", fontSize: "0.85rem" }} value={editedTask.status} onChange={(e) => setEditedTask(prev => ({ ...prev, status: e.target.value as TaskStatus }))}>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </Select>
              ) : (
                <span style={{ fontWeight: 700, textTransform: "capitalize", background: "#f1f5f9", padding: "3px 10px", borderRadius: 6, fontSize: "0.8rem", color: "var(--text-primary)" }}>{task.status.replace("-", " ")}</span>
              )}
            </PropertyItem>

            <PropertyItem label="Due Date">
              {isEditing ? (
                <Input type="date" style={{ width: "100%", fontSize: "0.85rem" }} value={editedTask.dueDate || ""} onChange={(e) => setEditedTask(prev => ({ ...prev, dueDate: e.target.value }))} />
              ) : (
                <span style={{ fontWeight: 600 }}>{task.dueDate || "No date set"}</span>
              )}
            </PropertyItem>
          </div>

      
          <div style={{ display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid #f1f5f9", paddingTop: 20 }}>
            <label style={{ fontSize: "0.65rem", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Description</label>
            {isEditing ? (
              <TextArea 
                style={{ width: "100%", minHeight: 120, lineHeight: 1.6, padding: "12px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                value={editedTask.description}
                placeholder="Description..."
                onChange={(e) => setEditedTask(prev => ({ ...prev, description: e.target.value }))}
              />
            ) : (
              <p style={{ color: "var(--text-primary)", lineHeight: 1.6, fontSize: "0.95rem", whiteSpace: "pre-wrap", margin: 0 }}>
                {task.description || <span style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>No description.</span>}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "20px 28px", borderTop: "1px solid #f1f5f9", display: "flex", gap: 12, background: "#fcfdfe" }}>
          {isEditing ? (
            <>
              <Button 
                style={{ flex: 1.5, height: 42, fontSize: "0.9rem" }} 
                onClick={handleSave}
                isLoading={isSaving}
              >
                Save Changes
              </Button>
              <Button 
                variant="outline" 
                style={{ flex: 1, height: 42, fontSize: "0.9rem" }} 
                onClick={() => initialMode === "edit" ? onClose() : setIsEditing(false)}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button 
                style={{ flex: 1.5, height: 42, fontSize: "0.9rem" }} 
                onClick={() => setIsEditing(true)}
              >
                Edit Task
              </Button>
              <Button 
                variant="outline" 
                style={{ flex: 1, height: 42, fontSize: "0.9rem" }} 
                onClick={onClose}
              >
                Close
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

const CreateTaskModal = ({
  users,
  projects,
  onClose,
  onCreate,
  initialProjectId,
}: {
  users: User[];
  projects: Project[];
  onClose: () => void;
  onCreate: (task: Task) => void;
  initialProjectId?: string;
}) => {
  const [task, setTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    projectId: initialProjectId || projects[0]?.id || "",
    assigneeId: users[0]?.id || "",
    dueDate: new Date().toISOString().split('T')[0],
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!task.title || !task.projectId) return;
    setIsSaving(true);
    try {
      const created = await createTask({
        ...task as Omit<Task, "id">,
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

  const PropertyItem = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: "0.65rem", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
      <div style={{ fontSize: "0.9rem", color: "var(--text-primary)", minHeight: 24, display: "flex", alignItems: "center" }}>{children}</div>
    </div>
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "rgba(15, 23, 42, 0.4)",
        backdropFilter: "blur(4px)",
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={onClose}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 620,
          background: "white",
          borderRadius: 20,
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "24px 28px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9" }}>
          <Heading level={2}>Create a Task</Heading>
          <Button 
            variant="outline" 
            onClick={onClose} 
            style={{ borderRadius: "50%", padding: 0, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            ✕
          </Button>
        </div>

        {/* Content */}
        <div style={{ padding: "24px 28px", overflowY: "auto", maxHeight: "65vh", display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: "0.65rem", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase" }}>Title</label>
            <Input 
              style={{ fontSize: "1.1rem", fontWeight: 700, width: "100%", padding: "10px 14px", borderRadius: "10px" }}
              value={task.title}
              autoFocus
              placeholder="What needs to be done?"
              onChange={(e) => setTask(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 24px" }}>
            <PropertyItem label="Project">
              <select className="input-minimal" style={{ width: "100%", fontSize: "0.85rem" }} value={task.projectId} onChange={(e) => setTask(prev => ({ ...prev, projectId: e.target.value }))}>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </PropertyItem>

            <PropertyItem label="Assignee">
              <select className="input-minimal" style={{ width: "100%", fontSize: "0.85rem" }} value={task.assigneeId} onChange={(e) => setTask(prev => ({ ...prev, assigneeId: e.target.value }))}>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </PropertyItem>

            <PropertyItem label="Status">
              <select className="input-minimal" style={{ width: "100%", fontSize: "0.85rem" }} value={task.status} onChange={(e) => setTask(prev => ({ ...prev, status: e.target.value as TaskStatus }))}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </PropertyItem>

            <PropertyItem label="Priority">
              <select className="input-minimal" style={{ width: "100%", fontSize: "0.85rem" }} value={task.priority} onChange={(e) => setTask(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}>
                 <option value="low">Low</option>
                 <option value="medium">Medium</option>
                 <option value="high">High</option>
              </select>
            </PropertyItem>

            <PropertyItem label="Due Date">
              <input type="date" className="input-minimal" style={{ width: "100%", fontSize: "0.85rem" }} value={task.dueDate} onChange={(e) => setTask(prev => ({ ...prev, dueDate: e.target.value }))} />
            </PropertyItem>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid #f1f5f9", paddingTop: 20 }}>
            <label style={{ fontSize: "0.65rem", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase" }}>Description</label>
            <TextArea 
              style={{ width: "100%", minHeight: 100, lineHeight: 1.6, padding: "12px", background: "#f8fafc", borderRadius: "8px" }}
              value={task.description}
              placeholder="More details about this task..."
              onChange={(e) => setTask(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "20px 28px", borderTop: "1px solid #f1f5f9", display: "flex", gap: 12, background: "#fcfdfe" }}>
          <Button 
            style={{ flex: 1.5, height: 42, fontSize: "0.9rem" }} 
            onClick={handleSave}
            isLoading={isSaving}
            disabled={!task.title}
          >
            Create Task
          </Button>
          <Button variant="outline" style={{ flex: 1, height: 42, fontSize: "0.9rem" }} onClick={onClose}>Cancel</Button>
        </div>
      </Card>
    </div>
  );
};

// --- MultiSelect Dropdown Component ---

const MultiSelectDropdown = ({
  label,
  options,
  selected,
  onChange,
  placeholder,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
}) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const isActive = selected.length > 0;

  const displayLabel = selected.length === 0
    ? placeholder
    : selected.length === 1
    ? options.find(o => o.value === selected[0])?.label || selected[0]
    : `${selected.length} selected`;

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: 4, position: 'relative' }}>
      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          height: 36,
          minWidth: 160,
          padding: '0 12px',
          borderRadius: 8,
          border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
          background: isActive ? 'rgba(79,70,229,0.06)' : '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          cursor: 'pointer',
          fontSize: '0.85rem',
          fontWeight: isActive ? 700 : 400,
          color: isActive ? 'var(--accent)' : 'var(--text-primary)',
          transition: 'all 0.15s',
          whiteSpace: 'nowrap',
        }}
      >
        <span>{displayLabel}</span>
        <span style={{ fontSize: '0.7rem', opacity: 0.6, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>▼</span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 200,
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
            minWidth: 200,
            overflow: 'hidden',
            animation: 'scaleUp 0.15s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {/* Header */}
          <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{label}</span>
            {selected.length > 0 && (
              <button
                onClick={() => onChange([])}
                style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: 4 }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Options */}
          <div style={{ padding: '6px 0' }}>
            {options.map(opt => {
              const isChecked = selected.includes(opt.value);
              return (
                <div
                  key={opt.value}
                  onClick={() => toggle(opt.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 14px',
                    cursor: 'pointer',
                    background: isChecked ? 'rgba(79,70,229,0.05)' : 'transparent',
                    transition: 'background 0.1s',
                  }}
                >
                  {/* Custom checkbox */}
                  <div style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    border: `2px solid ${isChecked ? 'var(--accent)' : '#d1d5db'}`,
                    background: isChecked ? 'var(--accent)' : 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.15s',
                  }}>
                    {isChecked && <span style={{ color: 'white', fontSize: '0.6rem', fontWeight: 900, lineHeight: 1 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: '0.875rem', color: isChecked ? 'var(--accent)' : 'var(--text-primary)', fontWeight: isChecked ? 600 : 400 }}>
                    {opt.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Single Select Dropdown Component ---

const SingleSelectDropdown = ({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selectedLabel = options.find(o => o.value === value)?.label || value;
  const isNonDefault = value !== options[0]?.value;

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: 4, position: 'relative' }}>
      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          height: 36,
          minWidth: 150,
          padding: '0 12px',
          borderRadius: 8,
          border: `1px solid ${isNonDefault ? 'var(--accent)' : 'var(--border)'}`,
          background: isNonDefault ? 'rgba(79,70,229,0.06)' : '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          cursor: 'pointer',
          fontSize: '0.85rem',
          fontWeight: isNonDefault ? 700 : 400,
          color: isNonDefault ? 'var(--accent)' : 'var(--text-primary)',
          transition: 'all 0.15s',
          whiteSpace: 'nowrap',
        }}
      >
        <span>{selectedLabel}</span>
        <span style={{ fontSize: '0.7rem', opacity: 0.6, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>▼</span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 200,
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
            minWidth: 190,
            overflow: 'hidden',
            animation: 'scaleUp 0.15s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{label}</span>
          </div>
          <div style={{ padding: '6px 0' }}>
            {options.map(opt => {
              const isSelected = opt.value === value;
              return (
                <div
                  key={opt.value}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 14px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(79,70,229,0.05)' : 'transparent',
                    transition: 'background 0.1s',
                  }}
                >
                  {/* Radio dot */}
                  <div style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    border: `2px solid ${isSelected ? 'var(--accent)' : '#d1d5db'}`,
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.15s',
                  }}>
                    {isSelected && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)' }} />}
                  </div>
                  <span style={{ fontSize: '0.875rem', color: isSelected ? 'var(--accent)' : 'var(--text-primary)', fontWeight: isSelected ? 600 : 400 }}>
                    {opt.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Filter Pill Component ---

const FilterPill = ({ label, value, onRemove }: { label: string, value: string, onRemove: () => void }) => {
  if (!value) return null;
  return (
    <div style={{ 
      display: "inline-flex", 
      alignItems: "center", 
      gap: 6, 
      background: "#eff6ff", 
      color: "#2563eb", 
      padding: "6px 12px", 
      borderRadius: 99, 
      fontSize: "0.85rem", 
      fontWeight: 600,
      border: "1px solid #dbeafe"
    }}>
      <span>{label}: {value}</span>
      <button 
        onClick={onRemove}
        style={{ border: "none", background: "none", padding: 0, color: "inherit", cursor: "pointer", display: "flex", alignItems: "center", opacity: 0.7 }}
        title="Remove filter"
      >
        ✕
      </button>
    </div>
  );
};

// --- Main Page ---

const TasksPage = ({ projectId }: { projectId?: string }) => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const tasksRef = useRef<Task[]>([]); // always tracks latest tasks to avoid stale closures
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  const [selectedTaskState, setSelectedTaskState] = useState<{ task: Task, mode: "view" | "edit" } | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [filters, setFilters] = useState({
    statuses: [] as string[],
    assignees: [] as string[],
    search: "",
  });
  const [sortBy, setSortBy] = useState<"createdAt" | "dueDate" | "priority" | "manual">("manual");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchData = async () => {
    try {
      const [t, u, p] = await Promise.all([getAllTasks(), getUsers(), getProjects()]);
      setTasks(t);
      tasksRef.current = t;
      setUsers(u);
      setProjects(p);
    } catch (error) {
      console.error("Failed to fetch tasks data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTasks = useMemo(() => {
    const filtered = tasks.filter((t) => {
      if (projectId && t.projectId !== projectId) return false;
      const matchStatus = filters.statuses.length === 0 || filters.statuses.includes(t.status);
      const matchAssignee = filters.assignees.length === 0 || filters.assignees.includes(t.assigneeId);
      const matchSearch = (t.title || "").toLowerCase().includes(filters.search.toLowerCase()) || 
                         (t.description || "").toLowerCase().includes(filters.search.toLowerCase());
      return matchStatus && matchAssignee && matchSearch;
    });

    if (sortBy === "manual") return filtered;

    return [...filtered].sort((a, b) => {
      if (sortBy === "createdAt") return (b.createdAt || "").localeCompare(a.createdAt || "");
      if (sortBy === "dueDate") return (a.dueDate || "9999").localeCompare(b.dueDate || "9999");
      if (sortBy === "priority") {
        const pMap = { high: 3, medium: 2, low: 1 };
        return pMap[b.priority] - pMap[a.priority];
      }
      return 0;
    });
  }, [tasks, filters, sortBy]);

  const hasActiveFilters = filters.statuses.length > 0 || filters.assignees.length > 0 || filters.search !== "";

  // --- DND Handlers ---

  const setTasksAndSync = (updater: (prev: Task[]) => Task[]) => {
    setTasks(prev => {
      const next = updater(prev);
      tasksRef.current = next;
      return next;
    });
  };

  const kanbanCollisionDetection = (args: Parameters<typeof closestCenter>[0]) => {
    const ptrCollisions = pointerWithin(args);

    const cardHits = ptrCollisions.filter(({ id }) => {
      const container = args.droppableContainers.find((c) => c.id === id);
      return container?.data.current?.type !== 'Column';
    });
    if (cardHits.length > 0) return cardHits;

    const colHits = ptrCollisions.filter(({ id }) => {
      const container = args.droppableContainers.find((c) => c.id === id);
      return container?.data.current?.type === 'Column';
    });
    if (colHits.length > 0) return colHits;

    return closestCenter(args);
  };


  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
 
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;
 
    const overData = over.data.current;
    if (!overData) return;
 
    if (sortBy !== "manual") setSortBy("manual");
 
    const isOverAColumn = overData.type === "Column";
 
    setTasksAndSync((prev) => {
      const activeIndex = prev.findIndex((t) => t.id === activeId);
      if (activeIndex === -1) return prev;
 
      const activeTask = prev[activeIndex];
      const overStatus: TaskStatus = isOverAColumn
        ? (overData.status as TaskStatus)
        : (overData.task as Task).status;
 
      if (isOverAColumn) {
        if (activeTask.status === overStatus) return prev;
        const updated = prev.map((t) =>
          t.id === activeId ? { ...t, status: overStatus } : t
        );
        const fromIdx = updated.findIndex((t) => t.id === activeId);
        const sameStatus = updated.filter((t) => t.status === overStatus);
        const lastItem = sameStatus[sameStatus.length - 1];
        const toIdx = updated.findIndex((t) => t.id === lastItem.id);
        return arrayMove(updated, fromIdx, toIdx);
      }
 
      const updated = prev.map((t) =>
        t.id === activeId ? { ...t, status: overStatus } : t
      );
      const fromIdx = updated.findIndex((t) => t.id === activeId);
      const toIdx = updated.findIndex((t) => t.id === overId);
      return arrayMove(updated, fromIdx, toIdx);
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;
    
    const activeId = active.id;
    // Use ref to get the latest updated status from handleDragOver
    const movedTask = tasksRef.current.find((t) => t.id === activeId);
    if (!movedTask) return;

    try {
      await updateTask(movedTask.id, movedTask);
    } catch (error) {
      console.error("Failed to sync status update", error);
    }
  };

  const project = projectId ? projects.find(p => p.id === projectId) : null;

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 100, gap: 20 }}>
      <div className="spinner"></div>
      <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Loading workspace...</span>
    </div>
  );

  if (!loading && projectId && !project) {
    return (
      <div className="animate-fade-in" style={{ textAlign: "center", paddingTop: 80 }}>
        <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>😕</div>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 16 }}>Project Not Found</h2>
        <button className="btn-primary" onClick={() => navigate("/projects")}>
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {projectId && (
        <Button
          variant="outline"
          onClick={() => navigate("/projects")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            border: "none",
            color: "var(--text-secondary)",
            fontSize: "0.85rem",
            fontWeight: 500,
            padding: 0,
            transition: "color 0.2s",
            width: "fit-content",
            marginBottom: -8
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Projects
        </Button>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Heading level={1}>
            {project ? project.name : "Tasks"}
          </Heading>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: 2, maxWidth: 600 }}>
            {project ? project.description : "Central hub for all your team's activities."}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Button 
            style={{ height: 38, padding: "0 20px", borderRadius: 10, fontSize: "0.85rem" }}
            onClick={() => setIsCreatingTask(true)}
          >
            <span style={{ fontSize: "1rem" }}>+</span> Create a Task
          </Button>
          <div style={{ display: "flex", background: "#f1f5f9", padding: 3, borderRadius: 10 }}>
            <button 
              className={`nav-pill ${viewMode === "kanban" ? "active" : ""}`}
              onClick={() => setViewMode("kanban")}
              style={{ padding: "6px 16px", border: "none", fontSize: "0.82rem", cursor: "pointer", fontWeight: 600, borderRadius: 7 }}
            >
              Kanban
            </button>
            <button 
              className={`nav-pill ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
              style={{ padding: "6px 16px", border: "none", fontSize: "0.82rem", cursor: "pointer", fontWeight: 600, borderRadius: 7 }}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Compact Filters Bar — all controls on one row with labels */}
      <div style={{
        background: "#f8fafc", 
        borderRadius: 16, 
        border: "1px solid #f1f5f9",
        padding: "10px 16px",
        display: "flex",
        alignItems: "flex-end",
        gap: 12,
        flexWrap: "wrap"
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 220 }}>
          <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Search</span>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.4, fontSize: "0.9rem", pointerEvents: "none", zIndex: 1 }}>🔍</span>
            <Input 
              placeholder="Search tasks..."
              style={{ paddingLeft: 34, height: 36, borderRadius: 8, fontSize: "0.85rem" }}
              value={filters.search}
              onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
            />
          </div>
        </div>

        <div style={{ width: 1, height: 40, background: "#e2e8f0", alignSelf: "flex-end", marginBottom: 0 }}></div>

        <MultiSelectDropdown
          label="Status"
          placeholder="All statuses"
          options={[
            { value: "todo", label: "To Do" },
            { value: "in-progress", label: "In Progress" },
            { value: "review", label: "Review" },
            { value: "done", label: "Done" },
          ]}
          selected={filters.statuses}
          onChange={(vals) => setFilters(f => ({ ...f, statuses: vals }))}
        />

        <MultiSelectDropdown
          label="Assignee"
          placeholder="Anyone"
          options={users.map(u => ({ value: u.id, label: u.name }))}
          selected={filters.assignees}
          onChange={(vals) => setFilters(f => ({ ...f, assignees: vals }))}
        />

        <div style={{ width: 1, height: 40, background: "#e2e8f0", alignSelf: "flex-end", marginBottom: 0 }}></div>

        <SingleSelectDropdown
          label="Sort by"
          value={sortBy}
          options={[
            { value: "manual", label: "Manual" },
            { value: "createdAt", label: "Newest first" },
            { value: "dueDate", label: "Due date" },
            { value: "priority", label: "Priority" },
          ]}
          onChange={(val) => setSortBy(val as any)}
        />

        <Button 
          variant="outline"
          onClick={() => setFilters({ statuses: [], assignees: [], search: "" })}
          disabled={!hasActiveFilters}
          style={{ 
            height: 36, 
            padding: "0 14px", 
            borderColor: hasActiveFilters ? "#ef4444" : "#e2e8f0", 
            background: hasActiveFilters ? "#fef2f2" : "transparent",
            color: hasActiveFilters ? "#ef4444" : "#94a3b8", 
            fontSize: "0.82rem", 
            fontWeight: 700, 
            alignSelf: "flex-end",
            whiteSpace: "nowrap"
          }}
        >
          ✕ Clear filters
        </Button>
      </div>

      {hasActiveFilters && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: -8 }}>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Filtering by:</span>
          <FilterPill label="Search" value={filters.search} onRemove={() => setFilters(f => ({ ...f, search: "" }))} />
          {filters.statuses.map(s => (
            <FilterPill key={s} label="Status" value={s.replace('-', ' ')} onRemove={() => setFilters(f => ({ ...f, statuses: f.statuses.filter(x => x !== s) }))} />
          ))}
          {filters.assignees.map(a => {
            const u = users.find(u => u.id === a);
            return u ? <FilterPill key={a} label="Assignee" value={u.name} onRemove={() => setFilters(f => ({ ...f, assignees: f.assignees.filter(x => x !== a) }))} /> : null;
          })}
        </div>
      )}

      {viewMode === "kanban" ? (
        <DndContext
          sensors={sensors}
          collisionDetection={kanbanCollisionDetection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, overflowX: "auto", paddingBottom: 20 }}>
            <KanbanColumn id="todo" title="To Do" tasks={filteredTasks.filter((t) => t.status === "todo")} users={users} projects={projects} onTaskClick={(t) => setSelectedTaskState({ task: t, mode: "view" })} onTaskEdit={(t) => setSelectedTaskState({ task: t, mode: "edit" })} />
            <KanbanColumn id="in-progress" title="In Progress" tasks={filteredTasks.filter((t) => t.status === "in-progress")} users={users} projects={projects} onTaskClick={(t) => setSelectedTaskState({ task: t, mode: "view" })} onTaskEdit={(t) => setSelectedTaskState({ task: t, mode: "edit" })} />
            <KanbanColumn id="review" title="Review" tasks={filteredTasks.filter((t) => t.status === "review")} users={users} projects={projects} onTaskClick={(t) => setSelectedTaskState({ task: t, mode: "view" })} onTaskEdit={(t) => setSelectedTaskState({ task: t, mode: "edit" })} />
            <KanbanColumn id="done" title="Done" tasks={filteredTasks.filter((t) => t.status === "done")} users={users} projects={projects} onTaskClick={(t) => setSelectedTaskState({ task: t, mode: "view" })} onTaskEdit={(t) => setSelectedTaskState({ task: t, mode: "edit" })} />
          </div>
          <DragOverlay dropAnimation={null}>
            {activeTask ? (
              <div style={{ transform: "rotate(2deg)", pointerEvents: "none" }}>
                <TaskCard task={activeTask} user={users.find(u => u.id === activeTask.assigneeId)} project={projects.find(p => p.id === activeTask.projectId)} isOverlay />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <Card style={{ overflow: "hidden", borderRadius: 16 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid var(--border)" }}>
                <th style={{ textAlign: "left", padding: "20px 24px", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Task</th>
                <th style={{ textAlign: "left", padding: "20px 24px", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Project</th>
                <th style={{ textAlign: "left", padding: "20px 24px", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Assignee</th>
                <th style={{ textAlign: "left", padding: "20px 24px", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                <th style={{ textAlign: "left", padding: "20px 24px", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Priority</th>
                <th style={{ textAlign: "left", padding: "20px 24px", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Due Date</th>
                <th style={{ textAlign: "center", padding: "20px 24px", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length > 0 ? filteredTasks.map((task) => {
                const project = projects.find(p => p.id === task.projectId);
                const user = users.find(u => u.id === task.assigneeId);
                return (
                  <tr 
                    key={task.id} 
                    style={{ borderBottom: "1px solid var(--border)", cursor: "pointer", transition: "all 0.2s" }}
                    onClick={() => setSelectedTaskState({ task, mode: "view" })}
                    className="hover:bg-slate-50"
                  >
                    <td style={{ padding: "20px 24px", fontWeight: 700, color: "var(--text-primary)" }}>{task.title}</td>
                    <td style={{ padding: "20px 24px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>{project?.name || "N/A"}</td>
                    <td style={{ padding: "20px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 800 }}>
                          {user?.avatar || "?"}
                        </div>
                        <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>{user?.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "20px 24px" }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "capitalize", color: "var(--text-secondary)", background: "#f1f5f9", padding: "4px 10px", borderRadius: 6 }}>
                        {task.status.replace("-", " ")}
                      </span>
                    </td>
                    <td style={{ padding: "20px 24px" }}>
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td style={{ padding: "20px 24px", fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: 500 }}>{task.dueDate || "-"}</td>
                    <td style={{ padding: "20px 24px", textAlign: "center" }}>
                      <Button 
                        variant="outline"
                        style={{ padding: "6px 12px", fontSize: "0.8rem", borderRadius: "8px" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTaskState({ task, mode: "edit" });
                        }}
                      >
                       ✎ Edit
                      </Button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "80px", color: "var(--text-secondary)" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <span style={{ fontSize: "2rem" }}>🔍</span>
                      <p style={{ fontWeight: 600 }}>No tasks found matching your filters.</p>
                       <button 
                        onClick={() => setFilters({ statuses: [], assignees: [], search: "" })}
                        style={{ color: "var(--accent)", background: "none", border: "none", fontWeight: 700, cursor: "pointer" }}
                      >
                        Reset all filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      )}

      {selectedTaskState && createPortal(
        <TaskModal
          task={selectedTaskState.task}
          initialMode={selectedTaskState.mode}
          user={users.find(u => u.id === selectedTaskState.task.assigneeId)}
          users={users}
          project={projects.find(p => p.id === selectedTaskState.task.projectId)}
          onClose={() => setSelectedTaskState(null)}
          onUpdate={(updated) => {
            setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
          }}
        />,
        document.body
      )}
      {isCreatingTask && createPortal(
        <CreateTaskModal
          users={users}
          projects={projects}
          initialProjectId={projectId}
          onClose={() => setIsCreatingTask(false)}
          onCreate={(newTask) => {
            setTasks(prev => [...prev, newTask]);
          }}
        />,
        document.body
      )}
    </div>
  );
};

export default TasksPage;
