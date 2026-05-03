import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import { renderMarkdown } from "../../utils/markdown";
import { getAIResponse } from "../../data/wellness";

const EMOJIS = ["📄", "📋", "🌱", "✨", "💡", "🎯", "📝", "🔖", "⚡", "🧠", "💙", "🌿", "🎨", "🚀", "🌸", "🍃", "📚", "🔬"];

export default function PageEditor({ page, onUpdate, onBack, user }) {
  const t = useTheme();
  const [editing, setEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  
  // Chat state for Welcome page
  const [aiInput, setAiInput] = useState("");
  const [aiMsgs, setAiMsgs] = useState([]);
  const [aiTyping, setAiTyping] = useState(false);
  const aiEndRef = useRef(null);
  
  useEffect(() => { 
    aiEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [aiMsgs, aiTyping]);

  const sendAI = async (txt) => {
    const msg = (txt || aiInput).trim(); 
    if (!msg) return;
    setAiInput("");
    setAiMsgs(m => [...m, { role: "user", text: msg }]);
    setAiTyping(true);
    const reply = await getAIResponse(msg, user?.name || "friend");
    setAiTyping(false);
    setAiMsgs(m => [...m, { role: "assistant", text: reply }]);
  };

  const SUGGESTIONS = ["Help me focus 🎯", "I'm feeling stressed 😔", "Boost my day 🌟", "I need a break 😮‍💨"];

  // Load current page data when editing starts
  useEffect(() => {
    if (editing && page) {
      setEditedTitle(page.title || "");
      setEditedContent(page.content || "");
      setHasChanges(false);
    }
  }, [editing, page]);

  // Reset editing state if page changes
  useEffect(() => {
    if (page) {
      setEditing(false);
      setHasChanges(false);
    }
  }, [page?.id]);

  const shuffle = () => {
    if (page) {
      onUpdate(page.id, "icon", EMOJIS[Math.floor(Math.random() * EMOJIS.length)]);
    }
  };

  const isWelcomePage = page?.title?.includes("Welcome to MindTask") || false;

  const handleSave = () => {
    if (!page) return;
    if (editedTitle !== page.title) {
      onUpdate(page.id, "title", editedTitle);
    }
    if (editedContent !== page.content) {
      onUpdate(page.id, "content", editedContent);
    }
    setEditing(false);
    setHasChanges(false);
  };

  const handleCancel = () => {
    setEditing(false);
    setHasChanges(false);
  };

  const startEditing = () => {
    if (page) {
      setEditedTitle(page.title || "");
      setEditedContent(page.content || "");
      setEditing(true);
      setHasChanges(false);
    }
  };

  // If page is not loaded yet, show loading
  if (!page) {
    return (
      <div style={{ padding: "48px 60px 80px", textAlign: "center", color: t.muted }}>
        Loading...
      </div>
    );
  }

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
          {page.icon || "📄"}
        </button>
      )}

      {!isWelcomePage && !editing && (
        <div style={{ display: "flex", gap: 8, marginBottom: 24, justifyContent: "flex-end" }}>
          <button
            onClick={startEditing}
            style={{ fontSize: 12, padding: "6px 16px", borderRadius: 7, fontWeight: 500, cursor: "pointer", background: t.accent, border: "none", color: "#fff", display: "flex", alignItems: "center", gap: 6 }}
            onMouseEnter={(e) => e.currentTarget.style.background = t.accentDark || "#4a6fd8"}
            onMouseLeave={(e) => e.currentTarget.style.background = t.accent}
            onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.96)"}
            onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            ✏️ Edit Page
          </button>
        </div>
      )}

      {!isWelcomePage && editing && (
        <div style={{ display: "flex", gap: 8, marginBottom: 24, justifyContent: "flex-end" }}>
          <button
            onClick={handleCancel}
            style={{ fontSize: 12, padding: "6px 16px", borderRadius: 7, fontWeight: 500, cursor: "pointer", background: t.accent, border: "none", color: "#fff", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.background = t.accentDark || "#4a6fd8"}
            onMouseLeave={(e) => e.currentTarget.style.background = t.accent}
            onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.96)"}
            onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            style={{ fontSize: 12, padding: "6px 16px", borderRadius: 7, fontWeight: 500, cursor: hasChanges ? "pointer" : "not-allowed", background: hasChanges ? t.accent : t.muted, border: "none", color: "#fff", opacity: hasChanges ? 1 : 0.5, display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" }}
            onMouseEnter={(e) => {
              if (hasChanges) {
                e.currentTarget.style.background = t.accentDark || "#4a6fd8";
              }
            }}
            onMouseLeave={(e) => {
              if (hasChanges) {
                e.currentTarget.style.background = t.accent;
              }
            }}
            onMouseDown={(e) => {
              if (hasChanges) {
                e.currentTarget.style.transform = "scale(0.96)";
              }
            }}
            onMouseUp={(e) => {
              if (hasChanges) {
                e.currentTarget.style.transform = "scale(1)";
              }
            }}
          >
            💾 Save Changes
          </button>
        </div>
      )}

      {!isWelcomePage && editing ? (
        <>
          <input
            value={editedTitle}
            onChange={(e) => {
              setEditedTitle(e.target.value);
              setHasChanges(true);
            }}
            placeholder="Untitled"
            style={{ width: "100%", fontSize: "2.2rem", fontWeight: 700, fontFamily: "'Lora',serif", background: "none", border: "none", color: t.text, lineHeight: 1.2, marginBottom: 20, outline: "none", display: "block" }}
          />
          <textarea
            value={editedContent}
            onChange={(e) => {
              setEditedContent(e.target.value);
              setHasChanges(true);
            }}
            placeholder="Start writing... Use # for headings, - for bullets, > for quotes, *bold*"
            autoFocus
            style={{ width: "100%", minHeight: "60vh", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 10, padding: 16, color: t.text, fontSize: 15, lineHeight: 1.75, outline: "none", resize: "vertical", display: "block" }}
          />
        </>
      ) : isWelcomePage ? (
        <>
          {/* Title */}
          <h1 style={{ fontSize: "2.2rem", fontWeight: 700, fontFamily: "'Lora',serif", color: t.text, lineHeight: 1.2, marginBottom: 20 }}>
            {page.title}
          </h1>
          
          {/* Content */}
          <div style={{ marginBottom: 32 }}>
            {page.content ? (
              <div className="pc" style={{ color: t.text, fontSize: 15, lineHeight: 1.75 }}>
                {renderMarkdown(page.content)}
              </div>
            ) : (
              <p style={{ color: t.muted, fontStyle: "italic", fontSize: 15 }}>Welcome content</p>
            )}
          </div>

          {/* Full Chat Box - Like the first screenshot */}
          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 18, padding: "6px 6px 10px", boxShadow: t.shadow }}>
            {/* Message history */}
            {aiMsgs.length > 0 && (
              <div style={{ maxHeight: 220, overflowY: "auto", padding: "10px 14px 6px", display: "flex", flexDirection: "column", gap: 10, marginBottom: 4 }}>
                {aiMsgs.map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 8, alignItems: "flex-end" }}>
                    {m.role === "assistant" && <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,#4ade80,#5b8af0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 }}>🌿</div>}
                    <div style={{ maxWidth: "80%", padding: "9px 13px", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: m.role === "user" ? t.userBubble : t.aiBubble, fontSize: 13.5, color: t.text, lineHeight: 1.5, border: `1px solid ${m.role === "user" ? "transparent" : t.border}` }}>
                      {m.text}
                    </div>
                    {m.role === "user" && <div style={{ width: 24, height: 24, borderRadius: "50%", background: user?.color || "#5b8af0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{user?.avatar}</div>}
                  </div>
                ))}
                {aiTyping && (
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,#4ade80,#5b8af0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 }}>🌿</div>
                    <div style={{ background: t.aiBubble, border: `1px solid ${t.border}`, borderRadius: "14px 14px 14px 4px", padding: "10px 14px", display: "flex", gap: 4, alignItems: "center" }}>
                      {[0, 1, 2].map(i => <div key={i} className="td" style={{ width: 5, height: 5, borderRadius: "50%", background: t.muted }} />)}
                    </div>
                  </div>
                )}
                <div ref={aiEndRef} />
              </div>
            )}
            
            {/* Input row */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px" }}>
              <input 
                value={aiInput} 
                onChange={e => setAiInput(e.target.value)} 
                onKeyDown={e => e.key === "Enter" && sendAI()}
                placeholder="Ask MindEase anything…"
                style={{ flex: 1, background: "transparent", border: "none", color: t.text, fontSize: 15, outline: "none", padding: "10px 8px" }} 
              />
              <button 
                onClick={() => sendAI()}
                style={{ background: "linear-gradient(135deg,#5b8af0,#c084fc)", width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", flexShrink: 0, boxShadow: "0 2px 8px rgba(91,138,240,0.35)", color: "white", fontSize: 16, lineHeight: 1, transition: "all 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
                onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.96)"}
                onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                &#9658;
              </button>
            </div>
          </div>

          {/* Suggestion chips */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14, justifyContent: "center" }}>
            {SUGGESTIONS.map(s => (
              <button 
                key={s} 
                onClick={() => sendAI(s)}
                style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 20, padding: "7px 16px", fontSize: 13, color: t.text, cursor: "pointer", fontWeight: 500, transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.accent; e.currentTarget.style.background = t.accentSoft; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.text; e.currentTarget.style.background = t.card; }}
                onMouseDown={e => e.currentTarget.style.transform = "scale(0.96)"}
                onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
              >
                {s}
              </button>
            ))}
          </div>
        </>
      ) : (
        // View mode for non-welcome pages
        <div onClick={startEditing} style={{ cursor: "text", minHeight: "60vh" }}>
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