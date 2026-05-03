export const DEFAULT_PAGES = [
  {
    id: "p1",
    title: "Welcome to MindTask",
    icon: "🌱",
    content:
      "This is your personal productivity space with a mental wellness companion.\n\n## Getting Started\n\n- Create pages for your notes and ideas\n- Manage your tasks with the Task Board\n- Chat with MindEase whenever you feel stressed\n\n> *Tip:* Click the 💬 button in the bottom right to open your wellness companion anytime.",
    type: "page",
  },
  {
    id: "p2",
    title: "My Notes",
    icon: "📝",
    content:
      "# My Notes\n\nUse this page to jot down your thoughts, ideas, and reflections.\n\n## Today's Focus\n\n- What's the most important thing to accomplish today?\n- What can I let go of?\n- How am I feeling right now?\n\n> Small consistent steps lead to big changes. 🌿",
    type: "page",
  },
  {
    id: "p3",
    title: "My Tasks",
    icon: "✅",
    content: "",
    type: "tasks",
  },
];

export const DEFAULT_TASKS = [
  {
    id: "t1",
    title: "Review project requirements",
    status: "done",
    priority: "high",
    tag: "Planning",
  },
  {
    id: "t2",
    title: "Set up development environment",
    status: "done",
    priority: "high",
    tag: "Dev",
  },
  {
    id: "t3",
    title: "Design UI wireframes",
    status: "in-progress",
    priority: "high",
    tag: "Design",
  },
  {
    id: "t4",
    title: "Build authentication system",
    status: "todo",
    priority: "high",
    tag: "Dev",
  },
  {
    id: "t5",
    title: "Integrate AI chatbot API",
    status: "todo",
    priority: "medium",
    tag: "AI",
  },
  {
    id: "t6",
    title: "Write unit tests",
    status: "todo",
    priority: "low",
    tag: "QA",
  },
];

// Counter for generating unique note titles
let noteCounter = 1;

// Helper function to generate a new page with EMPTY content (no pre-filled text)
export function generateNewPage(uid = "user") {
  const timestamp = Date.now();
  const noteNumber = noteCounter++;
  
  return {
    id: `${uid}-new-${timestamp}`,
    title: `Untitled ${noteNumber}`,
    icon: "📄",
    content: "", // Empty content - user will write their own
    type: "page",
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
  };
}

// Reset counter function
export function resetNoteCounter() {
  noteCounter = 1;
}

export function makeUserData(uid) {
  resetNoteCounter();
  return {
    pages: DEFAULT_PAGES.map((p) => ({ ...p, id: `${uid}-${p.id}` })),
    tasks: DEFAULT_TASKS.map((t) => ({ ...t, id: `${uid}-${t.id}` })),
  };
}

export const DEMO_USERS = [
  {
    id: "u1",
    name: "Alex Rivera",
    email: "alex@mindtask.app",
    password: "demo123",
    avatar: "AR",
    color: "#5b8af0",
  },
  {
    id: "u2",
    name: "Jamie Lee",
    email: "jamie@mindtask.app",
    password: "demo123",
    avatar: "JL",
    color: "#c084fc",
  },
  {
    id: "u3",
    name: "Sam Torres",
    email: "sam@mindtask.app",
    password: "demo123",
    avatar: "ST",
    color: "#4ade80",
  },
];