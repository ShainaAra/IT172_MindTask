import { useState, useEffect } from "react";
import { useTheme } from "../../context/useTheme";
import Ic from "../common/Ic";

// Define the three columns of the Kanban board with their status keys, display labels, and dot colors
const COLS = [
  { key:"todo", label:"To Do", dot:"#6b6b6b" },
  { key:"in-progress", label:"In Progress", dot:"#fbbf24" },
  { key:"done", label:"Done", dot:"#4ade80" },
];

// Predefined tags for task categorization
const TAGS = ["Dev","Design","AI","QA","Planning","DevOps","Research","Other"];

/**
 * Component: TaskBoard
 * Description: A Kanban-style task management board with drag-free task movement via status cycling.
 * Features:
 * - Three columns: To Do, In Progress, Done
 * - Task creation with title, priority, and tag selection
 * - Click task circle to cycle through statuses (todo → in-progress → done → todo)
 * - Delete tasks with confirmation modal
 * - Filter tasks by priority (All, High, Medium, Low)
 * - Visual task cards with priority badges and tag labels
 * 
 * @param {Object} props - Component properties
 * @param {Array} props.tasks - Array of task objects containing id, title, priority, tag, and status
 * @param {Function} props.onUpdate - Function to update tasks (called with new tasks array or updater function)
 * 
 * @returns {JSX.Element} Task board component with Kanban columns and task management UI
 */
