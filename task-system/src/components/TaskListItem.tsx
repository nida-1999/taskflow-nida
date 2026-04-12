import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task, User, Project } from "../types";
import Avatar from "./ui/Avatar";
import Badge from "./ui/Badge";
import { Text } from "./ui/Typography";

interface TaskListItemProps {
  task: Task;
  user?: User;
  project?: Project;
  onClick?: () => void;
  onEditClick?: (e: React.MouseEvent) => void;
  isOverlay?: boolean;
}

const TaskListItem: React.FC<TaskListItemProps> = ({
  task,
  user,
  project,
  onClick,
  onEditClick,
  isOverlay = false,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const isDone = task.status === "done";

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : (isDone ? 0.6 : 1),
    cursor: isOverlay ? "grabbing" : "grab",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group flex items-center justify-between !p-3 !px-4 gap-4 bg-transparent border-b border-[var(--border)] last:border-0 hover:bg-[var(--hover-bg)] transition-all duration-150 ${
        isDragging ? "!bg-[var(--accent-light)] ring-2 ring-[var(--accent)] rounded-xl z-50 shadow-lg" : ""
      }`}
      onClick={() => {
        if (!isDragging && onClick) onClick();
      }}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Status Dot / Grab Handle icon */}
        <div className="flex items-center gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
          <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 8h16M4 16h16" />
          </svg>
        </div>

        {/* Title and Project */}
        <div className="flex flex-col min-w-0">
          <h4
            className={`text-sm font-bold truncate ${
              isDone ? "line-through text-[var(--text-secondary)]" : "text-[var(--heading-color)]"
            }`}
          >
            {task.title}
          </h4>
          <div className="flex items-center gap-1.5 opacity-60">
             <Text variant="tiny" className="truncate uppercase font-bold tracking-tighter">
                {project?.name || "Global"}
             </Text>
          </div>
        </div>
      </div>

      {/* Meta Info */}
      <div className="flex items-center gap-6">
        <div className="hidden sm:flex items-center gap-4">
          {task.dueDate && (
            <div className="flex items-center gap-1.5 text-[0.65rem] font-bold text-[var(--text-secondary)]">
              <span>📅</span>
              <span>{task.dueDate.split("-").slice(1).join("/")}</span>
            </div>
          )}
          <Badge variant={task.priority} className="!px-2 !py-0.5 text-[0.6rem]">
            {task.priority.slice(0, 3)}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <Avatar
              name={user.name}
              avatar={user.avatar}
              size="sm"
              className={isDone ? "opacity-30 grayscale" : ""}
            />
          )}
          {!isOverlay && onEditClick && (
            <button
              className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-[var(--hover-bg)] text-[var(--text-secondary)] rounded transition-all"
              onClick={(e) => {
                e.stopPropagation();
                onEditClick(e);
              }}
            >
              ✎
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskListItem;
