import Dexie from "dexie";

export const db = new Dexie("TaskNestDB");

db.version(1).stores({
  folders: "++id, name, order",
  tasks: "++id, title, folderId, status, priority, deadline, order",
});

// Helper to check/initialize order if needed (though we'll handle usually in components)
