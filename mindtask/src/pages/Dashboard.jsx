import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/useAuth";
import { useTheme } from "../context/useTheme";
import Ic from "../components/common/Ic";
import Sidebar from "../components/layout/Sidebar";
import PageEditor from "../components/pages/PageEditor";
import NotesGrid from "../components/notes/NotesGrid";
import TaskBoard from "../components/tasks/TaskBoard";
import ChatPanel from "../components/chat/ChatPanel";
import HomeView from "../views/HomeView";
import SearchView from "../views/SearchView";
import { DEFAULT_NOTES, generateNewNote } from "../data/defaults";

/**
 * Component: Dashboard
 * Description: Main dashboard component that orchestrates the entire application.
 * Manages state for:
 * - Sidebar navigation and chat panel
 * - Note and task management
 * - User authentication display
 * - Theme switching
 * - Modal dialogs for note creation
 * - Routing between Home, Search, Notes Grid, Task Board, and individual notes
 * 
 * Features:
 * - Collapsible sidebar
 * - Dark/light mode toggle
 * - User menu with logout
 * - Title modal for new note creation
 * - Type-based page rendering (welcome, notes-grid, tasks, regular notes)
 * - Auto-selection of welcome note on first load
 * 
 * @returns {JSX.Element} Dashboard layout with sidebar, content area, and chat panel
 */
