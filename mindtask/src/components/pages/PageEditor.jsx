import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { renderMarkdown } from "../../utils/markdown";

const EMOJIS = ["📄", "📋", "🌱", "✨", "💡", "🎯", "📝", "🔖", "⚡", "🧠", "💙", "🌿", "🎨", "🚀", "🌸", "🍃", "📚", "🔬"];

export default function PageEditor({ page, onUpdate, onBack }) {
  const t = useTheme();
  const [editing, setEditing] = useState(false);

  const shuffle = () => {
    onUpdate(page.id, "icon", EMOJIS[Math.floor(Math.random() * EMOJIS.length)]);
  };

  const isWelcomePage = page.title.includes("Welcome to MindTask");

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", width: "100%", padding: "48px 60px 80px" }}>
      {onBack && (
        <button
          onClick={onBack}
          style={{ display: "flex", alignItems: "center", gap: 6, color: t.muted, fontSize: 13, marginBottom: 20, padding: "5px 0", background: "none", border: "none", cursor: "pointer" }}
        >
          ← Back to Notes
        </button>
      )}

      {!isWelcomePage && (
        <button
          onClick={shuffle}
          title="Click to change icon"
          style={{ fontSize: 46, marginBottom: 10, display: "block", lineHeight: 1, padding: "4px 0", background: "none", border: "none", cursor: "pointer" }}
        >
          {page.icon}
        </button>
      )}

      <input
        value={page.title}
        onChange={(e) => onUpdate(page.id, "title", e.target.value)}
        placeholder="Untitled"
        style={{ width: "100%", fontSize: "2.2rem", fontWeight: 700, fontFamily: "'Lora',serif", background: "none", border: "none", color: t.text, lineHeight: 1.2, marginBottom: 20, outline: "none", display: "block" }}
      />

      {!isWelcomePage && (
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          <button
            onClick={() => setEditing(false)}
            style={{ fontSize: 12, padding: "5px 14px", borderRadius: 7, fontWeight: 500, cursor: "pointer", border: `1px solid ${!editing ? t.accent : t.border}`, background: !editing ? t.accent : "transparent", color: !editing ? "#fff" : t.muted }}
          >
            👁 View
          </button>

          <button
            onClick={() => setEditing(true)}
            style={{ fontSize: 12, padding: "5px 14px", borderRadius: 7, fontWeight: 500, cursor: "pointer", border: `1px solid ${editing ? t.accent : t.border}`, background: editing ? t.accent : "transparent", color: editing ? "#fff" : t.muted }}
          >
            ✏️ Edit
          </button>
        </div>
      )}

      {isWelcomePage ? (
        <div style={{ minHeight: "60vh" }}>
          {page.content ? (
            <div className="pc" style={{ color: t.text, fontSize: 15, lineHeight: 1.75 }}>
              {renderMarkdown(page.content)}
            </div>
          ) : (
            <p style={{ color: t.muted, fontStyle: "italic", fontSize: 15 }}>Welcome content</p>
          )}
        </div>
      ) : editing ? (
        <textarea
          value={page.content}
          onChange={(e) => onUpdate(page.id, "content", e.target.value)}
          placeholder="Start writing... Use # for headings, - for bullets, > for quotes, *bold*"
          autoFocus
          style={{ width: "100%", minHeight: "60vh", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 10, padding: 16, color: t.text, fontSize: 15, lineHeight: 1.75, outline: "none", resize: "none", display: "block" }}
        />
      ) : (
        <div onClick={() => setEditing(true)} style={{ cursor: "text", minHeight: "60vh" }}>
          {page.content ? (
            <div className="pc" style={{ color: t.text, fontSize: 15, lineHeight: 1.75 }}>
              {renderMarkdown(page.content)}
            </div>
          ) : (
            <p style={{ color: t.muted, fontStyle: "italic", fontSize: 15 }}>Click here to start writing...</p>
          )}
        </div>
      )}
    </div>
  );
}