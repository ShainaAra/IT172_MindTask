import { createContext, useContext, useRef, useState } from "react";
import { DEMO_USERS, makeUserData } from "../data/defaults";

const AuthCtx = createContext();

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [err,  setErr]    = useState("");
  const [store, setStore] = useState(() => {
    const s = {}; DEMO_USERS.forEach(u => { s[u.id] = makeUserData(u.id); }); return s;
  });
  const users = useRef([...DEMO_USERS]);

  const login = (email, pw) => {
    const u = users.current.find(u => u.email === email && u.password === pw);
    if (u) { setUser(u); setErr(""); return true; }
    setErr("Invalid email or password."); return false;
  };
  const register = (name, email, pw) => {
    if (users.current.find(u => u.email === email)) { setErr("Email already in use."); return false; }
    const id = `u${Date.now()}`;
    const initials = name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
    const colors = ["#f87171","#fbbf24","#34d399","#60a5fa","#a78bfa","#f472b6"];
    const nu = { id, name, email, password: pw, avatar: initials, color: colors[Math.floor(Math.random()*colors.length)] };
    users.current.push(nu);
    setStore(p => ({ ...p, [id]: makeUserData(id) }));
    setUser(nu); setErr(""); return true;
  };
  const logout = () => setUser(null);
  const getData = () => user ? store[user.id] : null;
  const setPages = (fn) => { if (!user) return; setStore(p => ({ ...p, [user.id]: { ...p[user.id], pages: typeof fn==="function" ? fn(p[user.id].pages) : fn } })); };
  const setTasks = (fn) => { if (!user) return; setStore(p => ({ ...p, [user.id]: { ...p[user.id], tasks: typeof fn==="function" ? fn(p[user.id].tasks) : fn } })); };

  return <AuthCtx.Provider value={{ user, login, register, logout, err, setErr, getData, setPages, setTasks, demoUsers: DEMO_USERS }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);