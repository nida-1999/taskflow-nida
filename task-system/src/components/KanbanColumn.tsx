import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Task, User, Project, TaskStatus } from "../types";
import TaskCard from "./TaskCard";
import TaskListItem from "./TaskListItem";
import { ViewMode, type ViewModeType } from "../utils";

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  users: User[];
  projects: Project[];
  variant?: ViewModeType;
  onTaskClick: (task: Task) => void;
  onTaskEdit: (task: Task) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  tasks,
  users,
  projects,
  variant = ViewMode.KANBAN,
  onTaskClick,
  onTaskEdit,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `col-${id}`,
    data: {
      type: "Column",
      status: id,
    },
  });

  const dotColors: Record<TaskStatus, string> = {
    "todo": "bg-slate-400",
    "in-progress": "bg-indigo-600",
    "review": "bg-amber-400",
    "done": "bg-emerald-500"
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col gap-2 transition-all duration-200 h-fit ${
        variant === ViewMode.KANBAN 
          ? `rounded-[20px] !p-4 w-full min-w-[280px] min-h-[160px] border ${
              isOver ? "bg-[var(--accent-light)] border-[var(--accent)]" : "bg-[var(--nav-bg)] border-[var(--border)]"
            }`
          : `w-full !p-0 min-h-[50px] ${isOver ? "bg-[var(--accent-light)]/50 rounded-lg" : ""}`
      }`}
    >
      <div className={`flex items-center justify-between ${variant === ViewMode.LIST ? "!p-2 !pt-6 !pb-2 mb-1 border-b-2 border-[var(--border)]/50" : "p-1"}`}>
        <div className="flex items-center gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full ${dotColors[id]} opacity-70`}></span>
          <span className={`text-[0.75rem] font-black uppercase tracking-widest ${
            isOver ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"
          }`}>
            {title}
          </span>
          <span className="text-[0.65rem] font-bold text-[var(--text-secondary)] opacity-50">
            ({tasks.length})
          </span>
        </div>
      </div>
      
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className={`flex flex-col ${variant === ViewMode.KANBAN ? "gap-3" : "gap-0"}`}>
          {tasks.map((task) => (
            variant === ViewMode.KANBAN ? (
              <TaskCard
                key={task.id}
                task={task}
                user={users.find((u) => u.id === task.assigneeId)}
                project={projects.find((p) => p.id === task.projectId)}
                onClick={() => onTaskClick(task)}
                onEditClick={() => onTaskEdit(task)}
              />
            ) : (
              <TaskListItem
                key={task.id}
                task={task}
                user={users.find((u) => u.id === task.assigneeId)}
                project={projects.find((p) => p.id === task.projectId)}
                onClick={() => onTaskClick(task)}
                onEditClick={() => onTaskEdit(task)}
              />
            )
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

export default KanbanColumn;
