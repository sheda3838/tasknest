import React, { useEffect, useState } from "react";
import { X, Calendar, Clock, AlertCircle } from "lucide-react";
import { cn, calculateDaysRemaining } from "../lib/utils";
import { createPortal } from "react-dom";

export function TaskModal({ isOpen, onClose, onSave, task, onDelete }) {
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");

  // Use a unique ID for the portal container
  const modalRootId = "task-modal-root";

  useEffect(() => {
    if (isOpen) {
      setTitle(task?.title || "");
      setDeadline(task?.deadline || "");
    }
  }, [isOpen, task]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: task?.id, // undefined if new
      title,
      deadline,
    });
    onClose();
  };

  const daysRemaining = calculateDaysRemaining(deadline);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-card w-full max-w-md rounded-xl shadow-2xl border border-border p-6 animate-in zoom-in-95 duration-200"
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold tracking-tight">
            {task ? "Edit Task" : "New Task"}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-foreground/80">
              Task Title
            </label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-background border border-input rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
              placeholder="What needs to be done?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-foreground/80">
              Deadline{" "}
              <span className="text-muted-foreground font-normal">
                (Optional)
              </span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-background border border-input rounded-lg px-3 py-2.5 pl-10 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
              />
              <Calendar
                className="absolute left-3 top-3 text-muted-foreground"
                size={16}
              />
            </div>
            {deadline && (
              <div className="mt-2 text-xs flex items-center gap-1.5 font-medium">
                {daysRemaining < 0 ? (
                  <span className="text-destructive flex items-center gap-1">
                    <AlertCircle size={12} /> Overdue by{" "}
                    {Math.abs(daysRemaining)} days
                  </span>
                ) : (
                  <span className="text-primary flex items-center gap-1">
                    <Clock size={12} />{" "}
                    {daysRemaining === 0
                      ? "Due Today"
                      : `${daysRemaining} days remaining`}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2 mt-6 border-t border-border">
            {task && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Delete this task?")) {
                    onDelete(task.id);
                    onClose();
                  }
                }}
                className="mr-auto text-destructive hover:bg-destructive/10 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Delete
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 shadow-sm transition-all active:scale-95"
            >
              {task ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
