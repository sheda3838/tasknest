import React, { useState, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { TaskColumn } from "./TaskColumn";
import { TaskCard } from "./TaskCard";
import { Plus } from "lucide-react";
import { calculateDaysRemaining, determinePriority, cn } from "../lib/utils";
import { createPortal } from "react-dom";
import { TaskModal } from "./TaskModal";

const defaultDropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: { opacity: "0.5" },
    },
  }),
};

export function KanbanBoard({ folderId }) {
  const allTasks = useLiveQuery(
    () => db.tasks.where({ folderId }).sortBy("order"),
    [folderId]
  );

  const [activeId, setActiveId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }, // prevent accidental drags
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columns = useMemo(() => {
    if (!allTasks) return { todo: [], doing: [], done: [] };
    return {
      todo: allTasks.filter((t) => t.status === "todo"),
      doing: allTasks.filter((t) => t.status === "doing"),
      done: allTasks.filter((t) => t.status === "done"),
    };
  }, [allTasks]);

  const activeTask = useMemo(
    () => allTasks?.find((task) => task.id === activeId),
    [activeId, allTasks]
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeTask = allTasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    let overTask = allTasks.find((t) => t.id === overId);
    let targetStatus = activeTask.status;
    let newOrder = activeTask.order;

    // Check if over is a container/column
    const isOverColumn = ["todo", "doing", "done"].includes(overId);

    if (isOverColumn) {
      targetStatus = overId;
      const columnTasks = columns[targetStatus];
      const maxOrder =
        columnTasks.length > 0
          ? Math.max(...columnTasks.map((t) => t.order))
          : 0;
      newOrder = maxOrder + 1;

      if (activeTask.status !== targetStatus) {
        await db.tasks.update(activeId, {
          status: targetStatus,
          order: newOrder,
        });
      }
      return;
    }

    if (overTask) {
      targetStatus = overTask.status;

      const columnTasks = columns[targetStatus].sort(
        (a, b) => a.order - b.order
      );
      const oldIndex = columnTasks.findIndex((t) => t.id === activeId);
      const newIndex = columnTasks.findIndex((t) => t.id === overId);

      if (activeTask.status !== targetStatus) {
        const newColumnTasks = [...columnTasks];
        newColumnTasks.splice(newIndex, 0, activeTask); // Insert
        await Promise.all(
          newColumnTasks.map((t, i) =>
            db.tasks.update(t.id, { status: targetStatus, order: i })
          )
        );
      } else {
        if (oldIndex !== newIndex) {
          const newColumnTasks = arrayMove(columnTasks, oldIndex, newIndex);
          await Promise.all(
            newColumnTasks.map((t, i) => db.tasks.update(t.id, { order: i }))
          );
        }
      }
    }
  };

  const handleSaveTask = async (taskData) => {
    const daysRemaining = calculateDaysRemaining(taskData.deadline || null);
    const priority = determinePriority(daysRemaining);

    if (taskData.id) {
      await db.tasks.update(taskData.id, {
        title: taskData.title,
        deadline: taskData.deadline || null,
        daysRemaining,
        priority,
      });
    } else {
      const todoTasks = columns.todo;
      const maxOrder =
        todoTasks.length > 0 ? Math.max(...todoTasks.map((t) => t.order)) : 0;

      await db.tasks.add({
        title: taskData.title,
        folderId,
        status: "todo",
        deadline: taskData.deadline || null,
        daysRemaining: daysRemaining,
        priority,
        order: maxOrder + 1,
      });
    }
  };

  const handleDeleteTask = async (id) => {
    await db.tasks.delete(id);
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Board</h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingTask(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus size={18} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
        onDelete={handleDeleteTask}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full overflow-hidden pb-2 min-h-0">
          <TaskColumn
            id="todo"
            title="Todo"
            tasks={columns.todo}
            onEdit={(task) => {
              setEditingTask(task);
              setIsModalOpen(true);
            }}
          />
          <TaskColumn
            id="doing"
            title="Doing"
            tasks={columns.doing}
            onEdit={(task) => {
              setEditingTask(task);
              setIsModalOpen(true);
            }}
          />
          <TaskColumn
            id="done"
            title="Done"
            tasks={columns.done}
            onEdit={(task) => {
              setEditingTask(task);
              setIsModalOpen(true);
            }}
          />
        </div>

        {createPortal(
          <DragOverlay dropAnimation={defaultDropAnimation}>
            {activeTask ? <TaskCard task={activeTask} /> : null}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
}
