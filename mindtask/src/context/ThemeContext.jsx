import { useState } from "react";
import { ThemeCtx } from "./ThemeCtx";

/**
 * Component: ThemeProvider
 * Description: Provides theme context to the entire application with dark/light mode support.
 * Manages theme state (dark mode default = true) and provides comprehensive color palette
 * for consistent styling across all components.
 * 
 * Color categories provided:
 * - Backgrounds: bg, sidebar, surface, card, inputBg, chatBg
 * - Text: text, muted
 * - Borders: border
 * - Interactive elements: hover, userBubble, aiBubble, tagBg
 * - Accent colors: accent, accentSoft, green, yellow, red, purple
 * - Effects: shadow, shadowLg
 * 
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Child components that will consume theme context
 * 
 * @returns {JSX.Element} Theme context provider
 */
export function ThemeProvider({ children }) {
  // State for dark mode (default: true = dark mode enabled)
  const [dark, setDark] = useState(true);
  
  // Theme object containing all color definitions and utility functions
  const c = {
    dark, 
    toggle: () => setDark(v => !v),  // Function to toggle between light/dark mode
    
    // Background colors
    bg:         dark ? "#0f0f0f" : "#ffffff",      // Main app background
    sidebar:    dark ? "#161616" : "#f7f7f5",       // Sidebar background
    surface:    dark ? "#1c1c1c" : "#ffffff",       // Modal/surface background
    card:       dark ? "#1c1c1c" : "#fdfdfc",       // Card component background
    border:     dark ? "#2a2a2a" : "#e8e8e6",       // Border color for separators
    text:       dark ? "#e8e8e4" : "#1a1a1a",       // Primary text color
    muted:      dark ? "#5e5e5e" : "#9b9b9b",       // Secondary/subtle text color
    hover:      dark ? "#202020" : "#f0f0ee",       // Hover state background
    inputBg:    dark ? "#1a1a1a" : "#f5f5f3",       // Input field background
    chatBg:     dark ? "#141414" : "#fafaf9",       // Chat panel background
    userBubble: dark ? "#1d2d4a" : "#dbeafe",       // User message bubble color
    aiBubble:   dark ? "#1c1c1c" : "#f4f4f2",       // AI assistant message bubble color
    tagBg:      dark ? "#252525" : "#eeeeec",       // Tag/label background
    
    // Accent and semantic colors (consistent across both themes)
    accent:     "#5b8af0",                           // Primary accent color (blue)
    accentSoft: dark ? "rgba(91,138,240,0.12)" : "rgba(91,138,240,0.08)", // Subtle accent background
    green:      "#4ade80",                          // Success/positive indicator
    yellow:     "#fbbf24",                          // Warning/in-progress indicator
    red:        "#f87171",                          // Error/destructive action
    purple:     "#c084fc",                          // Secondary/creative accent
    
    // Shadow effects
    shadow:     dark ? "0 2px 12px rgba(0,0,0,0.5)"  : "0 2px 12px rgba(0,0,0,0.08)",   // Standard shadow
    shadowLg:   dark ? "0 8px 40px rgba(0,0,0,0.45)" : "0 8px 40px rgba(0,0,0,0.12)",   // Large shadow for modals
  };
  
  return <ThemeCtx.Provider value={c}>{children}</ThemeCtx.Provider>;
}