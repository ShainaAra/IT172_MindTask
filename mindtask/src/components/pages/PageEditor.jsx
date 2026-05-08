import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../context/useTheme";
import { useAuth } from "../../context/useAuth";
import { renderMarkdown } from "../../utils/markdown";
import { getAIResponse } from "../../data/wellness";

// Predefined emoji icons for random note icon generation
const EMOJIS = ["📄", "📋", "🌱", "✨", "💡", "🎯", "📝", "🔖", "⚡", "🧠", "💙", "🌿", "🎨", "🚀", "🌸", "🍃", "📚", "🔬"];

/**
 * Component: PageEditor
 * Description: Main editor component for viewing and editing pages/notes.
 * Supports two modes:
 * 1. Edit mode - Allows editing title and content with save/cancel functionality
 * 2. View mode - Displays rendered markdown content
 * Special handling for "Welcome to MindTask" page which includes MindEase chat integration
 * 
 * @param {Object} props - Component properties
 * @param {Object} props.page - The page/note object containing id, title, content, and icon
 * @param {Function} props.onUpdate - Function to update page properties (called with pageId, field, value)
 * @param {Function} props.onBack - Function to navigate back to notes list
 * @param {Object} props.user - User object containing user details like name, color, avatar
 * @param {boolean} props.isNewlyCreated - Flag indicating if this is a newly created page (for animations/scroll)
 * 
 * @returns {JSX.Element} Page editor component with view/edit modes and optional chat integration
 */
