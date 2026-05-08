// Default notes configuration for new users
// These are pre-created notes that every user gets upon registration
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
    type: "welcome",  // Special type that triggers chat integration in PageEditor
    icon: "🏠" 
  },
  { 
    id: "notes-grid", 
    title: "My Notes", 
    content: "",  // Empty content - this page shows the notes grid view
    type: "notes-grid",  // Special type that renders the NotesGrid component
    icon: "📝" 
  },
  { 
    id: "tasks", 
    title: "My Tasks", 
    content: "",  // Empty content - this page shows the task board
    type: "tasks",  // Special type that renders the TaskBoard component
    icon: "✅" 
  },
];

// Default tasks configuration (empty array - users start with no tasks)
export const DEFAULT_TASKS = [];

// Counter for generating unique note titles (starts at 1)
let noteCounter = 1;

/**
 * Function: generateNewNote
 * Description: Creates a new note object with empty content for user-generated notes.
 * Each note gets a unique ID based on timestamp and counter, and an auto-incremented title.
 * 
 * @param {string} uid - User ID to prefix the note ID (ensures uniqueness across users)
 * @returns {Object} New note object with empty content and type "note"
 */
export function generateNewNote(uid = "user") {
  const timestamp = Date.now();
  const noteNumber = noteCounter++;
  
  return {
    id: `${uid}-note-${timestamp}`,  // Unique ID combining user ID and timestamp
    title: `Untitled ${noteNumber}`,  // Auto-numbered title (e.g., "Untitled 1", "Untitled 2")
    icon: "📄",  // Default emoji icon
    content: "",  // Empty content - user will write their own
    type: "note",  // Important: this marks it as a user note (not a special page)
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Function: generateNewTask
 * Description: Creates a new task object with default values for the task board.
 * 
 * @param {string} uid - User ID to prefix the task ID (ensures uniqueness across users)
 * @returns {Object} New task object with default status, priority, and tag
 */
export function generateNewTask(uid = "user") {
  const timestamp = Date.now();
  return {
    id: `${uid}-task-${timestamp}`,
    title: "New Task",
    status: "todo",  // Initial status: "todo", "in-progress", or "done"
    priority: "medium",  // Priority levels: "high", "medium", "low"
    tag: "Dev",  // Default tag from TAGS array
    createdAt: new Date().toISOString(),
  };
}

/**
 * Function: resetNoteCounter
 * Description: Resets the global note counter back to 1.
 * Use this when initializing new users to ensure fresh numbering.
 */
export function resetNoteCounter() {
  noteCounter = 1;
}

/**
 * Function: makeUserData
 * Description: Creates initial user data structure with default notes and empty tasks.
 * Prepends user ID to all note and task IDs to ensure uniqueness in the store.
 * 
 * @param {string} uid - User ID to prefix all IDs
 * @returns {Object} User data object containing notes and tasks arrays
 */
export function makeUserData(uid) {
  resetNoteCounter();  // Reset counter for new user
  return {
    notes: DEFAULT_NOTES.map((n) => ({ ...n, id: `${uid}-${n.id}` })),  // Prepend user ID to note IDs
    tasks: DEFAULT_TASKS.map((t) => ({ ...t, id: `${uid}-${t.id}` })),  // Prepend user ID to task IDs
  };
}

// Demo users array (empty - no demo users pre-configured)
export const DEMO_USERS = [];