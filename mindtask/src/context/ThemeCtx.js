import { createContext } from "react";

/**
 * Context: ThemeCtx
 * Description: React Context object for theme state management.
 * Provides dark/light mode state and all color variables for consistent styling.
 * 
 * Consumed by: useTheme() hook
 */
export const ThemeCtx = createContext();