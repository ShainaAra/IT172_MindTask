const NOTE_COLORS = ["#5b8af0","#c084fc","#4ade80","#fbbf24","#f87171","#34d399","#60a5fa","#f472b6"];

export default function NotesGrid({ notes, onOpen, onAdd, t, user }) {
  return (
    <div style={{ padding:"48px 60px 80px", maxWidth:1000, margin:"0 auto", width:"100%" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:32 }}>
        <span style={{ fontSize:44 }}>📝</span>
        <div>
          <h1 style={{ fontSize:"2rem", fontWeight:700, fontFamily:"'Lora',serif", color:t.text }}>My Notes</h1>
          <p style={{ fontSize:13, color:t.muted, marginTop:3 }}>{notes.length} notes</p>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))", gap:16 }}>
        {notes.map((note, i) => (
          <div key={note.id} onClick={() => onOpen(note)}
            style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:14, padding:"18px 16px 14px", cursor:"pointer", minHeight:140, display:"flex", flexDirection:"column", gap:8, transition:"transform 0.15s, box-shadow 0.15s", position:"relative", overflow:"hidden" }}
            onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow=t.shadow; }}
            onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}>
            <div style={{ width:32, height:32, borderRadius:8, background:NOTE_COLORS[i % NOTE_COLORS.length], display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, marginBottom:4 }}>
              {note.icon || "📄"}
            </div>
            <div style={{ fontWeight:600, fontSize:13.5, color:t.text, lineHeight:1.3 }}>{note.title}</div>
            <div style={{ fontSize:11.5, color:t.muted, lineHeight:1.4, flex:1, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical" }}>
              {note.content?.replace(/[#>*-]/g,"").trim().slice(0,80) || "Empty note"}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:4 }}>
              <div style={{ width:16, height:16, borderRadius:"50%", background:user?.color||"#5b8af0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:8, fontWeight:700, color:"#fff" }}>{user?.avatar?.[0]}</div>
              <span style={{ fontSize:10.5, color:t.muted }}>{new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</span>
            </div>
          </div>
        ))}
        {/* New note card */}
        <div onClick={onAdd}
          style={{ border:`2px dashed ${t.border}`, borderRadius:14, padding:"18px 16px", cursor:"pointer", minHeight:140, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8, color:t.muted, transition:"border-color 0.15s, color 0.15s" }}
          onMouseEnter={e=>{ e.currentTarget.style.borderColor=t.accent; e.currentTarget.style.color=t.accent; }}
          onMouseLeave={e=>{ e.currentTarget.style.borderColor=t.border; e.currentTarget.style.color=t.muted; }}>
          <div style={{ fontSize:28 }}>+</div>
          <span style={{ fontSize:13, fontWeight:500 }}>New page</span>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE EDITOR ─────────────────────────────────────────────────────────────