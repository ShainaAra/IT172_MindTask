import { useState } from "react";
import { useAuth } from "../context/useAuth";
import { useTheme } from "../context/useTheme";

// Helper: basic email validation (same as in AuthContext)
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export default function AuthPage() {
  const { login, register, err: globalErr, setErr, demoUsers } = useAuth();
  const t = useTheme();

  const [mode, setMode] = useState("login");
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  
  // Field‑specific errors
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    password: "",
  });

  const clearFieldErrors = () => {
    setFieldErrors({ name: "", email: "", password: "" });
    setErr(""); // clear global error as well
  };

  const upd = (k, v) => {
    setF((p) => ({ ...p, [k]: v }));
    // clear error for this field when user starts typing
    setFieldErrors((prev) => ({ ...prev, [k]: "" }));
    setErr("");
  };

  const submit = async () => {
    setLoading(true);
    clearFieldErrors();

    // 1. Frontend validations
    if (mode === "register" && !f.name.trim()) {
      setFieldErrors((prev) => ({ ...prev, name: "Please enter your name." }));
      setLoading(false);
      return;
    }

    if (!isValidEmail(f.email)) {
      setFieldErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email address (e.g., name@example.com)",
      }));
      setLoading(false);
      return;
    }

    if (!f.password.trim()) {
      setFieldErrors((prev) => ({ ...prev, password: "Password is required." }));
      setLoading(false);
      return;
    }

    // 2. Call API
    let success = false;
    if (mode === "login") {
      success = await login(f.email, f.password);
    } else {
      success = await register(f.name, f.email, f.password);
    }

    // 3. Handle API errors (global error from context)
    if (!success && globalErr) {
      const errMsg = globalErr.toLowerCase();
      if (errMsg.includes("email") && errMsg.includes("password")) {
        setFieldErrors((prev) => ({
          ...prev,
          email: "Email is required or invalid",
          password: "Password is required",
        }));
      } else if (errMsg.includes("email")) {
        setFieldErrors((prev) => ({ ...prev, email: globalErr }));
      } else if (errMsg.includes("password")) {
        setFieldErrors((prev) => ({ ...prev, password: globalErr }));
      } else {
        // fallback: show generic error under the submit button
        setErr(globalErr);
      }
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  const quick = (u) => {
    setMode("login");
    setF({ name: "", email: u.email, password: u.password });
    clearFieldErrors();
    setTimeout(() => login(u.email, u.password), 20);
  };

  // Reusable styles
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

  const errorStyle = {
    fontSize: 12,
    color: "#f87171",
    marginTop: 4,
    marginLeft: 4,
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
                  setF({ name: "", email: "", password: "" });
                  clearFieldErrors();
                }}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: 7,
                  background: mode === m ? t.accent : "transparent",
                  color: mode === m ? "#fff" : t.muted,
                  cursor: "pointer",
                  border: "none",
                }}
              >
                {m === "login" ? "Log In" : "Create Account"}
              </button>
            ))}
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
            onKeyPress={handleKeyPress}
          >
            {mode === "register" && (
              <div>
                <label style={lbl}>Full Name</label>
                <input
                  value={f.name}
                  onChange={(e) => upd("name", e.target.value)}
                  style={inp}
                />
                {fieldErrors.name && (
                  <div style={errorStyle}>{fieldErrors.name}</div>
                )}
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
              {fieldErrors.email && (
                <div style={errorStyle}>{fieldErrors.email}</div>
              )}
            </div>

            {/* Password */}
            <div>
              <label style={lbl}>Password</label>
              <input
                type="password"
                value={f.password}
                onChange={(e) => upd("password", e.target.value)}
                placeholder="••••••••"
                style={inp}
              />
              {fieldErrors.password && (
                <div style={errorStyle}>{fieldErrors.password}</div>
              )}
            </div>
          </div>

          {/* Global error (if any) */}
          {globalErr && !fieldErrors.email && !fieldErrors.password && !fieldErrors.name && (
            <div style={{ marginTop: 12, color: "#f87171" }}>{globalErr}</div>
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
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? "Please wait…"
              : mode === "login"
              ? "Log In"
              : "Create Account"}
          </button>

          {/* Switch mode link */}
          <div style={{ textAlign: "center", marginTop: 14, fontSize: 13 }}>
            {mode === "login" ? (
              <>
                <span style={{ color: t.muted }}>Don’t have an account? </span>
                <button
                  onClick={() => {
                    setMode("register");
                    setF({ name: "", email: "", password: "" });
                    clearFieldErrors();
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
                <span style={{ color: t.muted }}>Already have an account? </span>
                <button
                  onClick={() => {
                    setMode("login");
                    setF({ name: "", email: "", password: "" });
                    clearFieldErrors();
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

          {/* Demo users */}
          <div style={{ marginTop: 20, display: "flex", gap: 8, justifyContent: "center" }}>
            {demoUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => quick(u)}
                style={{
                  background: t.inputBg,
                  border: `1px solid ${t.border}`,
                  borderRadius: 30,
                  width: 40,
                  height: 40,
                  fontSize: 20,
                  cursor: "pointer",
                }}
              >
                {u.avatar}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}