export default function PageEditor({ page, onUpdate, onBack, user, isNewlyCreated = false }) {
  const t = useTheme(); // Theme context for styling
  const [editing, setEditing] = useState(false); // Tracks whether user is in edit mode
  const [editedTitle, setEditedTitle] = useState(""); // Temporary title while editing
  const [editedContent, setEditedContent] = useState(""); // Temporary content while editing
  const [isSaving, setIsSaving] = useState(false); // Prevents double-save actions
  
  // Chat state specifically for the Welcome page (MindEase integration)
  const [aiInput, setAiInput] = useState(""); // Input field for chat messages
  const [aiMsgs, setAiMsgs] = useState([]); // Chat message history
  const [aiTyping, setAiTyping] = useState(false); // Typing indicator state
  const aiEndRef = useRef(null); // Ref for auto-scrolling chat to bottom
  const { chatHistory, appendChatMessage } = useAuth(); // Global chat context

  /**
   * Effect: Auto-scrolls chat to bottom when messages or typing state changes
   */
  useEffect(() => { 
    aiEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [aiMsgs, aiTyping]);

  // Check if current page is the special Welcome page
  const isWelcomePage = page?.title?.includes("Welcome to MindTask") || false;

  /**
   * Effect: Initialize chat history for Welcome page
   * - Loads existing chat history from context
   * - OR creates initial welcome message if no history exists
   * Only runs for the Welcome page
   */
  useEffect(() => {
    if (!isWelcomePage) return; // Skip for non-welcome pages
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

  /**
   * Function: sendAI
   * Description: Sends user message to AI and handles response in chat
   * 
   * @param {string} txt - Optional message text (uses aiInput state if not provided)
   * 
   * Process:
   * 1. Validates message is not empty
   * 2. Clears input field
   * 3. Appends user message to global chat history
   * 4. Shows typing indicator
   * 5. Calls AI service for response
   * 6. Hides typing indicator
   * 7. Appends AI response to chat history
   */
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

  // Predefined quick suggestions for chat interactions on Welcome page
  const SUGGESTIONS = ["Help me focus 🎯", "I'm feeling stressed 😔", "Boost my day 🌟", "I need a break 😮‍💨"];

  /**
   * Effect: Reset editing state when page changes
   * Ensures that switching between pages doesn't leave edit mode active
   */
  useEffect(() => {
    setEditing(false);
    setIsSaving(false);
  }, [page?.id]);

  /**
   * Function: shuffle
   * Description: Randomly changes the page icon from the EMOJIS array
   * Called when user clicks on the icon
   */
  const shuffle = () => {
    if (page) {
      onUpdate(page.id, "icon", EMOJIS[Math.floor(Math.random() * EMOJIS.length)]);
    }
  };

  /**
   * Function: handleSave
   * Description: Saves edited title and content to the page
   * Includes loading state to prevent double-save and ensure first click works
   * 
   * Process:
   * 1. Prevents save if no page or already saving
   * 2. Sets saving flag
   * 3. Captures current edited values
   * 4. Updates title and content if changed
   * 5. Delays exit from edit mode to allow parent state to settle
   */
  const handleSave = async () => {
    if (!page || isSaving) return;
    
    setIsSaving(true);
    
    // Capture current edited values before they could change
    const newTitle = editedTitle;
    const newContent = editedContent;
    
    // Update both fields unconditionally if they've changed
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

  /**
   * Function: handleCancel
   * Description: Exits edit mode without saving changes
   */
  const handleCancel = () => {
    setEditing(false);
    setIsSaving(false);
  };

  /**
   * Function: startEditing
   * Description: Enters edit mode and populates temporary fields with current page data
   */
  const startEditing = () => {
    if (page) {
      setEditedTitle(page.title || "");
      setEditedContent(page.content || "");
      setEditing(true);
      setIsSaving(false);
    }
  };

  // Loading state - display when page is not available
  if (!page) {
    return (
      <div style={{ padding: "48px 60px 80px", textAlign: "center", color: t.muted }}>
        Loading...
      </div>
    );
  }

  // ==================== WELCOME PAGE RENDER ====================
  // Special render for the Welcome page with integrated MindEase chat
  if (isWelcomePage) {
    return (
      <div style={{ maxWidth: 860, margin: "0 auto", width: "100%", padding: "48px 60px 80px" }}>
        {/* Page Title */}
        <h1 style={{ fontSize: "2.2rem", fontWeight: 700, fontFamily: "'Lora',serif", color: t.text, lineHeight: 1.2, marginBottom: 20 }}>
          {page.title}
        </h1>
        
        {/* Page Content - Rendered Markdown */}
        <div style={{ marginBottom: 32 }}>
          {page.content ? (
            <div className="pc" style={{ color: t.text, fontSize: 15, lineHeight: 1.75 }}>
              {renderMarkdown(page.content)}
            </div>
          ) : (
            <p style={{ color: t.muted, fontStyle: "italic", fontSize: 15 }}>Welcome content</p>
          )}
        </div>

        {/* MindEase Chat Container */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 18, padding: "6px 6px 10px", boxShadow: t.shadow }}>
          {/* Chat Messages Area */}
          {aiMsgs.length > 0 && (
            <div style={{ maxHeight: 220, overflowY: "auto", padding: "10px 14px 6px", display: "flex", flexDirection: "column", gap: 10, marginBottom: 4 }}>
              {aiMsgs.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 8, alignItems: "flex-end" }}>
                  {/* Assistant Avatar */}
                  {m.role === "assistant" && <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,#4ade80,#5b8af0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 }}>🌿</div>}
                  {/* Message Bubble */}
                  <div style={{ maxWidth: "80%", padding: "9px 13px", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: m.role === "user" ? t.userBubble : t.aiBubble, fontSize: 13.5, color: t.text, lineHeight: 1.5, border: `1px solid ${m.role === "user" ? "transparent" : t.border}` }}>
                    {m.text}
                  </div>
                  {/* User Avatar */}
                  {m.role === "user" && <div style={{ width: 24, height: 24, borderRadius: "50%", background: user?.color || "#5b8af0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{user?.avatar}</div>}
                </div>
              ))}
              {/* Typing Indicator */}
              {aiTyping && (
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,#4ade80,#5b8af0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 }}>🌿</div>
                  <div style={{ background: t.aiBubble, border: `1px solid ${t.border}`, borderRadius: "14px 14px 14px 4px", padding: "10px 14px", display: "flex", gap: 4, alignItems: "center" }}>
                    {[0, 1, 2].map(i => <div key={i} className="td" style={{ width: 5, height: 5, borderRadius: "50%", background: t.muted }} />)}
                  </div>
                </div>
              )}
              <div ref={aiEndRef} /> {/* Scroll anchor */}
            </div>
          )}
          
          {/* Chat Input Area */}
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
              &#9658; {/* Right arrow symbol */}
            </button>
          </div>
        </div>

        {/* Quick Suggestion Buttons */}
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

  // ==================== REGULAR PAGE RENDER ====================
  // For normal notes and pages with edit/view functionality
  return (
    <div style={{ maxWidth: 860, margin: "0 auto", width: "100%", padding: "48px 60px 80px" }}>
      {/* Back Button - Navigation to notes list */}
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

      {/* Icon Shuffle Button - Click to randomize emoji */}
      <button
        onClick={shuffle}
        title="Click to change icon"
        style={{ fontSize: 46, marginBottom: 10, display: "block", lineHeight: 1, padding: "4px 0", background: "none", border: "none", cursor: "pointer", outline: "none" }}
      >
        {page.icon || "📄"}
      </button>

      {/* Title Display - Shown in view mode only */}
      {!editing && (
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, fontFamily: "'Lora',serif", color: t.text, lineHeight: 1.2, marginBottom: 16 }}>
            {page.title || "Untitled"}
          </h1>
          
          {/* View/Edit Mode Toggle Buttons */}
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

      {/* EDIT MODE - Show editable inputs */}
      {editing ? (
        <>
          {/* Editable Title Input */}
          <input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            placeholder="Note Title"
            style={{ width: "100%", fontSize: "2rem", fontWeight: 700, fontFamily: "'Lora',serif", background: "none", border: "none", color: t.text, lineHeight: 1.2, marginBottom: 24, outline: "none", display: "block", padding: "8px 0" }}
            autoFocus
          />
          {/* Editable Content Textarea */}
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            placeholder="Start writing your note here..."
            style={{ width: "100%", minHeight: "50vh", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20, color: t.text, fontSize: 15, lineHeight: 1.75, outline: "none", resize: "vertical", display: "block" }}
          />
          {/* Save/Cancel Action Buttons */}
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
        // VIEW MODE - Rendered markdown content
        <div style={{ cursor: "default", minHeight: "60vh" }}>
          <div className="pc" style={{ color: t.text, fontSize: 16, lineHeight: 1.8 }}>
            {renderMarkdown(page.content || "*Empty note*")}
          </div>
        </div>
      )}
    </div>
  );
}