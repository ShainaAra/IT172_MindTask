import { useEffect, useRef, useState } from "react";

export default function HomeView({ user, pages, tasks, setActiveId, setActiveNav, t }) {
  const done = tasks.filter(tk=>tk.status==="done").length;
  const inProgress = tasks.filter(tk=>tk.status==="in-progress").length;
  const todo = tasks.filter(tk=>tk.status==="todo").length;

  return (
    <div style={{ padding:"48px 60px 80px", maxWidth:900, margin:"0 auto", width:"100%" }}>
      {/* Greeting */}
      <div style={{ marginBottom:36, textAlign:"center" }}>
        <h1 style={{ fontSize:"2.2rem", fontWeight:700, fontFamily:"'Lora',serif", color:t.text }}>Hi {user?.name?.split(" ")[0]} 👋</h1>
        <p style={{ color:t.muted, fontSize:15, marginTop:6 }}>Where should we start?</p>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginBottom:32 }}>
        {[
          { label:"To Do", count:todo, color:"#6b6b6b", emoji:"📋" },
          { label:"In Progress", count:inProgress, color:"#fbbf24", emoji:"⚡" },
          { label:"Completed", count:done, color:"#4ade80", emoji:"✅" },
        ].map(s=>(
          <div key={s.label} style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:12, padding:"18px 20px" }}>
            <div style={{ fontSize:24, marginBottom:8 }}>{s.emoji}</div>
            <div style={{ fontSize:"1.6rem", fontWeight:700, color:s.color }}>{s.count}</div>
            <div style={{ fontSize:12, color:t.muted, marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent pages */}
      <div style={{ marginBottom:36 }}>
        <div style={{ fontSize:11, color:t.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:10 }}>Recent Pages</div>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {pages.slice(0,5).map(pg=>(
            <div key={pg.id} onClick={()=>{ setActiveId(pg.id); setActiveNav(null); }}
              style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:t.card, border:`1px solid ${t.border}`, borderRadius:10, cursor:"pointer", transition:"background 0.12s" }}
              onMouseEnter={e=>e.currentTarget.style.background=t.hover}
              onMouseLeave={e=>e.currentTarget.style.background=t.card}>
              <span style={{ fontSize:18 }}>{pg.icon}</span>
              <span style={{ fontSize:13.5, fontWeight:500, color:t.text }}>{pg.title}</span>
              <span style={{ marginLeft:"auto", fontSize:11, color:t.muted, background:t.tagBg, padding:"2px 8px", borderRadius:6 }}>{pg.type==="tasks"?"Tasks":"Page"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}