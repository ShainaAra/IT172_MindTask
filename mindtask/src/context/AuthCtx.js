import { createContext } from "react";

/**
 * Context: AuthCtx
 * Description: React Context object for authentication state management.
 * Provides access to user data, login/logout functions, notes/tasks CRUD operations,
 * chat history, and other authentication-related functionality throughout the app.
 * 
 * Consumed by: useAuth() hook
 */
export const AuthCtx = createContext();
