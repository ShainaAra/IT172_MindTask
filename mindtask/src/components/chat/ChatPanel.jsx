import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/useAuth";
import { useTheme } from "../../context/useTheme";
import Ic from "../common/Ic";
import { getAIResponse } from "../../data/wellness";

// Predefined quick prompt buttons for common emotional states
const QUICK = ["I'm overwhelmed 😔","Need a break 😮‍💨","Feeling anxious 😟","Feeling good! 🌟","Can't focus 🎯"];

// Initial greeting message from the assistant, personalized with user's name
const INITIAL_MSG = (name) => ({ role:"assistant", text:`Hey ${name?.split(" ")[0]||"there"}! 🌿 I'm MindEase, your wellness companion. How are you feeling today? Whether you're stressed, overwhelmed, or just need to talk — I'm here.` });

export default function ChatPanel({ onClose }) {
  // Theme context for styling based on dark/light mode
  const t = useTheme();
  
  // Auth context providing user data, chat history, and methods to modify chat
  const { user, chatHistory, appendChatMessage } = useAuth();
  
  // State for storing all messages in the current chat session
  const [msgs, setMsgs] = useState(chatHistory);
  
  // State for tracking current input field value
  const [input, setInput] = useState("");
  
  // State for showing typing indicator while waiting for AI response
  const [typing, setTyping] = useState(false);
  
  // Ref for auto-scrolling to the latest message
  const endRef = useRef(null);

  /**
   * Effect Hook: Synchronizes local messages with global chat history
   * - If there's existing chat history, load it
   * - Otherwise, initialize with the welcome message
   * Dependencies: chatHistory, user?.name
   */
  useEffect(() => {
    if (chatHistory.length > 0) {
      setMsgs(chatHistory);
    } else {
      setMsgs([INITIAL_MSG(user?.name)]);
    }
  }, [chatHistory, user?.name]);

  /**
   * Effect Hook: Auto-scrolls to the bottom of the chat
   * - Triggers whenever messages change or typing state changes
   * - Ensures latest message is always visible
   * Dependencies: msgs, typing
   */
  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs,typing]);

  /**
   * Function: send
   * Description: Sends a user message to the AI and handles the response
   * 
   * @param {string} txt - Optional message text (if not provided, uses input state)
   * 
   * Process:
   * 1. Validates message is not empty
   * 2. Clears input field
   * 3. Appends user message to global chat history
   * 4. Shows typing indicator
   * 5. Calls AI service to get response (passing user ID for personalization)
   * 6. Hides typing indicator
   * 7. Appends assistant's reply to global chat history
   * 
   * Notes: This function is asynchronous and updates state in sequence for UX
   */
  const send = async (txt) => {
    const msg = (txt || input).trim();
    if (!msg) return;
    setInput("");
    appendChatMessage({ role: "user", text: msg });
    setTyping(true);
    const reply = await getAIResponse(msg, user?.id);
    setTyping(false);
    appendChatMessage({ role: "assistant", text: reply });
  };

  return (
    <div className="pop-in" style={{ position:"fixed", bottom:88, right:24, width:340, height:460, background:t.chatBg, border:`1px solid ${t.border}`, borderRadius:16, display:"flex", flexDirection:"column", zIndex:300, boxShadow:"0 8px 32px rgba(0,0,0,0.35)", overflow:"hidden" }}>
      
      {/* Header */}
      <div style={{ padding:"14px 16px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", gap:10, background:t.dark?"#161616":"#f5f5f3", flexShrink:0 }}>
        <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#4ade80,#5b8af0)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>🌿</div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:600, fontSize:14, color:t.text }}>MindEase</div>
          <div style={{ fontSize:11.5, color:"#4ade80", display:"flex", alignItems:"center", gap:4 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#4ade80" }} /> Here for you
          </div>
        </div>
        <button className="btn" onClick={onClose} style={{ color:t.muted, padding:5, borderRadius:7, lineHeight:0 }}><Ic n="x" size={15} /></button>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflow:"auto", padding:"14px 14px 6px", display:"flex", flexDirection:"column", gap:11 }}>
        {msgs.map((m,i)=>(
          <div key={i} className="bubble" style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start", alignItems:"flex-end", gap:8 }}>
            {m.role==="assistant" && <div style={{ width:26, height:26, borderRadius:"50%", background:"linear-gradient(135deg,#4ade80,#5b8af0)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, flexShrink:0, marginBottom:2 }}>🌿</div>}
            <div style={{ maxWidth:"78%", padding:"10px 13px", borderRadius:m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px", background:m.role==="user"?t.userBubble:t.aiBubble, fontSize:13.5, lineHeight:1.55, color:t.text, border:`1px solid ${m.role==="user"?"transparent":t.border}` }}>
              {m.text}
            </div>
            {m.role==="user" && <div style={{ width:26, height:26, borderRadius:"50%", background:user?.color||t.accent, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:"#fff", flexShrink:0, marginBottom:2 }}>{user?.avatar}</div>}
          </div>
        ))}
        {typing && (
          <div style={{ display:"flex", alignItems:"flex-end", gap:8 }}>
            <div style={{ width:26, height:26, borderRadius:"50%", background:"linear-gradient(135deg,#4ade80,#5b8af0)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, flexShrink:0 }}>🌿</div>
            <div style={{ background:t.aiBubble, border:`1px solid ${t.border}`, borderRadius:"16px 16px 16px 4px", padding:"11px 14px", display:"flex", gap:4, alignItems:"center" }}>
              {[0,1,2].map(i=><div key={i} className="td" style={{ width:6, height:6, borderRadius:"50%", background:t.muted }} />)}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick prompts */}
      <div style={{ padding:"6px 12px", display:"flex", gap:6, overflowX:"auto", flexShrink:0 }}>
        {QUICK.map(p=>(
          <button key={p} className="btn tc" onClick={()=>send(p)}
            style={{ background:t.dark?"rgba(91,138,240,0.1)":"rgba(91,138,240,0.07)", color:t.accent, border:`1px solid ${t.dark?"rgba(91,138,240,0.18)":"rgba(91,138,240,0.13)"}`, borderRadius:20, padding:"4px 11px", fontSize:11.5, whiteSpace:"nowrap", fontWeight:500 }}>
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding:"8px 12px 14px", display:"flex", gap:8, alignItems:"center", flexShrink:0 }}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}
          placeholder="Share how you're feeling…"
          style={{ flex:1, background:t.inputBg, border:`1px solid ${t.border}`, borderRadius:11, padding:"9px 13px", color:t.text, fontSize:13, outline:"none" }} />
        <button className="btn tc" onClick={()=>send()}
          style={{ background:"linear-gradient(135deg,#5b8af0,#c084fc)", width:38, height:38, borderRadius:11, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 2px 8px rgba(91,138,240,0.35)", border:"none", cursor:"pointer", color:"white", fontSize:16, lineHeight:1 }}>
          &#9658;
        </button>
      </div>
    </div>
  );
}

// ─── NAV VIEWS ───────────────────────────────────────────────────────────────