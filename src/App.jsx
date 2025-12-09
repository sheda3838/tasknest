import React, { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { KanbanBoard } from "./components/KanbanBoard";
import { Dashboard } from "./components/Dashboard";
import { ThemeToggle } from "./components/ThemeToggle";
import { db } from "./lib/db";
import { useLiveQuery } from "dexie-react-hooks";

function App() {
  const [selectedFolderId, setSelectedFolderId] = useState(null);

  // Auto-select first folder if none selected or restore from localStorage
  const folders = useLiveQuery(() => db.folders.toArray());

  useEffect(() => {
    if (folders && folders.length > 0) {
      const savedFolderId = localStorage.getItem("tasknest_last_folder");
      if (!selectedFolderId) {
        if (savedFolderId === "dashboard") {
          setSelectedFolderId("dashboard");
        } else if (
          savedFolderId &&
          folders.find((f) => f.id === parseInt(savedFolderId))
        ) {
          setSelectedFolderId(parseInt(savedFolderId));
        } else {
          setSelectedFolderId("dashboard"); // Default to dashboard if folders exist
        }
      }
    }
  }, [folders, selectedFolderId]);

  const handleSelectFolder = (id) => {
    setSelectedFolderId(id);
    localStorage.setItem("tasknest_last_folder", id);
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans antialiased">
      <Sidebar
        selectedFolderId={selectedFolderId}
        onSelectFolder={handleSelectFolder}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {selectedFolderId === "dashboard" ? (
          <Dashboard onNavigate={handleSelectFolder} />
        ) : selectedFolderId ? (
          <KanbanBoard folderId={selectedFolderId} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl font-bold">TN</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Welcome to TaskNest</h2>
            <p>Select or create a folder to get started</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
