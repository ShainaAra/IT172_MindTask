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
import InboxView from "../views/InboxView";
import { DEFAULT_NOTES, generateNewNote } from "../data/defaults";

export default function Dashboard() {
  const { user, getData, setNotes, setTasks, logout, getUserInitials, getUserColor } = useAuth();
  const t = useTheme();

  const [activeId, setActiveId] = useState(null);
  const [activeNav, setActiveNav] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showNotesGrid, setShowNotesGrid] = useState(false);
  const [notesVersion, setNotesVersion] = useState(0);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const data = getData();
  const allNotes = data?.notes || [];
  const tasks = data?.tasks || [];

  // Debug: Log all notes to console
  useEffect(() => {
    console.log("========== ALL NOTES FROM DB ==========");
    allNotes.forEach(n => {
      console.log(`- Title: "${n.title}", Type: ${n.type || "undefined"}, ID: ${n.id}`);
    });
    console.log("=======================================");
  }, [allNotes]);

  // Find the three main notes - try multiple methods
  let welcomeNote = allNotes.find(n => n.type === "welcome");
  let myNotesNote = allNotes.find(n => n.type === "notes-grid");
  let myTasksNote = allNotes.find(n => n.type === "tasks");

  // If not found by type, try by title (for existing data)
  if (!welcomeNote) welcomeNote = allNotes.find(n => n.title === "Welcome to MindTask");
  if (!myNotesNote) myNotesNote = allNotes.find(n => n.title === "My Notes");
  if (!myTasksNote) myTasksNote = allNotes.find(n => n.title === "My Tasks");

  const defaultPageTitles = DEFAULT_NOTES.map((n) => n.title);

  // SIDEBAR NOTES: ONLY the three main notes
  const sidebarNotes = [
    welcomeNote,
    myNotesNote,
    myTasksNote
  ].filter(n => n && n.id); // Remove undefined/null

  // USER NOTES: only notes that are user-created, or notes with no type that don't match page titles
  const userNotes = allNotes.filter((n) =>
    n.type === "note" ||
    (!n.type && !defaultPageTitles.includes(n.title))
  );

  // Set initial active note
  useEffect(() => {
    if (!activeId && welcomeNote) {
      setActiveId(welcomeNote.id);
    }
  }, [welcomeNote, activeId]);

  const activeNote = allNotes.find((n) => n.id === activeId);

  const handleSetActiveNote = (id) => {
    const clickedNote = allNotes.find(n => n.id === id);
    if (clickedNote?.type === "notes-grid" || clickedNote?.title === "My Notes") {
      setShowNotesGrid(true);
      setActiveNav(null);
      setActiveId(null);
    } else if (clickedNote?.type === "tasks" || clickedNote?.title === "My Tasks") {
      setActiveId(id);
      setActiveNav(null);
      setShowNotesGrid(false);
    } else {
      setActiveId(id);
      setActiveNav(null);
      setShowNotesGrid(false);
    }
  };

  const handleOpenNote = (note) => {
    setActiveId(note.id);
    setShowNotesGrid(false);
  };

  const handleBackToNotesGrid = () => {
    setShowNotesGrid(true);
    setActiveNav(null);
    setActiveId(myNotesNote?.id || null);
    setNotesVersion(prev => prev + 1);
  };

  const openNewNoteModal = () => {
    const defaultTitle = `Untitled ${userNotes.length + 1}`;
    setNewNoteTitle(defaultTitle);
    setShowTitleModal(true);
  };

  const createNewNote = () => {
    const newNote = generateNewNote(user?.id);
    if (newNoteTitle && newNoteTitle.trim()) {
      newNote.title = newNoteTitle.trim();
    }
    
    setNotes((prevNotes) => [...prevNotes, newNote]);
    setActiveId(newNote.id);
    setShowNotesGrid(false);
    setNotesVersion(prev => prev + 1);
    setShowTitleModal(false);
    setNewNoteTitle("");
  };

  const cancelModal = () => {
    setShowTitleModal(false);
    setNewNoteTitle("");
  };

  const deleteNote = (id) => {
    setNotes((prevNotes) => prevNotes.filter((n) => n.id !== id));
    if (activeId === id) {
      setActiveId(welcomeNote?.id);
      setShowNotesGrid(false);
    }
    setNotesVersion(prev => prev + 1);
  };

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

  const cleanTitle = (title = "") => title.replace(" 🌱", "");

  const topbarTitle = activeNav
    ? activeNav
    : showNotesGrid
    ? "My Notes"
    : activeNote
    ? cleanTitle(activeNote.title)
    : "MindTask";

  const renderContent = () => {
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

    if (activeNav === "Inbox") {
      return <InboxView t={t} />;
    }

    if (showNotesGrid) {
      return (
        <NotesGrid
          key={notesVersion}
          notes={userNotes}
          onOpen={handleOpenNote}
          onAdd={openNewNoteModal}
          onDelete={deleteNote}
          t={t}
          user={user}
        />
      );
    }

    if (activeNote?.type === "tasks" || activeNote?.title === "My Tasks") {
      return <TaskBoard tasks={tasks} onUpdate={setTasks} />;
    }

    if (activeNote && (activeNote.type === "note" || userNotes.some(n => n.id === activeNote?.id))) {
      return (
        <PageEditor 
          key={activeNote.id + notesVersion}
          page={activeNote}
          onUpdate={updateNote}
          user={user} 
          onBack={handleBackToNotesGrid}
        />
      );
    }

    if (activeNote) {
      return (
        <PageEditor 
          key={activeNote.id + notesVersion}
          page={activeNote}
          onUpdate={updateNote}
          user={user} 
          onBack={null}
        />
      );
    }

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
      <Sidebar
        pages={sidebarNotes}
        activePage={activeNav ? null : (showNotesGrid ? null : activeNote)}
        setActivePage={handleSetActiveNote}
        onAdd={openNewNoteModal}
        onDelete={deleteNote}
        onChat={() => setChatOpen(true)}
        open={sidebarOpen}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
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

          <div style={{ flex: 1, fontWeight: 600 }}>{topbarTitle}</div>

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

        <div style={{ flex: 1, overflow: "auto" }}>
          {renderContent()}
        </div>
      </div>

      {chatOpen && <ChatPanel onClose={() => setChatOpen(false)} />}

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
          onClick={cancelModal}
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
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: t.text, marginBottom: 8 }}>
              New Note
            </h2>
            <p style={{ fontSize: 13, color: t.muted, marginBottom: 24 }}>
              Enter a title for your new note
            </p>
            
            <input
              type="text"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createNewNote()}
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