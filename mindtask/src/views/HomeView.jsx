/**
 * Component: HomeView
 * Description: The home/dashboard overview page shown when user clicks "Home" in navigation.
 * Displays a personalized greeting, task statistics (todo/in-progress/done counts),
 * and a list of main pages (Welcome, My Notes, My Tasks) for quick navigation.
 * 
 * @param {Object} props
 * @param {Object} props.user - Current authenticated user object
 * @param {Array} props.notes - Array of all user notes (filtered to show only main 3 types)
 * @param {Array} props.tasks - Array of all user tasks for calculating statistics
 * @param {Function} props.setActiveId - Function to navigate to a specific note/page
 * @param {Function} props.setActiveNav - Function to clear active navigation state
 * @param {Object} props.t - Theme object from useTheme() for styling
 * 
 * @returns {JSX.Element} Home view with greeting, stats cards, and recent pages list
 */
export default function HomeView({
  user,
  notes = [],
  tasks = [],
  setActiveId,
  setActiveNav,
  t,
}) {
  // Calculate task statistics by status
  const done = tasks.filter((tk) => tk.status === "done").length;
  const inProgress = tasks.filter((tk) => tk.status === "in-progress").length;
  const todo = tasks.filter((tk) => tk.status === "todo").length;

  // Extract user's first name for personalized greeting
  const firstName = user?.name?.split(" ")[0] || "User";

  // Configuration for the three statistics cards
  const stats = [
    { label: "To Do", count: todo, color: "#6b7280", emoji: "📋" },
    { label: "In Progress", count: inProgress, color: "#fbbf24", emoji: "⚡" },
    { label: "Completed", count: done, color: "#4ade80", emoji: "✅" },
  ];

  // Filter to show only the three main system notes (welcome, notes-grid, tasks)
  const mainNotes = notes.filter(n => 
    n.type === "welcome" || n.type === "notes-grid" || n.type === "tasks"
  );

  return (
    <div
      style={{
        padding: "80px 60px",
        maxWidth: 980,
        margin: "0 auto",
        width: "100%",
      }}
    >
      {/* Greeting Section - Personalized welcome message */}
      <div style={{ textAlign: "center", marginBottom: 46 }}>
        <h1
          style={{
            fontSize: "2.4rem",
            fontWeight: 700,
            fontFamily: "'Lora', serif",
            color: t.text,
            margin: 0,
          }}
        >
          Hi {firstName} 👋
        </h1>

        <p
          style={{
            color: t.muted,
            fontSize: 15,
            marginTop: 12,
          }}
        >
          Where should we start?
        </p>
      </div>

      {/* Stats Cards - Displays To Do, In Progress, Completed counts */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 42,
        }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              background: t.card,
              border: `1px solid ${t.border}`,
              borderRadius: 14,
              padding: "22px 24px",
              boxShadow: "0 8px 25px rgba(0,0,0,0.18)",
              transition: "transform 0.15s ease, background 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.background = t.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.background = t.card;
            }}
          >
            <div style={{ fontSize: 26, marginBottom: 14 }}>{s.emoji}</div>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: 800,
                color: s.color,
                lineHeight: 1,
              }}
            >
              {s.count}
            </div>
            <div
              style={{
                fontSize: 13,
                color: t.muted,
                marginTop: 10,
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Pages Section - Quick navigation to main notes */}
      <div>
        <div
          style={{
            fontSize: 12,
            color: t.muted,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 14,
          }}
        >
          Recent Pages
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {mainNotes.slice(0, 5).map((note) => (
            <div
              key={note.id}
              onClick={() => {
                setActiveId(note.id);
                setActiveNav(null);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "15px 18px",
                background: t.card,
                border: `1px solid ${t.border}`,
                borderRadius: 12,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(0,0,0,0.14)",
                transition: "background 0.15s ease, transform 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = t.hover;
                e.currentTarget.style.transform = "translateX(4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = t.card;
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              <span style={{ fontSize: 20 }}>{note.icon || "📄"}</span>
              <span
                style={{
                  fontSize: 14.5,
                  fontWeight: 600,
                  color: t.text,
                }}
              >
                {note.title}
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 11,
                  color: t.muted,
                  background: t.tagBg,
                  padding: "4px 9px",
                  borderRadius: 7,
                }}
              >
                {note.type === "tasks" ? "Tasks" : note.type === "welcome" ? "Welcome" : "Page"}
              </span>
            </div>
          ))}

          {/* Empty state when no recent pages exist */}
          {mainNotes.length === 0 && (
            <div
              style={{
                padding: "18px",
                background: t.card,
                border: `1px dashed ${t.border}`,
                borderRadius: 12,
                color: t.muted,
                textAlign: "center",
                fontSize: 14,
              }}
            >
              No recent pages yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}