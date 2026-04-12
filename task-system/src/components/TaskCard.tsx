import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task, User, Project } from "../types";
import Card from "./ui/Card";
import Avatar from "./ui/Avatar";
import Badge from "./ui/Badge";
import { Text } from "./ui/Typography";

interface TaskCardProps {
  task: Task;
  user?: User;
  project?: Project;
  onClick?: () => void;
  onEditClick?: (e: React.MouseEvent) => void;
  isOverlay?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
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
  const isInProgress = task.status === "in-progress";

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : (isDone ? 0.6 : 1),
    cursor: isOverlay ? "grabbing" : "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="group">
      <Card
        className={`task-card ${isDragging ? "is-dragging" : ""} ${
          isInProgress ? "border-l-4 border-l-indigo-600" : ""
        }`}
        onClick={() => {
          if (!isDragging && onClick) onClick();
        }}
      >
        <div className="!p-[14px] flex flex-col gap-2.5">
          {/* Project Tag */}
          <div className="flex items-center gap-1.5 -mb-0.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isInProgress ? "bg-indigo-600" : isDone ? "bg-emerald-500" : "bg-slate-400"
              }`}
            ></span>
            <Text variant="tiny">
              {project?.name || "Task"}
            </Text>
          </div>

          <div className="flex justify-between items-start gap-2">
            <h4
              className={`text-[0.9rem] font-bold leading-tight flex-1 ${
                isDone ? "line-through text-[var(--text-secondary)]" : "text-[var(--heading-color)]"
              }`}
            >
              {task.title}
            </h4>
            {!isOverlay && onEditClick && (
              <button
                className="edit-trigger opacity-0 group-hover:opacity-100 border-none bg-transparent p-0.5 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)] transition-all rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditClick(e);
                }}
                title="Quick Edit"
              >
                ✎
              </button>
            )}
          </div>

          {/* Footer info */}
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-3">
              <Badge variant={task.priority}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Badge>
              {task.dueDate && (
                <div className="flex items-center gap-1 flex items-center gap-1 text-[var(--text-secondary)] text-[0.7rem] font-bold">
                  <span>📅</span>
                  <span>{task.dueDate.split("-").slice(1).join("/")}</span>
                </div>
              )}
              {task.description && (
                <div className="text-[var(--text-secondary)] text-[0.7rem]">
                  <span>💬</span>
                </div>
              )}
            </div>

            {user && (
              <Avatar
                name={user.name}
                avatar={user.avatar}
                size="sm"
                className={isDone ? "opacity-50 grayscale" : ""}
              />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TaskCard;
