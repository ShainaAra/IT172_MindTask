export const DEFAULT_NOTES = [
  { 
    id: "welcome", 
    title: "Welcome to MindTask", 
    content: `This is your personal productivity space with a mental wellness companion.

## Getting Started
- Create notes for your ideas
- Manage your tasks with the Task Board
- Chat with MindEase whenever you feel stressed

*Tip: Click the button in the bottom right to open your wellness companion anytime.*`, 
    type: "welcome", 
    icon: "🏠" 
  },
  { 
    id: "notes-grid", 
    title: "My Notes", 
    content: "", 
    type: "notes-grid", 
    icon: "📝" 
  },
  { 
    id: "tasks", 
    title: "My Tasks", 
    content: "", 
    type: "tasks", 
    icon: "✅" 
  },
];

export const DEFAULT_TASKS = [];

// Counter for generating unique note titles
let noteCounter = 1;

// Helper function to generate a new note with EMPTY content (no pre-filled text)
export function generateNewNote(uid = "user") {
  const timestamp = Date.now();
  const noteNumber = noteCounter++;
  
  return {
    id: `${uid}-note-${timestamp}`,
    title: `Untitled ${noteNumber}`,
    icon: "📄",
    content: "", // Empty content - user will write their own
    type: "note", // Important: this marks it as a user note
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Helper function to generate a new task with proper default values
export function generateNewTask(uid = "user") {
  const timestamp = Date.now();
  return {
    id: `${uid}-task-${timestamp}`,
    title: "New Task",
    status: "todo",
    priority: "medium",
    tag: "Dev",
    createdAt: new Date().toISOString(),
  };
}

// Reset counter function
export function resetNoteCounter() {
  noteCounter = 1;
}

export function makeUserData(uid) {
  resetNoteCounter();
  return {
    notes: DEFAULT_NOTES.map((n) => ({ ...n, id: `${uid}-${n.id}` })),
    tasks: DEFAULT_TASKS.map((t) => ({ ...t, id: `${uid}-${t.id}` })),
  };
}

export const DEMO_USERS = [];