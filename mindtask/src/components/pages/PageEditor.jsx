import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../context/useTheme";
import { useAuth } from "../../context/useAuth";
import { renderMarkdown } from "../../utils/markdown";
import { getAIResponse } from "../../data/wellness";

const EMOJIS = ["📄", "📋", "🌱", "✨", "💡", "🎯", "📝", "🔖", "⚡", "🧠", "💙", "🌿", "🎨", "🚀", "🌸", "🍃", "📚", "🔬"];

export default function PageEditor({ page, onUpdate, onBack, user, isNewlyCreated = false }) {
  const t = useTheme();
  const [editing, setEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  // Chat state for Welcome page (unchanged)
  const [aiInput, setAiInput] = useState("");
  const [aiMsgs, setAiMsgs] = useState([]);
  const [aiTyping, setAiTyping] = useState(false);
  const aiEndRef = useRef(null);
  const { chatHistory, appendChatMessage } = useAuth();
  
  useEffect(() => { 
    aiEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [aiMsgs, aiTyping]);

  const isWelcomePage = page?.title?.includes("Welcome to MindTask") || false;

  useEffect(() => {
    if (!isWelcomePage) return;
    if (chatHistory.length > 0) {
      setAiMsgs(chatHistory);
    } else {
      setAiMsgs([
        {
          role: "assistant",
          text: `Hey ${user?.name?.split(" ")[0] || "there"}! 🌿 I'm MindEase, your wellness companion. How are you feeling today? Whether you're stressed, overwhelmed, or just need to talk — I'm here.`,
        },
      ]);
    }
  }, [isWelcomePage, chatHistory, user?.name]);

  const sendAI = async (txt) => {
    const msg = (txt || aiInput).trim();
    if (!msg) return;
    setAiInput("");
    appendChatMessage({ role: "user", text: msg });
    setAiTyping(true);
    const reply = await getAIResponse(msg, user?.id);
    setAiTyping(false);
    appendChatMessage({ role: "assistant", text: reply });
  };

  const SUGGESTIONS = ["Help me focus 🎯", "I'm feeling stressed 😔", "Boost my day 🌟", "I need a break 😮‍💨"];

  // NO AUTO-EDIT MODE FOR NEW NOTES. They open in view mode.
  // Reset editing state when page changes
  useEffect(() => {
    setEditing(false);
    setIsSaving(false);
  }, [page?.id]);

  const shuffle = () => {
    if (page) {
      onUpdate(page.id, "icon", EMOJIS[Math.floor(Math.random() * EMOJIS.length)]);
    }
  };

  // FIX 1: Save with loading state to prevent double-trigger and ensure first click works
  const handleSave = async () => {
    if (!page || isSaving) return;
    
    setIsSaving(true);
    
    // Capture current edited values
    const newTitle = editedTitle;
    const newContent = editedContent;
    
    // Update both fields unconditionally
    // Use Promise.all or sequential updates; ensure both go through
    if (newTitle !== page.title) {
      onUpdate(page.id, "title", newTitle);
    }
    if (newContent !== page.content) {
      onUpdate(page.id, "content", newContent);
    }
    
    // Exit edit mode after a short delay to allow parent state to settle
    setTimeout(() => {
      setEditing(false);
      setIsSaving(false);
    }, 50);
  };

  const handleCancel = () => {
    setEditing(false);
    setIsSaving(false);
  };

  const startEditing = () => {
    if (page) {
      setEditedTitle(page.title || "");
      setEditedContent(page.content || "");
      setEditing(true);
      setIsSaving(false);
    }
  };

  if (!page) {
    return (
      <div style={{ padding: "48px 60px 80px", textAlign: "center", color: t.muted }}>
        Loading...
      </div>
    );
  }

  // For Welcome Page (unchanged)
  if (isWelcomePage) {
    return (
      <div style={{ maxWidth: 860, margin: "0 auto", width: "100%", padding: "48px 60px 80px" }}>
        <h1 style={{ fontSize: "2.2rem", fontWeight: 700, fontFamily: "'Lora',serif", color: t.text, lineHeight: 1.2, marginBottom: 20 }}>
          {page.title}
        </h1>
        
        <div style={{ marginBottom: 32 }}>
          {page.content ? (
            <div className="pc" style={{ color: t.text, fontSize: 15, lineHeight: 1.75 }}>
              {renderMarkdown(page.content)}
            </div>
          ) : (
            <p style={{ color: t.muted, fontStyle: "italic", fontSize: 15 }}>Welcome content</p>
          )}
        </div>

        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 18, padding: "6px 6px 10px", boxShadow: t.shadow }}>
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
              style={{ background: "linear-gradient(135deg,#5b8af0,#c084fc)", width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", flexShrink: 0, boxShadow: "0 2px 8px rgba(91,138,240,0.35)", color: "white", fontSize: 16, lineHeight: 1, transition: "all 0.2s", outline: "none" }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
              onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.96)"}
              onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              &#9658;
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14, justifyContent: "center" }}>
          {SUGGESTIONS.map(s => (
            <button 
              key={s} 
              onClick={() => sendAI(s)}
              style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 20, padding: "7px 16px", fontSize: 13, color: t.text, cursor: "pointer", fontWeight: 500, transition: "all 0.2s", outline: "none" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.accent; e.currentTarget.style.background = t.accentSoft; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.text; e.currentTarget.style.background = t.card; }}
              onMouseDown={e => e.currentTarget.style.transform = "scale(0.96)"}
              onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // For Notes and other pages
  return (
    <div style={{ maxWidth: 860, margin: "0 auto", width: "100%", padding: "48px 60px 80px" }}>
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: t.accent,
            fontSize: 13,
            marginBottom: 24,
            padding: "8px 16px",
            background: t.accentSoft,
            border: `1px solid ${t.accent}`,
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 500,
            transition: "all 0.2s",
            outline: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = t.accent;
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = t.accentSoft;
            e.currentTarget.style.color = t.accent;
          }}
        >
          ← Back to Notes
        </button>
      )}

      {/* Icon */}
      <button
        onClick={shuffle}
        title="Click to change icon"
        style={{ fontSize: 46, marginBottom: 10, display: "block", lineHeight: 1, padding: "4px 0", background: "none", border: "none", cursor: "pointer", outline: "none" }}
      >
        {page.icon || "📄"}
      </button>

      {/* Title Display - Always visible in view mode */}
      {!editing && (
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, fontFamily: "'Lora',serif", color: t.text, lineHeight: 1.2, marginBottom: 16 }}>
            {page.title || "Untitled"}
          </h1>
          
          {/* View/Edit Toggle Buttons */}
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-start", borderBottom: `1px solid ${t.border}`, paddingBottom: 16 }}>
            <button
              onClick={() => setEditing(false)}
              style={{
                fontSize: 14,
                padding: "8px 28px",
                borderRadius: 8,
                fontWeight: 600,
                cursor: "pointer",
                background: !editing ? t.accent : "transparent",
                border: `1px solid ${!editing ? t.accent : t.border}`,
                color: !editing ? "#fff" : t.muted,
                transition: "all 0.2s",
                outline: "none",
              }}
              onMouseEnter={(e) => {
                if (!editing) {
                  e.currentTarget.style.background = t.accentDark || "#4a6fd8";
                } else {
                  e.currentTarget.style.borderColor = t.accent;
                  e.currentTarget.style.color = t.accent;
                }
              }}
              onMouseLeave={(e) => {
                if (!editing) {
                  e.currentTarget.style.background = t.accent;
                } else {
                  e.currentTarget.style.borderColor = t.border;
                  e.currentTarget.style.color = t.muted;
                }
              }}
            >
              View
            </button>
            <button
              onClick={startEditing}
              style={{
                fontSize: 14,
                padding: "8px 28px",
                borderRadius: 8,
                fontWeight: 600,
                cursor: "pointer",
                background: editing ? t.accent : "transparent",
                border: `1px solid ${editing ? t.accent : t.border}`,
                color: editing ? "#fff" : t.muted,
                transition: "all 0.2s",
                outline: "none",
              }}
              onMouseEnter={(e) => {
                if (editing) {
                  e.currentTarget.style.background = t.accentDark || "#4a6fd8";
                } else {
                  e.currentTarget.style.borderColor = t.accent;
                  e.currentTarget.style.color = t.accent;
                }
              }}
              onMouseLeave={(e) => {
                if (editing) {
                  e.currentTarget.style.background = t.accent;
                } else {
                  e.currentTarget.style.borderColor = t.border;
                  e.currentTarget.style.color = t.muted;
                }
              }}
            >
              Edit
            </button>
          </div>
        </div>
      )}

      {/* EDIT MODE */}
      {editing ? (
        <>
          <input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            placeholder="Note Title"
            style={{ width: "100%", fontSize: "2rem", fontWeight: 700, fontFamily: "'Lora',serif", background: "none", border: "none", color: t.text, lineHeight: 1.2, marginBottom: 24, outline: "none", display: "block", padding: "8px 0" }}
            autoFocus
          />
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            placeholder="Start writing your note here..."
            style={{ width: "100%", minHeight: "50vh", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20, color: t.text, fontSize: 15, lineHeight: 1.75, outline: "none", resize: "vertical", display: "block" }}
          />
          <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              style={{ fontSize: 14, padding: "8px 24px", borderRadius: 8, fontWeight: 500, cursor: isSaving ? "not-allowed" : "pointer", background: "transparent", border: `1px solid ${t.border}`, color: t.muted, transition: "all 0.2s", outline: "none", opacity: isSaving ? 0.6 : 1 }}
              onMouseEnter={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.borderColor = t.accent;
                  e.currentTarget.style.color = t.accent;
                  e.currentTarget.style.background = t.accentSoft;
                }
              }}
              onMouseLeave={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.borderColor = t.border;
                  e.currentTarget.style.color = t.muted;
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              style={{ fontSize: 14, padding: "8px 24px", borderRadius: 8, fontWeight: 500, cursor: isSaving ? "not-allowed" : "pointer", background: t.accent, border: "none", color: "#fff", transition: "all 0.2s", outline: "none", opacity: isSaving ? 0.7 : 1 }}
              onMouseEnter={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.background = t.accentDark || "#4a6fd8";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.background = t.accent;
                }
              }}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </>
      ) : (
        // VIEW MODE
        <div style={{ cursor: "default", minHeight: "60vh" }}>
          <div className="pc" style={{ color: t.text, fontSize: 16, lineHeight: 1.8 }}>
            {renderMarkdown(page.content || "*Empty note*")}
          </div>
        </div>
      )}
    </div>
  );
}