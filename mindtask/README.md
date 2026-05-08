# MindTask – Productivity Meets Wellness

## How to Execute This System

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB instance running locally or connection string ready

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd IT172_MindTask
   ```

2. **Install dependencies**
   ```bash
   cd mindtask
   npm install
   ```

3. **Configure environment variables**
   Create a `.env.local` file with VITE_API_URL and DATABASE_URL

4. **Start the server**
   ```bash
   npm run server
   ```

5. **Start the development client**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

---

## How the System Flow Works

### User Authentication Flow
1. User lands on **AuthPage** and can either Log In or Create Account
2. **Login**: Email & password validated against database, redirects to Dashboard
3. **Register**: Full Name, Email & Password provided, account created in MongoDB
4. Auth state stored in **AuthContext** for persistent sessions

### Navigation & Layout
After login, user sees **Dashboard** with sidebar providing access to:
- Home (main dashboard)
- Search (find notes and tasks)
- Notes (note-taking interface)
- Tasks (Kanban board)
- Chat (AI wellness companion)

### Notes Management Flow
1. Notes section displays **NotesGrid** with all saved notes
2. Create new note with rich text editor
3. Edit opens **PageEditor** with markdown support
4. Changes auto-save to MongoDB via API
5. Delete notes with confirmation modal

### Task Management Flow
1. **TaskBoard** displays Kanban columns (To Do, In Progress, Done)
2. Create task with title, description, priority (High/Medium/Low), and tags
3. Click task circle to move between columns
4. Filter by priority and delete with confirmation

### AI Wellness Chat Flow
1. Open Chat opens **ChatPanel**
2. Type questions about wellness, exercises, or motivation
3. Backend processes via Gemini AI
4. Response streamed back in chat interface
5. Chat history maintained during session

### Theme Management
1. **ThemeContext** manages light/dark theme state
2. Toggle Light/Dark mode via UI
3. Theme preference persists in localStorage
4. All components subscribe for instant UI updates

### Data Flow Architecture
```
User Input → State Update → API Call → Server Handler → Database → Response → UI Re-render
```

### Key Components Interaction
- **App.jsx**: Main component orchestrating routing and context providers
- **AuthContext**: Manages login/register/logout logic
- **ThemeContext**: Manages light/dark theme state
- **api.js**: Centralized API communication layer
- **server.js**: Express backend handling all requests
- **Prisma**: Database schema and migrations
- Rich text editor with markdown support
- Notes grid – view all your notes at a glance
- Create, edit, delete notes with confirmation modals
- Auto‑saving and timestamps

Task Board
- Kanban‑style columns: To Do, In Progress, Done
- One‑click status cycle – click the circle to move tasks forward
- Priority levels: High, Medium, Low
- Pre‑defined tags: Dev, Design, AI, QA, Planning, DevOps, Research, Other
- Filter by priority – focus on what matters most
- Delete tasks with confirmation

MindEase Wellness Chat
- Built‑in AI companion for mental wellness
- Ask for breathing exercises, motivation, or just talk
- Accessible via “Open Chat” button in the sidebar

User Experience
- Light / Dark theme toggle – persistent across sessions
- Responsive layout – works on desktop and tablets
- Sidebar navigation – Home, Search, and all your pages
- Search – instantly find notes and tasks by keyword
- User authentication – login / signup with validation

Authentication
- Email & password login
- Account creation with full name validation
- Error messages for missing fields or wrong credentials

TECH STACK

Layer                                                              Technology
Frontend -                                                        React (Vite)
Styling -                                             Inline styles + CSS (customizable)
State -                                               React Context API (useAuth, useTheme)
Icons -                                               Font Awesome 6 (via Ic.jsx wrapper)
Data Layer -                                          Prisma (schema in prisma/schema.prisma)
Backend / DB -                                        MongoDB - the app is ready to 
                                                      connect to PostgreSQL / SQLite via Prisma


