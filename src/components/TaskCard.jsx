import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, Trash2, AlertCircle, Clock, Edit2 } from "lucide-react";
import { cn, determinePriority } from "../lib/utils";
import { db } from "../lib/db";

export function TaskCard({ task, onEdit }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColor = {
    high: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
    medium:
      "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
    low: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  }[task.priority || "low"];

  const handleDelete = (e) => {
    e.stopPropagation(); // prevent drag start
    if (window.confirm("Delete task?")) {
      db.tasks.delete(task.id);
    }
  };

  const daysLeftText = () => {
    if (task.daysRemaining === null || task.daysRemaining === undefined)
      return null;
    if (task.daysRemaining < 0) return "Overdue";
    if (task.daysRemaining === 0) return "Due today";
    if (task.daysRemaining === 1) return "Due tomorrow";
    return `${task.daysRemaining} days left`;
  };

  const daysText = daysLeftText();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "bg-card text-card-foreground p-3 rounded-lg border border-border shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all group relative",
        isDragging && "opacity-50 rotate-2 shadow-xl"
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-sm leading-tight text-foreground/90 w-full pr-6 break-words">
          {task.title}
        </h4>
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onPointerDown={(e) => e.stopPropagation()} // prevent drag
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="p-1 text-muted-foreground hover:text-primary rounded-md hover:bg-muted"
          >
            <Edit2 size={14} />
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()} // prevent drag
            onClick={handleDelete}
            className="p-1 text-muted-foreground hover:text-destructive rounded-md hover:bg-muted"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div
          className={cn(
            "text-xs px-2 py-0.5 rounded-full border font-medium flex items-center gap-1",
            priorityColor
          )}
        >
          {task.daysRemaining != null && task.daysRemaining < 3 && (
            <AlertCircle size={10} />
          )}
          <span className="capitalize">{task.priority}</span>
        </div>

        {daysText && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
            <Clock size={10} />
            <span>{daysText}</span>
          </div>
        )}
      </div>
    </div>
  );
}
