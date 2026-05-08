import { useContext } from "react";
import { AuthCtx } from "./AuthCtx";

/**
 * Hook: useAuth
 * Description: Custom hook for accessing authentication context throughout the app.
 * Provides a convenient way to consume AuthCtx without directly importing useContext.
 * 
 * Usage: const { user, login, logout, getData, setNotes, ... } = useAuth();
 * 
 * @returns {Object} Authentication context value containing user, functions, and state
 */
export const useAuth = () => useContext(AuthCtx);
