import React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import { calculateDaysRemaining, cn } from "../lib/utils";
import { Calendar, ArrowRight, Folder, AlertCircle, Clock } from "lucide-react";

export function Dashboard({ onNavigate }) {
  const tasks = useLiveQuery(() => db.tasks.toArray());
  const folders = useLiveQuery(() => db.folders.toArray());

  if (!tasks || !folders) return null;

  const folderMap = folders.reduce((acc, folder) => {
    acc[folder.id] = folder.name;
    return acc;
  }, {});

  // Filter tasks due soon (overdue, today, tomorrow) AND not done
  const urgentTasks = tasks
    .filter((task) => {
      if (task.status === "done" || !task.deadline) return false;
      const days = calculateDaysRemaining(task.deadline);
      // Show tasks due within next 2 days or overdue
      return days <= 2;
    })
    .sort((a, b) => {
      const daysA = calculateDaysRemaining(a.deadline);
      const daysB = calculateDaysRemaining(b.deadline);
      return daysA - daysB;
    });

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight mb-2">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your urgent tasks</p>
      </div>

      <div className="grid gap-4 max-w-4xl">
        {urgentTasks.length === 0 ? (
          <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed border-border">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="text-muted-foreground" size={24} />
            </div>
            <h3 className="text-lg font-medium">No urgent tasks</h3>
            <p className="text-muted-foreground">You are all caught up!</p>
          </div>
        ) : (
          urgentTasks.map((task) => {
            const days = calculateDaysRemaining(task.deadline);
            let statusText = "";
            let statusColor = "";

            if (days < 0) {
              statusText = `Overdue by ${Math.abs(days)} days`;
              statusColor =
                "text-destructive bg-destructive/10 border-destructive/20";
            } else if (days === 0) {
              statusText = "Due Today";
              statusColor =
                "text-orange-600 bg-orange-100 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800";
            } else if (days === 1) {
              statusText = "Due Tomorrow";
              statusColor =
                "text-yellow-600 bg-yellow-100 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
            } else {
              statusText = `${days} days left`;
              statusColor =
                "text-blue-600 bg-blue-100 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
            }

            return (
              <div
                key={task.id}
                onClick={() => onNavigate(task.folderId)}
                className="group flex items-center justify-between p-4 bg-card hover:bg-muted/50 border border-border rounded-xl cursor-pointer transition-all hover:shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-2 h-12 rounded-full",
                      days < 0
                        ? "bg-destructive"
                        : days === 0
                        ? "bg-orange-500"
                        : days === 1
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                    )}
                  />

                  <div>
                    <h3 className="font-semibold text-lg leading-tight mb-1">
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Folder size={14} />
                        {folderMap[task.folderId] || "Unknown Folder"}
                      </span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1",
                          statusColor
                        )}
                      >
                        <Clock size={12} />
                        {statusText}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-muted-foreground group-hover:text-primary transition-colors">
                  <ArrowRight size={20} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
