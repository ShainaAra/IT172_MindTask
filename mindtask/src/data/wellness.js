export const WELLNESS = [
  { triggers:["overwhelm","too much","stressed","stress","anxious","anxiety","panic"],     text:"I hear you — feeling overwhelmed is genuinely exhausting. 💙 Let's take this one step at a time. What's the single thing weighing on you the most right now? Sometimes naming it out loud makes it feel a little smaller." },
  { triggers:["tired","exhausted","burnt out","burnout","drained","no energy"],            text:"Burnout is real and serious. Your body and mind are sending you a signal. 🌿 Have you been able to take any breaks today? Even 5 minutes away from screens can genuinely reset your nervous system." },
  { triggers:["can't focus","distracted","procrastinat","can't start","where to start"],   text:"Trouble focusing is so common when tasks feel big. 🎯 Try this: just commit to starting for 5 minutes. Not finishing — just starting. That's usually all the momentum you need." },
  { triggers:["sad","lonely","down","depressed","hopeless","empty","worthless"],           text:"Thank you for trusting me with this. 💛 Feeling low is part of being human, but you don't have to sit with it alone. Is there someone you trust you could reach out to today?" },
  { triggers:["happy","great","amazing","excited","wonderful","feeling good","good today"],text:"That's so wonderful to hear! 🌟 Positive energy is worth celebrating. What's been going well? Recognizing your wins — even small ones — is one of the best things for your mental health." },
  { triggers:["deadline","due date","late","behind","running out of time"],                text:"Deadline pressure is intense — I get it. Take one slow breath first. 🌬️ Then write just the next 3 actions you need to take. Not everything. Just 3. What would those be?" },
  { triggers:["sleep","insomnia","can't sleep","tired but"],                               text:"Sleep struggles affect everything — mood, focus, energy. 🌙 Try dimming screens an hour before bed and avoid reviewing tasks at night. Your mind needs permission to rest. You've done enough today." },
  { triggers:["angry","frustrated","mad","irritated","annoyed"],                           text:"Frustration signals that something matters to you. 🔥 Try labeling it out loud: 'I feel frustrated because...' — this tiny act of naming actually calms your nervous system. What's at the root of it?" },
  { triggers:["hello","hi","hey","hiya"],                                                  text:"Hey there! 👋 So glad you opened MindEase. How are you feeling today — honestly? Whether it's work stress, personal stuff, or just a general blah, I'm here to listen." },
];
export function fallbackResponse(msg) {
  const lower = msg.toLowerCase();
  for (const w of WELLNESS) if (w.triggers.some(t => lower.includes(t))) return w.text;
  return "I'm here with you. 🤍 Whatever you're carrying right now is valid. Would you like to talk about what's on your mind?";
}
export async function getAIResponse(msg, name) {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg, name }),
    });
    if (!res.ok) throw new Error("AI service error");
    const data = await res.json();
    return data?.reply || fallbackResponse(msg);
  } catch (error) {
    console.error("getAIResponse error:", error);
    return fallbackResponse(msg);
  }
}

// ─── MARKDOWN ────────────────────────────────────────────────────────────────
