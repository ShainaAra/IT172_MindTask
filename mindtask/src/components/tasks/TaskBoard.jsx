import { useState, useEffect } from "react";
import { useTheme } from "../../context/useTheme";
import Ic from "../common/Ic";

const COLS = [
  { key:"todo", label:"To Do", dot:"#6b6b6b" },
  { key:"in-progress", label:"In Progress", dot:"#fbbf24" },
  { key:"done", label:"Done", dot:"#4ade80" },
];
const TAGS = ["Dev","Design","AI","QA","Planning","DevOps","Research","Other"];

export default function TaskBoard({ tasks, onUpdate }) {
  const t = useTheme();
  const [adding, setAdding] = useState(false);
  const [nt, setNt] = useState({ title:"", priority:"medium", tag:"Dev" });
  const [filter, setFilter] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Debug: log tasks when they change
  useEffect(() => {
    console.log("Tasks in TaskBoard:", tasks);
  }, [tasks]);

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

  const confirmDelete = (id) => {
    setDeleteConfirm(id);
  };

  const handleDelete = () => {
    if (deleteConfirm) {
      console.log("Deleting task:", deleteConfirm);
      onUpdate(prev => prev.filter(tk => tk.id !== deleteConfirm));
      setDeleteConfirm(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const filtered = filter === "all" ? tasks : tasks.filter(tk => tk.priority === filter);
  
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
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={cancelDelete}
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
            onClick={(e) => e.stopPropagation()}
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
                  background: "#ef4444",
                  border: "none",
                  color: "#fff",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#dc2626"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#ef4444"}
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display:"flex", alignItems:"flex-end", gap:12, marginBottom:26 }}>
        <span style={{ fontSize:42 }}>✅</span>
        <div>
          <h1 style={{ fontSize:"2rem", fontWeight:700, fontFamily:"'Lora',serif", color:t.text }}>My Tasks</h1>
          <p style={{ fontSize:13, color:t.muted, marginTop:2 }}>{tasks.length} tasks · {tasks.filter(tk=>tk.status==="done").length} completed</p>
        </div>
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:22, flexWrap:"wrap" }}>
        <button className="btn tc" onClick={()=>setAdding(true)}
          style={{ display:"flex", alignItems:"center", gap:6, background:t.accent, color:"#fff", padding:"8px 16px", borderRadius:9, fontSize:13, fontWeight:500, boxShadow:"0 2px 10px rgba(91,138,240,0.28)" }}>
          <Ic n="plus" size={14} /> New Task
        </button>
        <div style={{ display:"flex", gap:5, background:t.inputBg, border:`1px solid ${t.border}`, borderRadius:9, padding:4 }}>
          {["all","high","medium","low"].map(f=>(
            <button key={f} className="btn tc" onClick={()=>setFilter(f)}
              style={{ padding:"5px 11px", borderRadius:6, fontSize:12, fontWeight:500, background:filter===f?t.accent:"transparent", color:filter===f?"#fff":t.muted }}>
              {f.charAt(0).toUpperCase()+f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {adding && (
        <div className="slide-up" style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:12, padding:16, marginBottom:20 }}>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
            <input value={nt.title} onChange={e=>setNt(n=>({...n,title:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addTask()} placeholder="Task title..." autoFocus style={{...inp,flex:1,minWidth:180}} />
            <select value={nt.priority} onChange={e=>setNt(n=>({...n,priority:e.target.value}))} style={{...inp,width:"auto"}}>
              {["high","medium","low"].map(p=><option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)} Priority</option>)}
            </select>
            <select value={nt.tag} onChange={e=>setNt(n=>({...n,tag:e.target.value}))} style={{...inp,width:"auto"}}>
              {TAGS.map(tg=><option key={tg} value={tg}>{tg}</option>)}
            </select>
            <button className="btn tc" onClick={addTask} style={{ background:t.accent, color:"#fff", padding:"8px 16px", borderRadius:8, fontSize:13, fontWeight:500 }}>Add</button>
            <button className="btn tc" onClick={()=>setAdding(false)} style={{ background:t.hover, color:t.muted, padding:"8px 12px", borderRadius:8, fontSize:13 }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:18, alignItems:"start" }}>
        {COLS.map(col=>{
          const colTasks = filtered.filter(tk=>tk.status===col.key);
          return (
            <div key={col.key}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12, padding:"0 2px" }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:col.dot, boxShadow:`0 0 6px ${col.dot}55` }} />
                <span style={{ fontSize:11.5, fontWeight:600, color:t.muted, textTransform:"uppercase", letterSpacing:"0.07em" }}>{col.label}</span>
                <span style={{ marginLeft:"auto", fontSize:11, color:t.muted, background:t.tagBg, padding:"1px 7px", borderRadius:10, fontWeight:500 }}>{colTasks.length}</span>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:9, minHeight:70 }}>
                {colTasks.map(tk=>(
                  <div key={tk.id} className="task-card" style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:11, padding:"13px 14px", boxShadow:t.dark?"0 1px 6px rgba(0,0,0,0.35)":"0 1px 6px rgba(0,0,0,0.06)" }}>
                    <div style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
                      <button className="btn" onClick={()=>cycle(tk.id)} style={{ color:col.dot, padding:0, marginTop:1, flexShrink:0, lineHeight:0 }}>
                        <Ic n={tk.status==="done"?"check":"circle"} size={15} />
                      </button>
                      <span style={{ fontSize:13, flex:1, lineHeight:1.45, textDecoration:tk.status==="done"?"line-through":"none", color:tk.status==="done"?t.muted:t.text }}>{tk.title}</span>
                      <button className="btn" onClick={()=>confirmDelete(tk.id)} style={{ color:t.muted, padding:1, opacity:0.4, lineHeight:0, flexShrink:0 }}>
                        <Ic n="x" size={12} />
                      </button>
                    </div>
                    <div style={{ display:"flex", gap:6, marginTop:9, paddingLeft:23 }}>
                      <span className={`p${tk.priority[0]}`} style={{ fontSize:10.5, padding:"2px 8px", borderRadius:6, fontWeight:500 }}>{tk.priority}</span>
                      <span style={{ fontSize:10.5, padding:"2px 8px", borderRadius:6, background:t.tagBg, color:t.muted, fontWeight:500 }}>{tk.tag}</span>
                    </div>
                  </div>
                ))}
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