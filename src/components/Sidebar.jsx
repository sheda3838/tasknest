import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db as database } from "../lib/db";
import { ThemeToggle } from "./ThemeToggle";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Folder,
  Plus,
  Trash2,
  Edit2,
  GripVertical,
  Check,
  X,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "../lib/utils";

function SortableFolder({ folder, isSelected, onClick, onDelete, onRename }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: folder.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(folder.name);

  const handleRename = (e) => {
    e.stopPropagation();
    if (newName.trim()) {
      onRename(folder.id, newName);
      setIsEditing(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-2 p-2 rounded-md mb-1 cursor-pointer transition-colors",
        isSelected
          ? "bg-primary/10 text-primary font-medium"
          : "hover:bg-muted text-muted-foreground",
        isDragging && "opacity-50"
      )}
      onClick={onClick}
      {...attributes}
    >
      <div
        {...listeners}
        className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1"
      >
        <GripVertical size={14} />
      </div>

      <Folder
        size={18}
        className={cn(isSelected ? "text-primary" : "text-muted-foreground")}
      />

      {isEditing ? (
        <div className="flex-1 flex items-center gap-1">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 bg-background border rounded px-1 text-sm h-6 focus:outline-none focus:ring-1 focus:ring-primary"
            autoFocus
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename(e);
              if (e.key === "Escape") setIsEditing(false);
            }}
          />
          <button
            onClick={handleRename}
            className="text-green-500 hover:text-green-600 p-0.5"
          >
            <Check size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(false);
            }}
            className="text-red-500 hover:text-red-600 p-0.5"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <span className="flex-1 truncate text-sm select-none">
          {folder.name}
        </span>
      )}

      {!isEditing && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="p-1 hover:text-primary transition-colors"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Delete folder "' + folder.name + '"?'))
                onDelete(folder.id);
            }}
            className="p-1 hover:text-destructive transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

export function Sidebar({ selectedFolderId, onSelectFolder }) {
  const folders = useLiveQuery(() =>
    database.folders.orderBy("order").toArray()
  );
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = folders.findIndex((f) => f.id === active.id);
      const newIndex = folders.findIndex((f) => f.id === over.id);

      const newOrder = arrayMove(folders, oldIndex, newIndex);

      // Update order in DB
      await Promise.all(
        newOrder.map((folder, index) =>
          database.folders.update(folder.id, { order: index })
        )
      );
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    const count = await database.folders.count();
    await database.folders.add({
      name: newFolderName,
      order: count,
    });
    setNewFolderName("");
    setIsCreating(false);
  };

  const deleteFolder = async (id) => {
    await database.folders.delete(id);
    // Also delete tasks in this folder
    const tasks = await database.tasks.where("folderId").equals(id).toArray();
    await database.tasks.bulkDelete(tasks.map((t) => t.id));

    if (selectedFolderId === id) {
      onSelectFolder(null); // Deselect
    }
  };

  const renameFolder = async (id, name) => {
    await database.folders.update(id, { name });
  };

  return (
    <div className="w-64 bg-card border-r border-border h-full flex flex-col">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <img
          src="/logo.png"
          alt="TaskNest"
          className="w-8 h-8 object-contain"
        />
        <h1 className="font-bold text-xl tracking-tight">TaskNest</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="mb-4">
          <button
            onClick={() => onSelectFolder("dashboard")}
            className={cn(
              "w-full flex items-center gap-2 p-2 rounded-md transition-colors",
              selectedFolderId === "dashboard"
                ? "bg-primary text-primary-foreground font-medium"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>
        </div>

        <div className="flex items-center justify-between mb-2 px-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Folders
          </span>
          <button
            onClick={() => setIsCreating(true)}
            className="text-primary hover:text-primary/80 transition-colors"
            title="New Folder"
          >
            <Plus size={16} />
          </button>
        </div>

        {isCreating && (
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md mb-2">
            <Folder size={18} className="text-muted-foreground" />
            <input
              autoFocus
              type="text"
              placeholder="Folder name"
              className="flex-1 bg-transparent border-none text-sm focus:outline-none"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") createFolder();
                if (e.key === "Escape") setIsCreating(false);
              }}
            />
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={folders || []}
            strategy={verticalListSortingStrategy}
          >
            {folders?.map((folder) => (
              <SortableFolder
                key={folder.id}
                folder={folder}
                isSelected={selectedFolderId === folder.id}
                onClick={() => onSelectFolder(folder.id)}
                onDelete={deleteFolder}
                onRename={renameFolder}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <div className="p-4 border-t border-border flex items-center justify-between bg-muted/20">
        <span className="text-xs text-muted-foreground">
          TaskNest Sheda Edition v1.0
        </span>
        <ThemeToggle />
      </div>
    </div>
  );
}
