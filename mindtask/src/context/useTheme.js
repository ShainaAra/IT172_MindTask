import { useContext } from "react";
import { ThemeCtx } from "./ThemeCtx";

/**
 * Hook: useTheme
 * Description: Custom hook for accessing theme context throughout the app.
 * Provides a convenient way to consume ThemeCtx without directly importing useContext.
 * 
 * Usage: const t = useTheme(); // then use t.bg, t.text, t.accent, etc.
 * 
 * @returns {Object} Theme context value containing colors, dark mode state, and toggle function
 */
export const useTheme = () => useContext(ThemeCtx);
