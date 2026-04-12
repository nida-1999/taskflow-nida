import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Task, User, Project, TaskStatus } from "../types";
import TaskCard from "./TaskCard";

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  users: User[];
  projects: Project[];
  onTaskClick: (task: Task) => void;
  onTaskEdit: (task: Task) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  tasks,
  users,
  projects,
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
      className={`rounded-[20px] !p-4 w-full min-w-[280px] flex flex-col gap-4 min-h-[600px] border transition-all duration-200 h-fit ${
        isOver ? "bg-[var(--accent-light)] border-[var(--accent)]" : "bg-[var(--nav-bg)] border-[var(--border)]"
      }`}
    >
      <div className="flex items-center justify-between p-1">
        <div className="flex items-center gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full ${dotColors[id]}`}></span>
          <span className={`text-[0.9rem] font-extrabold tracking-tight ${
            isOver ? "text-[var(--accent)]" : "text-[var(--heading-color)]"
          }`}>
            {title}
          </span>
          <span className="text-[0.7rem] font-bold bg-[var(--bg-secondary)] text-[var(--text-secondary)] !px-2 !py-[4px] rounded-full border border-[var(--border)]">
            {tasks.length}
          </span>
        </div>
      </div>
      
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-3">
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
    </div>
  );
};

export default KanbanColumn;
