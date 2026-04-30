import { useEffect, useRef, useState } from "react";
import { getAIResponse } from "../data/wellness";

export default function HomeView({ user, pages, tasks, setActiveId, setActiveNav, t }) {
  const done = tasks.filter(tk=>tk.status==="done").length;
  const inProgress = tasks.filter(tk=>tk.status==="in-progress").length;
  const todo = tasks.filter(tk=>tk.status==="todo").length;
  const [aiInput, setAiInput] = useState("");
  const [aiMsgs, setAiMsgs] = useState([]);
  const [aiTyping, setAiTyping] = useState(false);
  const aiEndRef = useRef(null);
  useEffect(()=>{ aiEndRef.current?.scrollIntoView({behavior:"smooth"}); },[aiMsgs,aiTyping]);

  const sendAI = async (txt) => {
    const msg = (txt||aiInput).trim(); if(!msg) return;
    setAiInput("");
    setAiMsgs(m=>[...m,{role:"user",text:msg}]);
    setAiTyping(true);
    const reply = await getAIResponse(msg, user?.name||"friend");
    setAiTyping(false);
    setAiMsgs(m=>[...m,{role:"assistant",text:reply}]);
  };

  const SUGGESTIONS = ["Help me focus 🎯","I'm feeling stressed 😔","Boost my day 🌟","I need a break 😮‍💨"];

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

      {/* AI Chat Box - Gemini style - BELOW containers */}
      <div style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:18, padding:"6px 6px 10px", boxShadow:t.shadow }}>
        {/* Message history inside box */}
        {aiMsgs.length > 0 && (
          <div style={{ maxHeight:220, overflowY:"auto", padding:"10px 14px 6px", display:"flex", flexDirection:"column", gap:10, marginBottom:4 }}>
            {aiMsgs.map((m,i)=>(
              <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start", gap:8, alignItems:"flex-end" }}>
                {m.role==="assistant" && <div style={{ width:24,height:24,borderRadius:"50%",background:"linear-gradient(135deg,#4ade80,#5b8af0)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,flexShrink:0 }}>🌿</div>}
                <div style={{ maxWidth:"80%", padding:"9px 13px", borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px", background:m.role==="user"?t.userBubble:t.aiBubble, fontSize:13.5, color:t.text, lineHeight:1.5, border:`1px solid ${m.role==="user"?"transparent":t.border}` }}>
                  {m.text}
                </div>
                {m.role==="user" && <div style={{ width:24,height:24,borderRadius:"50%",background:user?.color||"#5b8af0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#fff",flexShrink:0 }}>{user?.avatar}</div>}
              </div>
            ))}
            {aiTyping && (
              <div style={{ display:"flex", alignItems:"flex-end", gap:8 }}>
                <div style={{ width:24,height:24,borderRadius:"50%",background:"linear-gradient(135deg,#4ade80,#5b8af0)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,flexShrink:0 }}>🌿</div>
                <div style={{ background:t.aiBubble, border:`1px solid ${t.border}`, borderRadius:"14px 14px 14px 4px", padding:"10px 14px", display:"flex", gap:4, alignItems:"center" }}>
                  {[0,1,2].map(i=><div key={i} className="td" style={{ width:5,height:5,borderRadius:"50%",background:t.muted }} />)}
                </div>
              </div>
            )}
            <div ref={aiEndRef} />
          </div>
        )}
        {/* Input row */}
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"4px 8px" }}>
          <input value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendAI()}
            placeholder="Ask MindEase anything…"
            style={{ flex:1, background:"transparent", border:"none", color:t.text, fontSize:15, outline:"none", padding:"10px 8px" }} />
          <button onClick={()=>sendAI()}
            style={{ background:"linear-gradient(135deg,#5b8af0,#c084fc)", width:38, height:38, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", border:"none", cursor:"pointer", flexShrink:0, boxShadow:"0 2px 8px rgba(91,138,240,0.35)", color:"white", fontSize:16, lineHeight:1 }}>
            &#9658;
          </button>
        </div>
      </div>

      {/* Suggestion chips */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:14, justifyContent:"center" }}>
        {SUGGESTIONS.map(s=>(
          <button key={s} onClick={()=>sendAI(s)}
            style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:20, padding:"7px 16px", fontSize:13, color:t.text, cursor:"pointer", fontWeight:500 }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor=t.accent; e.currentTarget.style.color=t.accent; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor=t.border; e.currentTarget.style.color=t.text; }}>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
