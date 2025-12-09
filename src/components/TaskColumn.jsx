import React from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { TaskCard } from "./TaskCard";
import { cn } from "../lib/utils";

export function TaskColumn({ id, title, tasks, onEdit }) {
  const { setNodeRef } = useDroppable({ id });

  const count = tasks.length;

  return (
    <div className="flex flex-col h-full bg-muted/40 rounded-xl p-2 border border-border/50 min-h-0">
      <div className="flex items-center justify-between px-2 py-3 mb-2">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-foreground/80">
            {title}
          </h2>
          <span className="bg-muted text-muted-foreground text-xs font-bold px-2 py-0.5 rounded-full border">
            {count}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto min-h-[100px] p-1 space-y-2"
      >
        <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEdit} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="h-full flex items-center justify-center text-muted-foreground/30 text-xs italic">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
