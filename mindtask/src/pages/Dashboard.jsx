import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Ic from "../components/common/Ic";
import Sidebar from "../components/layout/Sidebar";
import PageEditor from "../components/pages/PageEditor";
import TaskBoard from "../components/tasks/TaskBoard";
import ChatPanel from "../components/chat/ChatPanel";
import HomeView from "../views/HomeView";
import SearchView from "../views/SearchView";
import InboxView from "../views/InboxView";

export default function Dashboard() {
  const { user, getData, setPages, setTasks, logout } = useAuth();
  const t = useTheme();

  const welcomePageId = `${user?.id}-p1`;
  const [activeId, setActiveId] = useState(welcomePageId);
  const [activeNav, setActiveNav] = useState(null);
  const [openedNote, setOpenedNote] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
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
  const activePage = pages.find((p) => p.id === activeId) || pages[0];

  const handleSetActivePage = (id) => {
    setActiveId(id);
    setActiveNav(null);
    setOpenedNote(null);
  };

  const addPage = () => {
    const id = `${user.id}-p${Date.now()}`;
    const newPage = {
      id,
      title: "Untitled",
      icon: "📄",
      content: "",
      type: "page",
    };

    setPages((p) => [...p, newPage]);
    setActiveId(id);
  };

  const deletePage = (id) => {
    setPages((p) => p.filter((pg) => pg.id !== id));
  };

  const updatePage = (id, field, val) => {
    setPages((p) =>
      p.map((pg) => (pg.id === id ? { ...pg, [field]: val } : pg))
    );
  };

  const cleanTitle = (title = "") => title.replace(" 🌱", "");

  const topbarTitle = activeNav
    ? activeNav
    : openedNote
    ? cleanTitle(openedNote.title)
    : activePage
    ? cleanTitle(activePage.title)
    : "MindTask";

  const renderContent = () => {
    if (activeNav === "Home")
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

    if (activeNav === "Search")
      return (
        <SearchView
          pages={pages}
          tasks={tasks}
          setActiveId={handleSetActivePage}
          setActiveNav={setActiveNav}
          t={t}
        />
      );

    if (activeNav === "Inbox") return <InboxView t={t} />;

    if (activePage?.type === "tasks") {
      return <TaskBoard tasks={tasks} onUpdate={setTasks} />;
    }

    return <PageEditor page={activePage} onUpdate={updatePage} />;
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
        activePage={activeNav ? null : activePage}
        setActivePage={handleSetActivePage}
        onAdd={addPage}
        onDelete={deletePage}
        onChat={() => setChatOpen(true)}
        open={sidebarOpen}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* TOPBAR */}
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
            }}
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
            }}
          >
            <Ic n={t.dark ? "sun" : "moon"} size={16} />
          </button>

          {/* USER MENU */}
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
              }}
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
                {/* USER INFO */}
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

                {/* LOGOUT */}
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
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ flex: 1, overflow: "auto" }}>
          {renderContent()}
        </div>
      </div>

      {chatOpen && <ChatPanel onClose={() => setChatOpen(false)} />}
    </div>
  );
}