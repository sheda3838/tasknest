# 🗂 TaskNest

A **personal productivity web app** to organize tasks in folders with a **Kanban-style workflow**.  
Helps users visually manage tasks, track deadlines, prioritize work, and stay organized — fully frontend with persistent storage.

---

## 🌟 Key Features

- Create, rename, delete, and reorder **folders**  
- Inside each folder: **3-column Kanban board** (Todo / Doing / Done)  
- Add tasks with **title** and optional **deadline**  
- Auto-calculate **days remaining** and **priority** (high/medium/low)  
- **Auto-sort tasks** by urgency  
- **Drag & drop** to reorder tasks inside columns or move between columns  
- **Light / Dark mode toggle**  
- Persistent storage using **IndexedDB (Dexie.js)** — tasks remain after refresh  

---

## 🛠 Tech Stack


- **Frontend:** React + Tailwind CSS  
- **State / Storage:** Dexie.js (IndexedDB)  
- **Drag & Drop:** dnd-kit  
- **Date Handling:** date-fns  
- **Icons:** lucide-react  
- **Build Tool:** Vite  
- **Linting:** ESLint  
- **Deployment:** Vercel  

---

## 🚀 Deployment / Live Link

- Frontend hosted on **Vercel**: [TaskNest Live](https://tasknest-one.vercel.app/)  

---

## 🧠 What I Learned

- Managing **persistent state** in a frontend-only app using **IndexedDB / Dexie.js**  
- Implementing **drag & drop** in React using **dnd-kit**  
- Handling **deadline calculations** and **auto-prioritization**  
- Building **responsive, clean UI** with Tailwind CSS  
- Deploying a full frontend app on **Vercel**  

---

## 💻 How to Run Locally

```bash
# Clone the repo
git clone https://github.com/sheda3838/TaskNest.git

# Go to project folder
cd TaskNest

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
