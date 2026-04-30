import { createContext, useContext, useState } from "react";

const ThemeCtx = createContext();

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(true);
  const c = {
    dark, toggle: () => setDark(v => !v),
    bg:         dark ? "#0f0f0f" : "#ffffff",
    sidebar:    dark ? "#161616" : "#f7f7f5",
    surface:    dark ? "#1c1c1c" : "#ffffff",
    card:       dark ? "#1c1c1c" : "#fdfdfc",
    border:     dark ? "#2a2a2a" : "#e8e8e6",
    text:       dark ? "#e8e8e4" : "#1a1a1a",
    muted:      dark ? "#5e5e5e" : "#9b9b9b",
    hover:      dark ? "#202020" : "#f0f0ee",
    inputBg:    dark ? "#1a1a1a" : "#f5f5f3",
    chatBg:     dark ? "#141414" : "#fafaf9",
    userBubble: dark ? "#1d2d4a" : "#dbeafe",
    aiBubble:   dark ? "#1c1c1c" : "#f4f4f2",
    tagBg:      dark ? "#252525" : "#eeeeec",
    accent:     "#5b8af0",
    accentSoft: dark ? "rgba(91,138,240,0.12)" : "rgba(91,138,240,0.08)",
    green:      "#4ade80", yellow: "#fbbf24", red: "#f87171", purple: "#c084fc",
    shadow:     dark ? "0 2px 12px rgba(0,0,0,0.5)"  : "0 2px 12px rgba(0,0,0,0.08)",
    shadowLg:   dark ? "0 8px 40px rgba(0,0,0,0.45)" : "0 8px 40px rgba(0,0,0,0.12)",
  };
  return <ThemeCtx.Provider value={c}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
