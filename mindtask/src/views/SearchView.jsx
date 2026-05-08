import { useState } from "react";

/**
 * Component: SearchView
 * Description: Search functionality that allows users to find notes and tasks 
 * by title or content. Displays real-time results as user types, with separate
 * sections for Notes and Tasks. Clicking on a search result navigates directly
 * to the note/task.
 * 
 * @param {Object} props
 * @param {Array} props.notes - Array of all user notes to search through
 * @param {Array} props.tasks - Array of all user tasks to search through
 * @param {Function} props.setActiveId - Function to navigate to a specific note/task
 * @param {Function} props.setActiveNav - Function to clear active navigation state
 * @param {Object} props.t - Theme object from useTheme() for styling
 * 
 * @returns {JSX.Element} Search page with input field and filtered results
 */
export default function SearchView({ notes, tasks, setActiveId, setActiveNav, t }) {
  // State for search query string
  const [query, setQuery] = useState("");
  const q = query.toLowerCase();
  
  // Filter notes by title or content match
  const matchedNotes = q ? notes.filter(n => 
    n.title.toLowerCase().includes(q) || 
    n.content?.toLowerCase().includes(q)
  ) : [];
  
  // Filter tasks by title match
  const matchedTasks = q ? tasks.filter(tk => tk.title.toLowerCase().includes(q)) : [];
  
  return (
    <div style={{ padding:"48px 60px 80px", maxWidth:860, margin:"0 auto", width:"100%" }}>
      {/* Page Header */}
      <h1 style={{ fontSize:"1.8rem", fontWeight:700, fontFamily:"'Lora',serif", color:t.text, marginBottom:20 }}>🔍 Search</h1>
      
      {/* Search Input Field */}
      <input 
        value={query} 
        onChange={e=>setQuery(e.target.value)} 
        autoFocus 
        placeholder="Search notes and tasks..."
        style={{ 
          width:"100%", 
          background:t.inputBg, 
          border:`1px solid ${t.border}`, 
          borderRadius:12, 
          padding:"13px 18px", 
          color:t.text, 
          fontSize:15, 
          outline:"none", 
          marginBottom:24 
        }} 
      />
      
      {/* Results Section - Only shown when query exists */}
      {q && (
        <div>
          {/* Notes Results Section */}
          {matchedNotes.length > 0 && (
            <>
              <div style={{ 
                fontSize:11, 
                color:t.muted, 
                fontWeight:600, 
                textTransform:"uppercase", 
                letterSpacing:"0.07em", 
                marginBottom:8 
              }}>
                Notes ({matchedNotes.length})
              </div>
              {matchedNotes.map(note => (
                <div 
                  key={note.id} 
                  onClick={() => { 
                    setActiveId(note.id); 
                    setActiveNav(null); 
                  }}
                  style={{ 
                    display:"flex", 
                    alignItems:"center", 
                    gap:10, 
                    padding:"10px 14px", 
                    background:t.card, 
                    border:`1px solid ${t.border}`, 
                    borderRadius:10, 
                    cursor:"pointer", 
                    marginBottom:6 
                  }}
                >
                  <span style={{ fontSize:18 }}>{note.icon || "📄"}</span>
                  <span style={{ fontSize:13.5, color:t.text }}>{note.title}</span>
                  {/* Type Badge */}
                  {note.type && (
                    <span style={{ 
                      marginLeft:"auto", 
                      fontSize:10, 
                      color:t.muted, 
                      background:t.tagBg, 
                      padding:"2px 8px", 
                      borderRadius:10 
                    }}>
                      {note.type === "welcome" ? "Welcome" : note.type === "tasks" ? "Tasks" : "Note"}
                    </span>
                  )}
                </div>
              ))}
            </>
          )}
          
          {/* Tasks Results Section */}
          {matchedTasks.length > 0 && (
            <>
              <div style={{ 
                fontSize:11, 
                color:t.muted, 
                fontWeight:600, 
                textTransform:"uppercase", 
                letterSpacing:"0.07em", 
                marginBottom:8, 
                marginTop:16 
              }}>
                Tasks ({matchedTasks.length})
              </div>
              {matchedTasks.map(tk => (
                <div 
                  key={tk.id} 
                  style={{ 
                    display:"flex", 
                    alignItems:"center", 
                    gap:10, 
                    padding:"10px 14px", 
                    background:t.card, 
                    border:`1px solid ${t.border}`, 
                    borderRadius:10, 
                    marginBottom:6 
                  }}
                >
                  <span style={{ fontSize:14 }}>✅</span>
                  <span style={{ fontSize:13.5, color:t.text }}>{tk.title}</span>
                  <span style={{ marginLeft:"auto", fontSize:11, color:t.muted }}>{tk.status}</span>
                </div>
              ))}
            </>
          )}
          
          {/* No Results Message */}
          {matchedNotes.length === 0 && matchedTasks.length === 0 && (
            <div style={{ textAlign:"center", color:t.muted, fontSize:14, padding:"40px 0" }}>
              No results for "{query}"
            </div>
          )}
        </div>
      )}
      
      {/* Empty State - Prompt to start searching */}
      {!q && (
        <div style={{ textAlign:"center", color:t.muted, fontSize:14, padding:"40px 0" }}>
          Start typing to search your workspace...
        </div>
      )}
    </div>
  );
}