export default function Dashboard() {
  // Authentication context for user data and CRUD operations
  const { user, getData, setNotes, setTasks, logout, getUserInitials, getUserColor } = useAuth();
  const t = useTheme(); // Theme context for styling

  // UI State Management
  const [activeId, setActiveId] = useState(null);           // Currently selected note ID
  const [activeNav, setActiveNav] = useState(null);         // Active navigation item ("Home", "Search", etc.)
  const [sidebarOpen, setSidebarOpen] = useState(true);     // Sidebar visibility
  const [chatOpen, setChatOpen] = useState(false);          // Chat panel visibility
  const [userMenuOpen, setUserMenuOpen] = useState(false);  // User dropdown menu visibility
  const [showNotesGrid, setShowNotesGrid] = useState(false); // Whether to show notes grid view
  const [notesVersion, setNotesVersion] = useState(0);       // Version counter to force re-renders
  const [showTitleModal, setShowTitleModal] = useState(false); // New note title modal visibility
  const [newNoteTitle, setNewNoteTitle] = useState("");      // Title input for new note
  const [newlyCreatedNoteId, setNewlyCreatedNoteId] = useState(null); // Track newly created note for special handling
  
  const userMenuRef = useRef(null); // Ref for detecting clicks outside user menu

  /**
   * Effect: Handle clicks outside user menu to close it
   * Sets up event listener for closing dropdown when clicking elsewhere
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get user data from context (notes and tasks)
  const data = getData();
  const allNotes = data?.notes || [];
  const tasks = data?.tasks || [];

  /**
   * Effect: Debug logging - logs all notes to console
   * Useful for debugging note types and structure
   */
  useEffect(() => {
    console.log("========== ALL NOTES FROM DB ==========");
    allNotes.forEach(n => {
      console.log(`- Title: "${n.title}", Type: ${n.type || "undefined"}, ID: ${n.id}`);
    });
    console.log("=======================================");
  }, [allNotes]);

  // Find the three main system notes by type or title
  let welcomeNote = allNotes.find(n => n.type === "welcome");
  let myNotesNote = allNotes.find(n => n.type === "notes-grid");
  let myTasksNote = allNotes.find(n => n.type === "tasks");

  // Fallback: If not found by type, try by title (for existing data compatibility)
  if (!welcomeNote) welcomeNote = allNotes.find(n => n.title === "Welcome to MindTask");
  if (!myNotesNote) myNotesNote = allNotes.find(n => n.title === "My Notes");
  if (!myTasksNote) myTasksNote = allNotes.find(n => n.title === "My Tasks");

  // List of default page titles to filter out from user notes
  const defaultPageTitles = DEFAULT_NOTES.map((n) => n.title);

  // SIDEBAR NOTES: Only the three main system notes appear in sidebar
  const sidebarNotes = [
    welcomeNote,
    myNotesNote,
    myTasksNote
  ].filter(n => n && n.id); // Filter out any undefined/null values

  // USER NOTES: Only user-created notes or notes without type that don't match default titles
  const userNotes = allNotes.filter((n) =>
    n.type === "note" ||
    (!n.type && !defaultPageTitles.includes(n.title))
  );

  /**
   * Effect: Set initial active note to welcome note when dashboard loads
   */
  useEffect(() => {
    if (!activeId && welcomeNote) {
      setActiveId(welcomeNote.id);
    }
  }, [welcomeNote, activeId]);

  /**
   * Effect: Keep chat and welcome page synchronized
   * When chat opens, automatically navigate to welcome note
   */
  useEffect(() => {
    if (chatOpen && welcomeNote?.id) {
      setActiveId(welcomeNote.id);
      setActiveNav(null);
      setShowNotesGrid(false);
    }
  }, [chatOpen, welcomeNote?.id]);

  // Find the currently active note object
  const activeNote = allNotes.find((n) => n.id === activeId);

  /**
   * Function: handleSetActiveNote
   * Description: Handles navigation when a note is clicked in sidebar
   * Routes to appropriate view based on note type
   * 
   * @param {string} id - ID of the note to navigate to
   */
  const handleSetActiveNote = (id) => {
    const clickedNote = allNotes.find(n => n.id === id);
    if (clickedNote?.type === "notes-grid" || clickedNote?.title === "My Notes") {
      setShowNotesGrid(true);
      setActiveNav(null);
      setActiveId(null);
      setNewlyCreatedNoteId(null); // Reset flag when navigating
    } else if (clickedNote?.type === "tasks" || clickedNote?.title === "My Tasks") {
      setActiveId(id);
      setActiveNav(null);
      setShowNotesGrid(false);
      setNewlyCreatedNoteId(null); // Reset flag when navigating
    } else {
      setActiveId(id);
      setActiveNav(null);
      setShowNotesGrid(false);
      setNewlyCreatedNoteId(null); // Reset flag when navigating
    }
  };

  /**
   * Function: handleOpenNote
   * Description: Opens a specific note from the notes grid view
   * 
   * @param {Object} note - Note object to open
   */
  const handleOpenNote = (note) => {
    setActiveId(note.id);
    setShowNotesGrid(false);
    setNewlyCreatedNoteId(null); // Reset flag when opening existing note
  };

  /**
   * Function: handleBackToNotesGrid
   * Description: Navigates back to the notes grid view from a note
   */
  const handleBackToNotesGrid = () => {
    setShowNotesGrid(true);
    setActiveNav(null);
    setActiveId(myNotesNote?.id || null);
    setNotesVersion(prev => prev + 1); // Force re-render of NotesGrid
    setNewlyCreatedNoteId(null); // Reset flag when going back
  };

  /**
   * Function: openNewNoteModal
   * Description: Opens the modal dialog for creating a new note
   * Pre-fills title with default "Untitled X" based on existing notes count
   */
  const openNewNoteModal = () => {
    const defaultTitle = `Untitled ${userNotes.length + 1}`;
    setNewNoteTitle(defaultTitle);
    setShowTitleModal(true);
  };

  /**
   * Function: createNewNote
   * Description: Creates a new note with user-provided or default title
   * Adds to notes list, navigates to the new note, and tracks it as newly created
   */
  const createNewNote = () => {
    const newNote = generateNewNote(user?.id);
    if (newNoteTitle && newNoteTitle.trim()) {
      newNote.title = newNoteTitle.trim();
    }
    
    setNotes((prevNotes) => [...prevNotes, newNote]);
    setActiveId(newNote.id);
    setNewlyCreatedNoteId(newNote.id); // Track that this is a newly created note
    setShowNotesGrid(false);
    setNotesVersion(prev => prev + 1);
    setShowTitleModal(false);
    setNewNoteTitle("");
  };

  /**
   * Function: cancelModal
   * Description: Closes the new note modal without creating a note
   */
  const cancelModal = () => {
    setShowTitleModal(false);
    setNewNoteTitle("");
  };

  /**
   * Function: deleteNote
   * Description: Deletes a note by ID, updates notes list,
   * and navigates to welcome note if the active note was deleted
   * 
   * @param {string} id - ID of the note to delete
   */
  const deleteNote = (id) => {
    setNotes((prevNotes) => prevNotes.filter((n) => n.id !== id));
    if (activeId === id) {
      setActiveId(welcomeNote?.id);
      setShowNotesGrid(false);
    }
    setNotesVersion(prev => prev + 1);
    setNewlyCreatedNoteId(null); // Reset flag when deleting
  };

  /**
   * Function: updateNote
   * Description: Updates a specific field of a note (title, content, icon)
   * 
   * @param {string} id - ID of the note to update
   * @param {string} field - Field name to update ("title", "content", "icon")
   * @param {any} val - New value for the field
   */
  const updateNote = (id, field, val) => {
    setNotes((prevNotes) => {
      const updatedNotes = prevNotes.map((n) => {
        if (n.id === id) {
          return { ...n, [field]: val, updatedAt: new Date().toISOString() };
        }
        return n;
      });
      return updatedNotes;
    });
    setNotesVersion(prev => prev + 1);
  };

  /**
   * Function: cleanTitle
   * Description: Removes " 🌱" suffix from note titles for display
   * 
   * @param {string} title - Title to clean
   * @returns {string} Cleaned title without suffix
   */
  const cleanTitle = (title = "") => title.replace(" 🌱", "");

  // Determine the title to display in the top bar
  const topbarTitle = activeNav
    ? activeNav
    : showNotesGrid
    ? "My Notes"
    : activeNote
    ? cleanTitle(activeNote.title)
    : "MindTask";

  /**
   * Function: renderContent
   * Description: Main content router - renders appropriate component based on current view
   * Handles: Home, Search, Notes Grid, Task Board, Page Editor, and fallback states
   * 
   * @returns {JSX.Element} Content component for the current view
   */
  const renderContent = () => {
    // Home View routing
    if (activeNav === "Home") {
      return (
        <HomeView
          user={user}
          notes={sidebarNotes}
          tasks={tasks}
          setActiveId={handleSetActiveNote}
          setActiveNav={setActiveNav}
          t={t}
        />
      );
    }

    // Search View routing
    if (activeNav === "Search") {
      return (
        <SearchView
          notes={allNotes}
          tasks={tasks}
          setActiveId={handleSetActiveNote}
          setActiveNav={setActiveNav}
          t={t}
        />
      );
    }

    // Notes Grid View (shows all user-created notes)
    if (showNotesGrid) {
      return (
        <NotesGrid
          key={notesVersion} // Force re-render when notes change
          notes={userNotes}
          onOpen={handleOpenNote}
          onAdd={openNewNoteModal}
          onDelete={deleteNote}
          t={t}
          user={user}
        />
      );
    }

    // Task Board View
    if (activeNote?.type === "tasks" || activeNote?.title === "My Tasks") {
      return <TaskBoard tasks={tasks} onUpdate={setTasks} />;
    }

    // User-Created Note Editor (with back button)
    if (activeNote && (activeNote.type === "note" || userNotes.some(n => n.id === activeNote?.id))) {
      return (
        <PageEditor 
          key={activeNote.id + notesVersion}
          page={activeNote}
          onUpdate={updateNote}
          user={user} 
          onBack={handleBackToNotesGrid}
          isNewlyCreated={newlyCreatedNoteId === activeNote.id} // Pass flag to trigger special behavior
        />
      );
    }

    // System Note Editor (welcome note, etc. - no back button)
    if (activeNote) {
      return (
        <PageEditor 
          key={activeNote.id + notesVersion}
          page={activeNote}
          onUpdate={updateNote}
          user={user} 
          onBack={null}
          isNewlyCreated={newlyCreatedNoteId === activeNote.id}
        />
      );
    }

    // Fallback empty state
    return <div style={{ padding: "48px", color: t.muted }}>Select a page from the sidebar</div>;
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        background: t.bg,
        color: t.text,
      }}
    >
      {/* Sidebar Component */}
      <Sidebar
        pages={sidebarNotes}
        activePage={activeNav ? null : (showNotesGrid ? null : activeNote)}
        setActivePage={handleSetActiveNote}
        onAdd={openNewNoteModal}
        onDelete={deleteNote}
        onChat={() => {
          if (welcomeNote?.id) {
            setActiveId(welcomeNote.id);
            setActiveNav(null);
            setShowNotesGrid(false);
          }
          setChatOpen(true);
        }}
        open={sidebarOpen}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top Bar */}
        <div
          style={{
            height: 70,
            borderBottom: `1px solid ${t.border}`,
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            gap: 10,
            background: t.surface,
          }}
        >
          {/* Sidebar Toggle Button */}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            style={{
              color: t.muted,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              borderRadius: 6,
              padding: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s",
              outline: "none",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = t.hover}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <Ic n="menu" size={16} />
          </button>

          {/* Current View Title */}
          <div style={{ flex: 1, fontWeight: 600 }}>{topbarTitle}</div>

          {/* Theme Toggle Button */}
          <button
            onClick={t.toggle}
            style={{
              color: t.muted,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              borderRadius: 6,
              padding: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s",
              outline: "none",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = t.hover}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <Ic n={t.dark ? "sun" : "moon"} size={16} />
          </button>

          {/* User Menu Dropdown */}
          <div ref={userMenuRef} style={{ position: "relative" }}>
            <div
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: getUserColor(),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 13,
                transition: "opacity 0.2s",
                textTransform: "uppercase",
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            >
              {getUserInitials()}
            </div>

            {/* Dropdown Menu Content */}
            {userMenuOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 8px)",
                  background: t.surface,
                  border: `1px solid ${t.border}`,
                  borderRadius: 10,
                  padding: 10,
                  zIndex: 300,
                  boxShadow: t.shadowLg,
                  minWidth: 220,
                }}
              >
                {/* User Info Section */}
                <div
                  style={{
                    padding: "8px 10px 10px",
                    borderBottom: `1px solid ${t.border}`,
                    marginBottom: 6,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    {user?.name}
                  </div>
                  <div style={{ fontSize: 12, color: t.muted }}>
                    {user?.email}
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    color: t.text,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "8px 10px",
                    borderRadius: 6,
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = t.hover}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div style={{ flex: 1, overflow: "auto" }}>
          {renderContent()}
        </div>
      </div>

      {/* Chat Panel (conditionally rendered) */}
      {chatOpen && <ChatPanel onClose={() => setChatOpen(false)} />}

      {/* New Note Title Modal */}
      {showTitleModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={cancelModal} // Click backdrop to cancel
        >
          <div
            style={{
              background: t.surface,
              borderRadius: 20,
              padding: 28,
              width: 420,
              maxWidth: "90%",
              boxShadow: t.shadowLg,
              border: `1px solid ${t.border}`,
            }}
            onClick={(e) => e.stopPropagation()} // Prevent backdrop click when clicking inside modal
          >
            <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: t.text, marginBottom: 8 }}>
              New Note
            </h2>
            <p style={{ fontSize: 13, color: t.muted, marginBottom: 24 }}>
              Enter a title for your new note
            </p>
            
            {/* Title Input Field */}
            <input
              type="text"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createNewNote()} // Enter key submits
              onClick={(e) => e.stopPropagation()}
              placeholder="Note title..."
              autoFocus
              style={{
                width: "100%",
                padding: "14px 16px",
                background: t.inputBg,
                border: `1px solid ${t.border}`,
                borderRadius: 12,
                color: t.text,
                fontSize: 15,
                outline: "none",
                marginBottom: 28,
                boxSizing: "border-box",
              }}
            />
            
            {/* Modal Action Buttons */}
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                onClick={cancelModal}
                style={{
                  padding: "10px 24px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  background: "transparent",
                  border: `1px solid ${t.border}`,
                  color: t.muted,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = t.accent;
                  e.currentTarget.style.color = t.accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = t.border;
                  e.currentTarget.style.color = t.muted;
                }}
              >
                Cancel
              </button>
              <button
                onClick={createNewNote}
                style={{
                  padding: "10px 24px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  background: t.accent,
                  border: "none",
                  color: "#fff",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = t.accentDark || "#4a6fd8"}
                onMouseLeave={(e) => e.currentTarget.style.background = t.accent}
              >
                Create Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}