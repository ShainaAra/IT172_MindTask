import { useState } from "react";
import { useAuth } from "../context/useAuth";
import { useTheme } from "../context/useTheme";

/**
 * Helper: basic email validation (same as in AuthContext)
 * Validates email format using regex pattern
 * 
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email format is valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Component: AuthPage
 * Description: Authentication page component handling both login and registration.
 * Features:
 * - Toggle between login and register modes
 * - Form validation with field-specific error messages
 * - Email format validation before API calls
 * - Demo users for quick testing
 * - Enter key submission support
 * - Loading state during API requests
 * 
 * @returns {JSX.Element} Authentication page with login/register forms
 */
export default function AuthPage() {
  // Destructure authentication functions and state from context
  const { login, register, err: globalErr, setErr, demoUsers } = useAuth();
  const t = useTheme(); // Theme context for styling

  // State for controlling login vs register mode
  const [mode, setMode] = useState("login");
  
  // State for form fields (name, email, password)
  const [f, setF] = useState({ name: "", email: "", password: "" });
  
  // State for loading indicator during API calls
  const [loading, setLoading] = useState(false);
  
  // State for field-specific error messages
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    password: "",
  });

  /**
   * Function: clearFieldErrors
   * Description: Resets all field-specific errors and global error
   */
  const clearFieldErrors = () => {
    setFieldErrors({ name: "", email: "", password: "" });
    setErr(""); // clear global error as well
  };

  /**
   * Function: upd
   * Description: Updates form field value and clears error for that specific field
   * Provides real-time error clearing as user types
   * 
   * @param {string} k - Field key ("name", "email", or "password")
   * @param {string} v - New value for the field
   */
  const upd = (k, v) => {
    setF((p) => ({ ...p, [k]: v }));
    // clear error for this field when user starts typing
    setFieldErrors((prev) => ({ ...prev, [k]: "" }));
    setErr("");
  };

  /**
   * Function: submit
   * Description: Handles form submission for both login and registration
   * Performs frontend validation before calling API
   * Maps backend errors to appropriate form fields
   */
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

    // 2. Call API based on current mode
    let success = false;
    if (mode === "login") {
      success = await login(f.email, f.password);
    } else {
      success = await register(f.name, f.email, f.password);
    }

    // 3. Handle API errors (global error from context)
    // Parse error message and map to appropriate form fields
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

  /**
   * Function: handleKeyPress
   * Description: Handles Enter key press for form submission
   * 
   * @param {Object} e - Keyboard event object
   */
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  /**
   * Function: quick
   * Description: Auto-fills and logs in with demo user credentials
   * 
   * @param {Object} u - Demo user object containing email and password
   */
  const quick = (u) => {
    setMode("login");
    setF({ name: "", email: u.email, password: u.password });
    clearFieldErrors();
    setTimeout(() => login(u.email, u.password), 20); // Slight delay to ensure state updates
  };

  // Reusable styles for form elements
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
        {/* Logo and Brand Section */}
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

        {/* Authentication Card */}
        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 18,
            padding: 28,
          }}
        >
          {/* Mode Tabs - Login / Register toggle */}
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

          {/* Form Fields */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
            onKeyPress={handleKeyPress}
          >
            {/* Name field - only shown in register mode */}
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

            {/* Email field - common to both modes */}
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

            {/* Password field - common to both modes */}
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

          {/* Global error display - only shown if no field-specific errors exist */}
          {globalErr && !fieldErrors.email && !fieldErrors.password && !fieldErrors.name && (
            <div style={{ marginTop: 12, color: "#f87171" }}>{globalErr}</div>
          )}

          {/* Submit Button */}
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

          {/* Switch Mode Link - Toggle between login and register */}
          <div style={{ textAlign: "center", marginTop: 14, fontSize: 13 }}>
            {mode === "login" ? (
              <>
                <span style={{ color: t.muted }}>Don't have an account? </span>
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

          {/* Demo Users Section - Quick login buttons for testing */}
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