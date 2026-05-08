import { useState } from "react";
import { useTheme } from "../../context/useTheme";
import Ic from "../common/Ic";

// Predefined color palette for note card backgrounds - provides variety in visual appearance
const NOTE_COLORS = ["#5b8af0","#c084fc","#4ade80","#fbbf24","#f87171","#34d399","#60a5fa","#f472b6"];

/**
 * Component: NotesGrid
 * Description: Main note management component that displays notes in either grid or list view,
 * provides functionality to add new notes, delete existing notes with confirmation modal,
 * and shows user information in a consistent date format.
 * 
 * @param {Object} props - Component properties
 * @param {Array} props.notes - Array of note objects containing id, title, content, and icon
 * @param {Function} props.onOpen - Function to open a note for editing (called with note object)
 * @param {Function} props.onAdd - Function to create a new note
 * @param {Function} props.onDelete - Function to delete a note (called with note id)
 * @param {Object} props.t - Theme object from useTheme() containing all color/styling variables
 * @param {Object} props.user - User object containing user details like color and avatar
 * 
 * @returns {JSX.Element} Notes grid/list component with delete confirmation modal
 */
export default function NotesGrid({ notes, onOpen, onAdd, onDelete, t, user }) {
  // State to track current view mode: "grid" (card layout) or "list" (table-like layout)
  const [viewMode, setViewMode] = useState("grid");
  
  // State to track which note ID is pending deletion (null if no confirmation showing)
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  /**
   * Function: formatDate
   * Description: Generates a formatted date string for the current date
   * Used to display creation/modification dates on notes
   * 
   * @returns {string} Formatted date string (e.g., "Jan 15, 2024")
   */
  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  };

  /**
   * Function: confirmDelete
   * Description: Sets up the confirmation modal state for a specific note
   * Prevents event propagation to avoid triggering parent onClick handlers
   * 
   * @param {string} noteId - ID of the note to be deleted
   * @param {Object} e - Event object from the click handler
   */
  const confirmDelete = (noteId, e) => {
    e.stopPropagation(); // Prevents the note from opening when delete button is clicked
    setDeleteConfirm(noteId);
  };

  /**
   * Function: handleDelete
   * Description: Executes the actual deletion of the confirmed note
   * Called when user clicks "Delete Note" in the confirmation modal
   * Clears the confirmation state after deletion
   */
  const handleDelete = () => {
    if (deleteConfirm && onDelete) {
      onDelete(deleteConfirm); // Call parent's delete handler with the note ID
      setDeleteConfirm(null); // Close the confirmation modal
    }
  };

  /**
   * Function: cancelDelete
   * Description: Dismisses the delete confirmation modal without deleting
   * Resets the deleteConfirm state to null
   */
  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  return (
    <div style={{ padding: "48px 60px 80px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
      {/* Delete Confirmation Modal - Conditionally rendered when a note is marked for deletion */}
      {deleteConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)", // Semi-transparent backdrop
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000, // High z-index to appear above all content
          }}
          onClick={cancelDelete} // Clicking backdrop closes modal
        >
          <div
            style={{
              background: t.surface,
              borderRadius: 16,
              padding: 24,
              width: 380,
              maxWidth: "90%",
              boxShadow: t.shadowLg,
              border: `1px solid ${t.border}`,
            }}
            onClick={(e) => e.stopPropagation()} // Prevent backdrop click from closing when clicking inside modal
          >
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: t.text, marginBottom: 8 }}>
                Delete Note?
              </h3>
              <p style={{ fontSize: 13, color: t.muted }}>
                Are you sure you want to delete this note? This action cannot be undone.
              </p>
            </div>
            
            {/* Modal action buttons */}
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={cancelDelete}
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  fontSize: 13,
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
                onClick={handleDelete}
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  background: "#ef4444", // Red color for destructive action
                  border: "none",
                  color: "#fff",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#dc2626"} // Darker red on hover
                onMouseLeave={(e) => e.currentTarget.style.background = "#ef4444"}
              >
                Delete Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section - Title, note count, view toggles, and add button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, fontFamily: "'Lora',serif", color: t.text }}>My Notes</h1>
            <p style={{ fontSize: 13, color: t.muted, marginTop: 5 }}>{notes.length} notes</p>
          </div>
        </div>
        
        {/* View mode and action buttons */}
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

      {/* Conditional Rendering: Empty state, Grid view, or List view */}
      {notes.length === 0 ? (
        // EMPTY STATE - Displayed when user has no notes
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
        // GRID VIEW - Card-based layout showing notes in responsive grid columns
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
          {notes.map((note, i) => (
            <div key={note.id} 
              style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "18px 16px 14px", cursor: "pointer", minHeight: 140, display: "flex", flexDirection: "column", gap: 8, transition: "transform 0.15s, box-shadow 0.15s", position: "relative", overflow: "hidden" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = t.shadow; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
              
              {/* Note card header with icon and delete button */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: NOTE_COLORS[i % NOTE_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, marginBottom: 4 }}>
                  {note.icon || "📄"}
                </div>
                <button
                  onClick={(e) => confirmDelete(note.id, e)}
                  style={{
                    color: t.muted,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    borderRadius: "4px",
                    opacity: 0.5,
                    transition: "opacity 0.2s",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = "0.5"}
                >
                  <Ic n="trash" size={14} />
                </button>
              </div>
              
              {/* Clickable note content area - opens note for editing */}
              <div onClick={() => onOpen(note)} style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5, color: t.text, lineHeight: 1.3 }}>{note.title}</div>
                <div style={{ fontSize: 11.5, color: t.muted, lineHeight: 1.4, flex: 1, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", marginTop: 4 }}>
                  {note.content?.replace(/[#>*-]/g, "").trim().slice(0, 80) || "Empty note"} {/* Strip markdown characters and truncate */}
                </div>
                {/* User avatar and date footer */}
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 12 }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", background: user?.color || "#5b8af0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: "#fff" }}>{user?.avatar?.[0] || "U"}</div>
                  <span style={{ fontSize: 10.5, color: t.muted }}>{formatDate()}</span>
                </div>
              </div>
            </div>
          ))}
          {/* "Add New Note" card - Always appears at the end of the grid */}
          <div onClick={onAdd}
            style={{ border: `2px dashed ${t.border}`, borderRadius: 14, padding: "18px 16px", cursor: "pointer", minHeight: 140, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: t.muted, transition: "border-color 0.15s, color 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.accent; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.muted; }}>
            <div style={{ fontSize: 28 }}>+</div>
            <span style={{ fontSize: 13, fontWeight: 500 }}>New page</span>
          </div>
        </div>
      ) : (
        // LIST VIEW - Table-like layout with horizontal rows
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {notes.map((note, i) => (
            <div
              key={note.id}
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
              {/* Note icon with color background */}
              <div style={{ width: 36, height: 36, borderRadius: 8, background: NOTE_COLORS[i % NOTE_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                {note.icon || "📄"}
              </div>
              
              {/* Note title and preview - clickable area */}
              <div style={{ flex: 1 }} onClick={() => onOpen(note)}>
                <div style={{ fontWeight: 600, color: t.text, marginBottom: 4 }}>{note.title}</div>
                <div style={{ fontSize: 12, color: t.muted }}>
                  {note.content?.replace(/[#>*-]/g, "").trim().slice(0, 60) || "No content"}
                </div>
              </div>
              
              {/* Right side meta information */}
              <div style={{ fontSize: 11, color: t.muted, textAlign: "right" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    onClick={(e) => confirmDelete(note.id, e)}
                    style={{
                      color: t.muted,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px",
                      borderRadius: "4px",
                      opacity: 0.5,
                      transition: "opacity 0.2s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = "0.5"}
                  >
                    <Ic n="trash" size={14} />
                  </button>
                  <span>•</span>
                  <span>status: active</span>
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