import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Ic from "../components/common/Ic";
import Sidebar from "../components/layout/Sidebar";
import PageEditor from "../components/pages/PageEditor";
import NotesGrid from "../components/notes/NotesGrid";
import TaskBoard from "../components/tasks/TaskBoard";
import ChatPanel from "../components/chat/ChatPanel";
import HomeView from "../views/HomeView";
import SearchView from "../views/SearchView";
import InboxView from "../views/InboxView";
import { generateNewPage } from "../data/defaults";

export default function Dashboard() {
  const { user, getData, setPages, setTasks, logout } = useAuth();
  const t = useTheme();

  const welcomePageId = `${user?.id}-p1`;
  const [activeId, setActiveId] = useState(welcomePageId);
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
  const pages = data?.pages || [];
  const tasks = data?.tasks || [];
  
  const myNotesPage = pages.find(p => p.title === "My Notes");
  const activePage = pages.find((p) => p.id === activeId) || pages[0];

  const handleSetActivePage = (id) => {
    const clickedPage = pages.find(p => p.id === id);
    if (clickedPage?.title === "My Notes") {
      setShowNotesGrid(true);
      setActiveNav(null);
      setActiveId(null);
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
    setActiveId(myNotesPage?.id || null);
    setNotesVersion(prev => prev + 1);
  };

  const openNewNoteModal = () => {
    const existingNotes = pages.filter(p => p.type !== "tasks" && p.title !== "Welcome to MindTask" && p.title !== "My Notes");
    const defaultTitle = `Untitled ${existingNotes.length + 1}`;
    setNewNoteTitle(defaultTitle);
    setShowTitleModal(true);
  };

  const createNewNote = () => {
    const newPage = generateNewPage(user?.id || "user");
    if (newNoteTitle && newNoteTitle.trim()) {
      newPage.title = newNoteTitle.trim();
    }
    
    setPages((prevPages) => [...prevPages, newPage]);
    setActiveId(newPage.id);
    setShowNotesGrid(false);
    setNotesVersion(prev => prev + 1);
    setShowTitleModal(false);
    setNewNoteTitle("");
  };

  const cancelModal = () => {
    setShowTitleModal(false);
    setNewNoteTitle("");
  };

  const deletePage = (id) => {
    setPages((prevPages) => prevPages.filter((pg) => pg.id !== id));
    if (activeId === id) {
      setActiveId(welcomePageId);
      setShowNotesGrid(false);
    }
    setNotesVersion(prev => prev + 1);
  };

  const updatePage = (id, field, val) => {
    setPages((prevPages) => {
      const updatedPages = prevPages.map((pg) => {
        if (pg.id === id) {
          return { ...pg, [field]: val };
        }
        return pg;
      });
      return updatedPages;
    });
    setNotesVersion(prev => prev + 1);
  };

  const cleanTitle = (title = "") => title.replace(" 🌱", "");

  const topbarTitle = activeNav
    ? activeNav
    : showNotesGrid
    ? "My Notes"
    : activePage
    ? cleanTitle(activePage.title)
    : "MindTask";

  const renderContent = () => {
    if (activeNav === "Home") {
      return (
        <HomeView
          user={user}
          pages={pages}
          tasks={tasks}
          setActiveId={handleSetActivePage}
          setActiveNav={setActiveNav}
          t={t}
        />
      );
    }

    if (activeNav === "Search") {
      return (
        <SearchView
          pages={pages}
          tasks={tasks}
          setActiveId={handleSetActivePage}
          setActiveNav={setActiveNav}
          t={t}
        />
      );
    }

    if (activeNav === "Inbox") {
      return <InboxView t={t} />;
    }

    if (showNotesGrid) {
      const notePages = pages.filter(p => p.type !== "tasks" && p.title !== "Welcome to MindTask" && p.title !== "My Notes");
      return (
        <NotesGrid
          key={notesVersion}
          notes={notePages}
          onOpen={handleOpenNote}
          onAdd={openNewNoteModal}
          t={t}
          user={user}
        />
      );
    }

    if (activePage?.type === "tasks") {
      return <TaskBoard tasks={tasks} onUpdate={setTasks} />;
    }

    if (activePage) {
      const isNote = activePage.title !== "Welcome to MindTask" && activePage.type !== "tasks";
      return (
        <PageEditor 
          key={activePage.id + notesVersion}
          page={activePage} 
          onUpdate={updatePage} 
          user={user} 
          onBack={isNote ? handleBackToNotesGrid : null}
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
        pages={pages}
        activePage={activeNav ? null : (showNotesGrid ? null : activePage)}
        setActivePage={handleSetActivePage}
        onAdd={openNewNoteModal}
        onDelete={deletePage}
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
                background: user?.color || t.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 12,
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            >
              {user?.avatar}
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

      {/* Custom Modal for New Note Title - Fixed Size */}
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