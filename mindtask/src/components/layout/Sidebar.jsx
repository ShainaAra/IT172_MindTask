  import { useTheme } from "../../context/useTheme";
  import Ic from "../common/Ic";

  export default function Sidebar({
    pages,
    activePage,
    setActivePage,
    onDelete,
    onChat,
    open,
    activeNav,
    setActiveNav,
  }) {
    const t = useTheme();

    if (!open) return null;

    const NAV = [
      ["🏠", "Home"],
      ["🔍", "Search"],
    ];

    return (
      <div
        style={{
          width: 245,
          minWidth: 245,
          height: "100vh",
          background: t.sidebar,
          borderRight: `1px solid ${t.border}`,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        {/* Workspace */}
        <div
          style={{
            height: 70,
            padding: "0 12px",
            borderBottom: `1px solid ${t.border}`,
            display: "flex",
            alignItems: "center",
            gap: 9,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "linear-gradient(135deg,#5b8af0,#c084fc)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            M
          </div>

          <div style={{ flex: 1, overflow: "hidden" }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: 13.5,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              MindTask
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ padding: "8px 8px 0" }}>
          {NAV.map(([ic, lb]) => (
            <div
              key={lb}
              className="sb-item"
              onClick={() => setActiveNav(lb)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 10px",
                fontSize: 13,
                cursor: "pointer",
                color: activeNav === lb ? t.accent : t.muted,
                background: activeNav === lb ? t.accentSoft : "transparent",
                borderRadius: 7,
                fontWeight: activeNav === lb ? 500 : 400,
                transition: "background 0.12s",
              }}
              onMouseEnter={(e) => {
                if (activeNav !== lb) {
                  e.currentTarget.style.background = t.dark ? "#1e1e1e" : "#eaeae8";
                }
              }}
              onMouseLeave={(e) => {
                if (activeNav !== lb) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <span>{ic}</span>
              {lb}
            </div>
          ))}
        </div>

        {/* Pages */}
        <div style={{ flex: 1, overflow: "auto", padding: "10px 8px 0" }}>
          <div
            style={{
              fontSize: 10.5,
              color: t.muted,
              padding: "0 10px 6px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Pages
          </div>

          {pages.map((pg) => (
            <div
              key={pg.id}
              className={`sb-item ${activePage?.id === pg.id ? "active" : ""}`}
              onClick={() => setActivePage(pg.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "5px 10px",
                fontSize: 13,
                color: activePage?.id === pg.id ? t.accent : t.text,
                marginBottom: 1,
              }}
            >
              {/* LEFT ICON */}
              <span style={{ fontSize: 14, flexShrink: 0 }}>
                {pg.icon}
              </span>

              {/* TITLE */}
              <span
                style={{
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {pg.title}
              </span>

              {/* ❌ DELETE BUTTON (HIDDEN FOR WELCOME PAGE) */}
              {activePage?.id === pg.id &&
                pages.length > 1 &&
                !pg.id.endsWith("-p1") && (
                  <button
                    className="btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(pg.id);
                    }}
                    style={{
                      color: t.muted,
                      padding: 2,
                      borderRadius: 4,
                      opacity: 0.5,
                      lineHeight: 0,
                    }}
                  >
                    <Ic n="trash" size={11} />
                  </button>
                )}
            </div>
          ))}
        </div>

        {/* MindEase Banner */}
        <div
          style={{
            margin: "12px 12px 14px",
            padding: "13px 14px",
            borderRadius: 12,
            background: t.dark
              ? "rgba(91,138,240,0.08)"
              : "rgba(91,138,240,0.05)",
            border: `1px solid ${
              t.dark ? "rgba(91,138,240,0.16)" : "rgba(91,138,240,0.12)"
            }`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              marginBottom: 5,
            }}
          >
            <span style={{ fontSize: 15 }}>🌿</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: t.accent }}>
              MindEase
            </span>
          </div>

          <p
            style={{
              fontSize: 11.5,
              color: t.muted,
              lineHeight: 1.5,
              marginBottom: 9,
            }}
          >
            Feeling overwhelmed? Your wellness companion is here.
          </p>

          <button
            className="btn tc"
            onClick={onChat}
            style={{
              fontSize: 12,
              background: t.accent,
              color: "#fff",
              padding: "6px 12px",
              borderRadius: 7,
              fontWeight: 500,
              width: "100%",
            }}
          >
            Open Chat 💬
          </button>
        </div>
      </div>
    );
  }