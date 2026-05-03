import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import Ic from "../common/Ic";

const NOTE_COLORS = ["#5b8af0","#c084fc","#4ade80","#fbbf24","#f87171","#34d399","#60a5fa","#f472b6"];

export default function NotesGrid({ notes, onOpen, onAdd, t, user }) {
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  };

  return (
    <div style={{ padding: "48px 60px 80px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 44 }}>📝</span>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, fontFamily: "'Lora',serif", color: t.text }}>My Notes</h1>
            <p style={{ fontSize: 13, color: t.muted, marginTop: 3 }}>{notes.length} notes</p>
          </div>
        </div>
        
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setViewMode("grid")}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              background: viewMode === "grid" ? t.accent : "transparent",
              border: `1px solid ${viewMode === "grid" ? t.accent : t.border}`,
              cursor: "pointer",
              color: viewMode === "grid" ? "#fff" : t.muted,
              fontSize: 12,
              transition: "all 0.2s",
            }}
          >
            ⊞ Grid
          </button>
          <button
            onClick={() => setViewMode("list")}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              background: viewMode === "list" ? t.accent : "transparent",
              border: `1px solid ${viewMode === "list" ? t.accent : t.border}`,
              cursor: "pointer",
              color: viewMode === "list" ? "#fff" : t.muted,
              fontSize: 12,
              transition: "all 0.2s",
            }}
          >
            ☰ List
          </button>
          <button
            onClick={onAdd}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: t.accent,
              border: "none",
              borderRadius: 8,
              padding: "6px 14px",
              color: "#fff",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              marginLeft: 8,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
          >
            + New Note
          </button>
        </div>
      </div>

      {/* Notes View */}
      {notes.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            background: t.card,
            border: `1px dashed ${t.border}`,
            borderRadius: 12,
          }}
        >
          <span style={{ fontSize: 48, opacity: 0.5 }}>📝</span>
          <p style={{ color: t.muted, marginTop: 16 }}>No notes yet. Click "New Note" to create one!</p>
        </div>
      ) : viewMode === "grid" ? (
        // GRID VIEW
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
          {notes.map((note, i) => (
            <div key={note.id} onClick={() => onOpen(note)}
              style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "18px 16px 14px", cursor: "pointer", minHeight: 140, display: "flex", flexDirection: "column", gap: 8, transition: "transform 0.15s, box-shadow 0.15s", position: "relative", overflow: "hidden" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = t.shadow; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: NOTE_COLORS[i % NOTE_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, marginBottom: 4 }}>
                {note.icon || "📄"}
              </div>
              <div style={{ fontWeight: 600, fontSize: 13.5, color: t.text, lineHeight: 1.3 }}>{note.title}</div>
              <div style={{ fontSize: 11.5, color: t.muted, lineHeight: 1.4, flex: 1, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                {note.content?.replace(/[#>*-]/g, "").trim().slice(0, 80) || "Empty note"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
                <div style={{ width: 16, height: 16, borderRadius: "50%", background: user?.color || "#5b8af0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: "#fff" }}>{user?.avatar?.[0]}</div>
                <span style={{ fontSize: 10.5, color: t.muted }}>{formatDate()}</span>
              </div>
            </div>
          ))}
          {/* New note card */}
          <div onClick={onAdd}
            style={{ border: `2px dashed ${t.border}`, borderRadius: 14, padding: "18px 16px", cursor: "pointer", minHeight: 140, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: t.muted, transition: "border-color 0.15s, color 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.accent; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.muted; }}>
            <div style={{ fontSize: 28 }}>+</div>
            <span style={{ fontSize: 13, fontWeight: 500 }}>New page</span>
          </div>
        </div>
      ) : (
        // LIST VIEW
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {notes.map((note, i) => (
            <div
              key={note.id}
              onClick={() => onOpen(note)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                background: t.card,
                border: `1px solid ${t.border}`,
                borderRadius: 10,
                padding: "16px 20px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = t.hover;
                e.currentTarget.style.borderColor = t.accent;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = t.card;
                e.currentTarget.style.borderColor = t.border;
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 8, background: NOTE_COLORS[i % NOTE_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                {note.icon || "📄"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: t.text, marginBottom: 4 }}>{note.title}</div>
                <div style={{ fontSize: 12, color: t.muted }}>
                  {note.content?.replace(/[#>*-]/g, "").trim().slice(0, 60) || "No content"}
                </div>
              </div>
              <div style={{ fontSize: 11, color: t.muted, textAlign: "right" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span>•</span> status: active
                </div>
                <div>date: {formatDate()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}