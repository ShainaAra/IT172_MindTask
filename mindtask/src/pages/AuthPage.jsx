import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Ic from "../components/common/Ic";

export default function AuthPage() {
  const { login, register, err, setErr, demoUsers } = useAuth();
  const t = useTheme();

  const [mode, setMode] = useState("login");
  const [showPw, setShowPw] = useState(false);
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const upd = (k, v) => {
    setF((p) => ({ ...p, [k]: v }));
    setErr("");
  };

  const submit = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 350));

    if (mode === "login") login(f.email, f.password);
    else {
      if (!f.name.trim()) {
        setErr("Please enter your name.");
        setLoading(false);
        return;
      }
      register(f.name, f.email, f.password);
    }

    setLoading(false);
  };

  const quick = (u) => {
    setMode("login");
    setTimeout(() => login(u.email, u.password), 20);
  };

  const inp = {
    background: t.inputBg,
    border: `1px solid ${t.border}`,
    borderRadius: 10,
    padding: "12px 14px",
    color: t.text,
    fontSize: 14,
    width: "100%",
    height: 46,
    boxSizing: "border-box",
    outline: "none",
  };

  const lbl = {
    fontSize: 12,
    color: t.muted,
    fontWeight: 500,
    display: "block",
    marginBottom: 5,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: t.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 15,
              background: "linear-gradient(135deg,#5b8af0,#c084fc)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
            }}
          >
            🌿
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, color: t.text }}>
            MindTask
          </h1>
          <p style={{ color: t.muted, fontSize: 14 }}>
            Productivity meets wellness
          </p>
        </div>

        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 18,
            padding: 28,
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              background: t.inputBg,
              borderRadius: 10,
              padding: 4,
              marginBottom: 22,
            }}
          >
            {["login", "register"].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setErr("");
                  setF({ name: "", email: "", password: "" });
                }}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: 7,
                  background: mode === m ? t.accent : "transparent",
                  color: mode === m ? "#fff" : t.muted,
                }}
              >
                {m === "login" ? "Log In" : "Create Account"}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mode === "register" && (
              <div>
                <label style={lbl}>Full Name</label>
                <input
                  value={f.name}
                  onChange={(e) => upd("name", e.target.value)}
                  style={inp}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label style={lbl}>Email</label>
              <input
                type="email"
                value={f.email}
                onChange={(e) => upd("email", e.target.value)}
                placeholder="you@example.com"
                style={inp}
              />
            </div>

            {/* Password */}
            <div>
              <label style={lbl}>Password</label>
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  type={showPw ? "text" : "password"}
                  value={f.password}
                  onChange={(e) => upd("password", e.target.value)}
                  placeholder="••••••••"
                  style={{ ...inp, paddingRight: 42 }}
                />
                <button
                  onClick={() => setShowPw((v) => !v)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: t.muted,
                  }}
                >
                  <Ic n={showPw ? "eyeOff" : "eye"} size={15} />
                </button>
              </div>
            </div>
          </div>

          {err && (
            <div style={{ marginTop: 12, color: "#f87171" }}>{err}</div>
          )}

          {/* Main Button */}
          <button
            onClick={submit}
            disabled={loading}
            style={{
              width: "100%",
              marginTop: 18,
              padding: 12,
              borderRadius: 11,
              background: "linear-gradient(135deg,#5b8af0,#c084fc)",
              color: "#fff",
            }}
          >
            {loading
              ? "Please wait…"
              : mode === "login"
              ? "Log In"
              : "Create Account"}
          </button>

          {/* Switch */}
          <div style={{ textAlign: "center", marginTop: 14, fontSize: 13 }}>
            {mode === "login" ? (
              <>
                <span style={{ color: t.muted }}>
                  Don’t have an account?{" "}
                </span>
                <button
                  onClick={() => {
                    setMode("register");
                    setErr("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: t.accent,
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                <span style={{ color: t.muted }}>
                  Already have an account?{" "}
                </span>
                <button
                  onClick={() => {
                    setMode("login");
                    setErr("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: t.accent,
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  Log in
                </button>
              </>
            )}
          </div>

          {/* Demo */}
          <div style={{ marginTop: 20 }}>
            {demoUsers.map((u) => (
              <button key={u.id} onClick={() => quick(u)}>
                {u.avatar}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}