export default function TaskBoard({ tasks, onUpdate }) {
  const t = useTheme(); // Theme context for styling
  
  // State for controlling the "Add New Task" form visibility
  const [adding, setAdding] = useState(false);
  
  // State for the new task form inputs (title, priority, tag)
  const [nt, setNt] = useState({ title:"", priority:"medium", tag:"Dev" });
  
  // State for filtering tasks by priority ("all", "high", "medium", "low")
  const [filter, setFilter] = useState("all");
  
  // State for tracking which task ID is pending deletion (null if no confirmation)
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  /**
   * Effect: Debug logging - logs tasks array whenever it changes
   * Useful for debugging state updates in development
   */
  useEffect(() => {
    console.log("Tasks in TaskBoard:", tasks);
  }, [tasks]);

  /**
   * Function: addTask
   * Description: Creates a new task and adds it to the task board
   * 
   * Process:
   * 1. Validates that title is not empty
   * 2. Creates new task object with unique ID (timestamp), current form values, and default status "todo"
   * 3. Logs the new task for debugging
   * 4. Calls onUpdate with updater function to append new task to existing tasks
   * 5. Resets form state and closes the add form
   */
  const addTask = () => {
    if(!nt.title.trim()) return;
    const newTask = {
      id: Date.now().toString(),
      title: nt.title,
      priority: nt.priority,
      tag: nt.tag,
      status: "todo"
    };
    console.log("Adding new task:", newTask);
    onUpdate(prev => [...prev, newTask]);
    setNt({title:"", priority:"medium", tag:"Dev"});
    setAdding(false);
  };

  /**
   * Function: cycle
   * Description: Cycles a task through the three statuses: todo → in-progress → done → todo
   * This is the primary interaction for moving tasks across columns
   * 
   * @param {string} id - ID of the task to cycle
   * 
   * Process:
   * 1. Defines the order of statuses
   * 2. Finds the target task
   * 3. Calculates the next status in the cycle (wraps around after "done")
   * 4. Logs the movement for debugging
   * 5. Creates updated tasks array and passes to onUpdate
   */
  const cycle = (id) => {
    const ord = ["todo","in-progress","done"];
    const task = tasks.find(tk => tk.id === id);
    if (!task) return;
    
    const currentIndex = ord.indexOf(task.status);
    const newStatus = ord[(currentIndex + 1) % 3];
    
    console.log(`Moving task ${id} from ${task.status} to ${newStatus}`);
    
    // Update local state - this triggers onUpdate which calls setTasks in AuthContext
    const updatedTasks = tasks.map(tk => 
      tk.id === id ? { ...tk, status: newStatus } : tk
    );
    onUpdate(updatedTasks);
  };

  /**
   * Function: confirmDelete
   * Description: Sets up the confirmation modal for task deletion
   * 
   * @param {string} id - ID of the task to delete
   */
  const confirmDelete = (id) => {
    setDeleteConfirm(id);
  };

  /**
   * Function: handleDelete
   * Description: Executes the actual deletion of the confirmed task
   * Called when user clicks "Delete Task" in the confirmation modal
   */
  const handleDelete = () => {
    if (deleteConfirm) {
      console.log("Deleting task:", deleteConfirm);
      onUpdate(prev => prev.filter(tk => tk.id !== deleteConfirm));
      setDeleteConfirm(null);
    }
  };

  /**
   * Function: cancelDelete
   * Description: Dismisses the delete confirmation modal without deleting
   */
  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  // Filter tasks based on selected priority filter
  // "all" shows all tasks, otherwise filter by exact priority match
  const filtered = filter === "all" ? tasks : tasks.filter(tk => tk.priority === filter);
  
  // Reusable input styling object for form elements
  const inp = { 
    background: t.inputBg, 
    border: `1px solid ${t.border}`, 
    borderRadius: 8, 
    padding: "8px 12px", 
    color: t.text, 
    fontSize: 13, 
    outline: "none" 
  };

  return (
    <div style={{ padding:"48px 60px 80px", maxWidth:1100, margin:"0 auto", width:"100%" }}>
      
      {/* Delete Confirmation Modal - Conditionally rendered when deleteConfirm is not null */}
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
          onClick={cancelDelete} // Click backdrop to cancel
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
            onClick={(e) => e.stopPropagation()} // Prevent backdrop click when clicking inside modal
          >
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🗑️</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: t.text, marginBottom: 8 }}>
                Delete Task?
              </h3>
              <p style={{ fontSize: 13, color: t.muted }}>
                Are you sure you want to delete this task? This action cannot be undone.
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
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section - Title and task statistics */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "18px",           // comfortable spacing
        marginBottom: "24px"   // more balanced bottom margin
      }}>
        <div>
          <h1 style={{ 
            fontSize: "2rem", 
            fontWeight: 700, 
            fontFamily: "'Lora', serif", 
            color: t.text,
            lineHeight: 1.2,    // tighter heading height
            margin: 0           // remove default h1 margin
          }}>My Tasks</h1>
          <p style={{ 
            fontSize: 13, 
            color: t.muted, 
            marginTop: "6px",   // small space between title and stats
            marginBottom: 0 
          }}>
            {tasks.length} tasks · {tasks.filter(tk => tk.status === "done").length} completed
          </p>
        </div>
      </div>

      {/* Action Bar - New task button and priority filter */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:22, flexWrap:"wrap" }}>
        {/* New Task Button */}
        <button className="btn tc" onClick={()=>setAdding(true)}
          style={{ display:"flex", alignItems:"center", gap:6, background:t.accent, color:"#fff", padding:"8px 16px", borderRadius:9, fontSize:13, fontWeight:500, boxShadow:"0 2px 10px rgba(91,138,240,0.28)" }}>
          <Ic n="plus" size={14} /> New Task
        </button>
        
        {/* Priority Filter Buttons */}
        <div style={{ display:"flex", gap:5, background:t.inputBg, border:`1px solid ${t.border}`, borderRadius:9, padding:4 }}>
          {["all","high","medium","low"].map(f=>(
            <button key={f} className="btn tc" onClick={()=>setFilter(f)}
              style={{ padding:"5px 11px", borderRadius:6, fontSize:12, fontWeight:500, background:filter===f?t.accent:"transparent", color:filter===f?"#fff":t.muted }}>
              {f.charAt(0).toUpperCase()+f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Add Task Form - Conditionally rendered when adding is true */}
      {adding && (
        <div className="slide-up" style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:12, padding:16, marginBottom:20 }}>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
            {/* Task Title Input */}
            <input value={nt.title} onChange={e=>setNt(n=>({...n,title:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addTask()} placeholder="Task title..." autoFocus style={{...inp,flex:1,minWidth:180}} />
            
            {/* Priority Dropdown */}
            <select value={nt.priority} onChange={e=>setNt(n=>({...n,priority:e.target.value}))} style={{...inp,width:"auto"}}>
              {["high","medium","low"].map(p=><option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)} Priority</option>)}
            </select>
            
            {/* Tag Dropdown */}
            <select value={nt.tag} onChange={e=>setNt(n=>({...n,tag:e.target.value}))} style={{...inp,width:"auto"}}>
              {TAGS.map(tg=><option key={tg} value={tg}>{tg}</option>)}
            </select>
            
            {/* Form Action Buttons */}
            <button className="btn tc" onClick={addTask} style={{ background:t.accent, color:"#fff", padding:"8px 16px", borderRadius:8, fontSize:13, fontWeight:500 }}>Add</button>
            <button className="btn tc" onClick={()=>setAdding(false)} style={{ background:t.hover, color:t.muted, padding:"8px 12px", borderRadius:8, fontSize:13 }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Kanban Board Columns - 3 column grid layout */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:18, alignItems:"start" }}>
        {COLS.map(col=>{
          // Filter tasks for this specific column status and current priority filter
          const colTasks = filtered.filter(tk=>tk.status===col.key);
          return (
            <div key={col.key}>
              {/* Column Header with dot indicator and task count */}
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12, padding:"0 2px" }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:col.dot, boxShadow:`0 0 6px ${col.dot}55` }} />
                <span style={{ fontSize:11.5, fontWeight:600, color:t.muted, textTransform:"uppercase", letterSpacing:"0.07em" }}>{col.label}</span>
                <span style={{ marginLeft:"auto", fontSize:11, color:t.muted, background:t.tagBg, padding:"1px 7px", borderRadius:10, fontWeight:500 }}>{colTasks.length}</span>
              </div>
              
              {/* Column Tasks Container */}
              <div style={{ display:"flex", flexDirection:"column", gap:9, minHeight:70 }}>
                {colTasks.map(tk=>(
                  <div key={tk.id} className="task-card" style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:11, padding:"13px 14px", boxShadow:t.dark?"0 1px 6px rgba(0,0,0,0.35)":"0 1px 6px rgba(0,0,0,0.06)" }}>
                    
                    {/* Task Row - Status circle, title, delete button */}
                    <div style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
                      {/* Status Toggle Button - Cycles task through statuses */}
                      <button className="btn" onClick={()=>cycle(tk.id)} style={{ color:col.dot, padding:0, marginTop:1, flexShrink:0, lineHeight:0 }}>
                        <Ic n={tk.status==="done"?"check":"circle"} size={15} />
                      </button>
                      
                      {/* Task Title - Strikethrough when done */}
                      <span style={{ fontSize:13, flex:1, lineHeight:1.45, textDecoration:tk.status==="done"?"line-through":"none", color:tk.status==="done"?t.muted:t.text }}>{tk.title}</span>
                      
                      {/* Delete Button - Opens confirmation modal */}
                      <button className="btn" onClick={()=>confirmDelete(tk.id)} style={{ color:t.muted, padding:1, opacity:0.4, lineHeight:0, flexShrink:0 }}>
                        <Ic n="x" size={12} />
                      </button>
                    </div>
                    
                    {/* Task Metadata - Priority badge and tag badge */}
                    <div style={{ display:"flex", gap:6, marginTop:9, paddingLeft:23 }}>
                      <span className={`p${tk.priority[0]}`} style={{ fontSize:10.5, padding:"2px 8px", borderRadius:6, fontWeight:500 }}>{tk.priority}</span>
                      <span style={{ fontSize:10.5, padding:"2px 8px", borderRadius:6, background:t.tagBg, color:t.muted, fontWeight:500 }}>{tk.tag}</span>
                    </div>
                  </div>
                ))}
                
                {/* Empty State - Shown when column has no tasks */}
                {colTasks.length===0 && (
                  <div style={{ border:`1px dashed ${t.border}`, borderRadius:11, padding:"18px 14px", textAlign:"center", color:t.muted, fontSize:12 }}>No tasks</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}