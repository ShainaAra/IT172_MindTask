export default function InboxView({ t }) {
  const items = [
    { icon:"💬", title:"MindEase is ready", desc:"Your wellness companion is available anytime.", time:"Just now" },
    { icon:"✅", title:"Task board set up", desc:"Your tasks have been pre-loaded. Start managing them!", time:"Today" },
    { icon:"🌱", title:"Welcome to MindTask", desc:"Your workspace is ready. Start creating notes.", time:"Today" },
  ];
  return (
    <div style={{ padding:"48px 60px 80px", maxWidth:860, margin:"0 auto", width:"100%" }}>
      <h1 style={{ fontSize:"1.8rem", fontWeight:700, fontFamily:"'Lora',serif", color:t.text, marginBottom:20 }}>📥 Inbox</h1>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {items.map((item,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"14px 16px", background:t.card, border:`1px solid ${t.border}`, borderRadius:12 }}>
            <span style={{ fontSize:22, flexShrink:0 }}>{item.icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13.5, fontWeight:500, color:t.text }}>{item.title}</div>
              <div style={{ fontSize:12.5, color:t.muted, marginTop:3 }}>{item.desc}</div>
            </div>
            <span style={{ fontSize:11, color:t.muted, whiteSpace:"nowrap" }}>{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}