import { useRef, useState, useEffect } from "react";
import { DEMO_USERS, makeUserData, DEFAULT_NOTES, DEFAULT_TASKS } from "../data/defaults";
import { AuthCtx } from "./AuthCtx";
import { registerUser as registerUserAPI, loginUser as loginUserAPI, getNotes, getTasks, createNote, updateNote, deleteNote, createTask, updateTask, deleteTask, getChatHistory } from "../api";

/**
 * Helper: Basic email validation using regex
 * Validates email format to ensure it contains @ and valid domain structure
 * 
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email format is valid, false otherwise
 */
const isValidEmail = (email) => {
  // Simple but robust regex for most common email patterns
  const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Component: AuthProvider
 * Description: Authentication and state management provider for the entire application.
 * Manages user authentication (login/register/logout), persistent storage of notes and tasks,
 * chat history for MindEase wellness companion, and synchronization with backend API.
 * 
 * Features:
 * - User registration and login with backend API
 * - Email validation before API calls
 * - JWT token storage in localStorage
 * - Notes and tasks CRUD operations with backend sync
 * - Chat history management for wellness AI
 * - User avatar generation (initials and color)
 * - Automatic creation of default notes for new users
 * 
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Child components that will have access to auth context
 * 
 * @returns {JSX.Element} Auth context provider wrapping children components
 */
export function AuthProvider({ children }) {
  // State for current authenticated user object
  const [user, setUser] = useState(null);
  
  // State for storing error messages from auth operations
  const [err, setErr] = useState("");
  
  // State for storing user data (notes, tasks) keyed by user ID
  const [store, setStore] = useState({});
  
  // State for tracking loading status of auth operations
  const [loading, setLoading] = useState(false);
  
  // State for storing chat message history for the current user
  const [chatHistory, setChatHistory] = useState([]);
  
  // State for tracking loading status of chat history
  const [chatLoading, setChatLoading] = useState(false);
  
  // State for triggering chat history refresh when version changes
  const [chatVersion, setChatVersion] = useState(0);

  /**
   * Function: bumpChatVersion
   * Description: Increments chat version to trigger re-fetch of chat history
   * Used when new messages are added externally
   */
  const bumpChatVersion = () => setChatVersion((v) => v + 1);

  /**
   * Function: formatChatHistory
   * Description: Transforms raw chat history from API into format expected by UI
   * Flattens message-response pairs into individual message objects
   * 
   * @param {Array} history - Raw chat history from API containing message/response pairs
   * @returns {Array} Formatted array of message objects with role and text properties
   */
  const formatChatHistory = (history = []) =>
    history.flatMap((chat) => {
      const messageText = chat.message?.trim();
      const assistantEntry = { role: "assistant", text: chat.response };

      if (!messageText) {
        return [assistantEntry];
      }

      return [
        { role: "user", text: messageText },
        assistantEntry,
      ];
    });

  /**
   * Function: createWelcomeChat
   * Description: Creates the initial welcome message for a new chat session
   * Personalizes the message with the user's first name
   * 
   * @returns {Array} Array containing the welcome message object
   */
  const createWelcomeChat = () => [
    {
      role: "assistant",
      text: `Hey ${user?.name?.split(" ")[0] || "there"}! 🌿 I'm MindEase, your wellness companion. How are you feeling today? Whether you're stressed, overwhelmed, or just need to talk — I'm here.`,
    },
  ];

  /**
   * Function: loadChatHistory
   * Description: Loads chat history from backend API for a specific user
   * Falls back to welcome message if no history exists or on error
   * 
   * @param {string} userId - ID of the user whose chat history to load
   * @returns {Promise<Array>} Resolves to formatted chat history array
   */
  const loadChatHistory = async (userId) => {
    if (!userId) return createWelcomeChat();
    setChatLoading(true);
    try {
      const history = await getChatHistory(userId);
      const formatted = formatChatHistory(history);
      const messages = formatted.length > 0 ? formatted : createWelcomeChat();
      setChatHistory(messages);
      return messages;
    } catch (error) {
      console.error("Error loading chat history:", error);
      const messages = createWelcomeChat();
      setChatHistory(messages);
      return messages;
    } finally {
      setChatLoading(false);
    }
  };

  /**
   * Function: refreshChatHistory
   * Description: Manually refreshes chat history for the current user
   * Useful after adding new messages to ensure UI is up to date
   * 
   * @returns {Promise<Array>} Resolves to refreshed chat history
   */
  const refreshChatHistory = async () => {
    if (!user?.id) return [];
    return await loadChatHistory(user.id);
  };

  /**
   * Function: appendChatMessage
   * Description: Appends a new message to the local chat history state
   * Used for optimistic UI updates before backend sync
   * 
   * @param {Object} message - Message object with role and text properties
   */
  const appendChatMessage = (message) => {
    setChatHistory((prev) => [...prev, message]);
  };

  /**
   * Function: getUserInitials
   * Description: Generates user initials from their full name
   * Example: "Jenella Yvonne" → "JY", "John" → "JO"
   * 
   * @returns {string} Uppercase initials (2 characters)
   */
  const getUserInitials = () => {
    if (!user || !user.name) return "?";
    
    const name = user.name.trim();
    const parts = name.split(" ");
    
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    
    const firstInitial = parts[0].charAt(0);
    const lastInitial = parts[parts.length - 1].charAt(0);
    return (firstInitial + lastInitial).toUpperCase();
  };

  /**
   * Function: getUserColor
   * Description: Generates a consistent avatar color based on user's name length
   * Provides deterministic color selection for user avatars
   * 
   * @returns {string} Hex color code from predefined palette
   */
  const getUserColor = () => {
    if (!user || !user.name) return "#5b8af0";
    
    const colors = ["#5b8af0", "#c084fc", "#34d399", "#f472b6", "#fbbf24", "#fb923c", "#a78bfa"];
    const index = user.name.length % colors.length;
    return colors[index];
  };

  /**
   * Effect: Load chat history when user ID changes
   * Clears chat history when user logs out, loads new history when user logs in
   */
  useEffect(() => {
    if (!user?.id) {
      setChatHistory([]);
      return;
    }
    loadChatHistory(user.id);
  }, [user?.id]);

  /**
   * Function: fetchUserData
   * Description: Fetches notes and tasks for a user from the backend API
   * Automatically creates default notes for new users who don't have them
   * 
   * @param {string} userId - ID of the user whose data to fetch
   */
  const fetchUserData = async (userId) => {
    try {
      const [notes, tasks] = await Promise.all([
        getNotes(userId),
        getTasks(userId),
      ]);

      let safeNotes = notes || [];

      // Check for missing default notes and create them if needed
      const missingDefaults = DEFAULT_NOTES.filter((defaultNote) =>
        !safeNotes.some(
          (note) =>
            note.type === defaultNote.type ||
            note.title === defaultNote.title
        )
      );

      if (missingDefaults.length > 0) {
        const createdDefaults = await Promise.all(
          missingDefaults.map((defaultNote) =>
            createNote(
              defaultNote.title,
              defaultNote.content,
              defaultNote.type,
              userId,
              defaultNote.icon
            )
          )
        );

        safeNotes = [...safeNotes, ...createdDefaults];
      }

      const safeTasks = tasks && tasks.length > 0 ? tasks : [];

      // Ensure each note has an icon (use default if missing)
      safeNotes = safeNotes.map((note) => {
        const defaultNote = DEFAULT_NOTES.find(
          (defaultNote) =>
            note.type === defaultNote.type || note.title === defaultNote.title
        );

        return {
          ...note,
          icon: note.icon || defaultNote?.icon || "📄",
        };
      });

      setStore((prev) => ({
        ...prev,
        [userId]: {
          notes: safeNotes,
          tasks: safeTasks,
        },
      }));
    } catch (error) {
      console.error("Error fetching user data:", error);

      // Fallback to local demo data on error
      setStore((prev) => ({
        ...prev,
        [userId]: makeUserData(userId),
      }));
    }
  };

  /**
   * Function: register
   * Description: Registers a new user with the backend API
   * Includes email validation before API call
   * Creates default notes for the new user
   * 
   * @param {string} name - User's full name
   * @param {string} email - User's email address (validated)
   * @param {string} pw - User's password
   * @returns {Promise<boolean>} True if registration successful, false otherwise
   */
  const register = async (name, email, pw) => {
    // Validate email before any API call
    if (!isValidEmail(email)) {
      setErr("Please enter a valid email address (e.g., name@example.com)");
      return false;
    }

    try {
      setLoading(true);
      setErr("");
      const response = await registerUserAPI(name, email, pw);
      const userData = response.user;
      
      // Store JWT token in localStorage for persistent auth
      if (response.token) {
        localStorage.setItem("mindtask_token", response.token);
      }
      localStorage.setItem("mindtask_user", JSON.stringify(userData));
      
      setUser(userData);

      // Create default notes for the new user
      await Promise.all(
        DEFAULT_NOTES.map((defaultNote) =>
          createNote(
            defaultNote.title,
            defaultNote.content,
            defaultNote.type,
            userData.id,
            defaultNote.icon
          )
        )
      );
      
      await fetchUserData(userData.id);
      
      return true;
    } catch (error) {
      setErr(error.message || "Registration failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Function: login
   * Description: Authenticates an existing user with the backend API
   * Includes email validation before API call
   * 
   * @param {string} email - User's email address (validated)
   * @param {string} pw - User's password
   * @returns {Promise<boolean>} True if login successful, false otherwise
   */
  const login = async (email, pw) => {
    // Validate email before any API call
    if (!isValidEmail(email)) {
      setErr("Please enter a valid email address (e.g., name@example.com)");
      return false;
    }

    try {
      setLoading(true);
      setErr("");
      const response = await loginUserAPI(email, pw);
      const userData = response.user;
      
      // Store JWT token in localStorage for persistent auth
      if (response.token) {
        localStorage.setItem("mindtask_token", response.token);
      }
      localStorage.setItem("mindtask_user", JSON.stringify(userData));
      
      setUser(userData);
      await fetchUserData(userData.id);
      
      return true;
    } catch (error) {
      setErr(error.message || "Login failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Function: logout
   * Description: Logs out the current user and clears stored authentication data
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem("mindtask_user");
    localStorage.removeItem("mindtask_token");
  };

  /**
   * Function: getData
   * Description: Retrieves notes and tasks for the current authenticated user
   * 
   * @returns {Object|null} User data object containing notes and tasks, null if no user logged in
   */
  const getData = () => user ? store[user.id] : null;

  /**
   * Function: setNotes
   * Description: Updates notes in local state and syncs changes with backend API
   * Handles create, update, and delete operations intelligently
   * 
   * @param {Function|Array} fn - Either an updater function or new notes array
   */
  const setNotes = async (fn) => {
    if (!user) return;
    
    const currentNotes = store[user.id]?.notes || [];
    const newNotes = typeof fn === "function" ? fn(currentNotes) : fn;
    
    // Optimistic update - update UI immediately
    setStore(p => ({
      ...p,
      [user.id]: { ...p[user.id], notes: newNotes }
    }));

    // Sync with backend
    try {
      // Loop through all new notes to create or update
      for (const note of newNotes) {
        const existingNote = currentNotes.find(n => n.id === note.id);
        
        if (!existingNote) {
          // New note - create in backend
          console.log("Creating new note:", note.title);
          await createNote(note.title, note.content, note.type, user.id, note.icon);
        } else {
          // Existing note - check if anything changed
          const titleChanged = existingNote.title !== note.title;
          const contentChanged = existingNote.content !== note.content;
          const typeChanged = existingNote.type !== note.type;
          const iconChanged = existingNote.icon !== note.icon;
          
          if (titleChanged || contentChanged || typeChanged || iconChanged) {
            console.log(`Updating note ${note.id}:`, {
              title: `${existingNote.title} → ${note.title}`,
              type: `${existingNote.type} → ${note.type}`,
              icon: `${existingNote.icon} → ${note.icon}`,
            });
            await updateNote(note.id, note.title, note.content, note.type, note.icon);
          }
        }
      }

      // Delete notes that were removed
      for (const oldNote of currentNotes) {
        const stillExists = newNotes.some(n => n.id === oldNote.id);
        if (!stillExists) {
          console.log("Deleting note:", oldNote.title);
          await deleteNote(oldNote.id);
        }
      }
    } catch (error) {
      console.error("Error syncing notes:", error);
    }
  };

  /**
   * Function: setTasks
   * Description: Updates tasks in local state and syncs changes with backend API
   * Handles create, update, and delete operations intelligently
   * Replaces temporary client-side IDs with real MongoDB IDs after creation
   * 
   * @param {Function|Array} fn - Either an updater function or new tasks array
   */
  const setTasks = async (fn) => {
    if (!user) return;
    
    const currentTasks = store[user.id]?.tasks || [];
    const newTasks = typeof fn === "function" ? fn(currentTasks) : fn;
    
    // Optimistic update - update UI immediately
    setStore(p => ({
      ...p,
      [user.id]: { ...p[user.id], tasks: newTasks }
    }));

    // Sync with backend
    try {
      const updatedTasks = [...newTasks];
      
      // Loop through all new tasks to create or update
      for (let i = 0; i < updatedTasks.length; i++) {
        const task = updatedTasks[i];
        const existingTask = currentTasks.find(t => t.id === task.id);
        
        if (!existingTask) {
          // New task - create in backend
          console.log("Creating new task:", task.title);
          const createdTask = await createTask(task.title, task.status, task.priority, user.id, task.tag);
          // Replace temp ID with real MongoDB ID from backend
          updatedTasks[i] = createdTask;
        } else {
          // Existing task - check if anything changed
          const titleChanged = existingTask.title !== task.title;
          const statusChanged = existingTask.status !== task.status;
          const priorityChanged = existingTask.priority !== task.priority;
          const tagChanged = existingTask.tag !== task.tag;
          
          if (titleChanged || statusChanged || priorityChanged || tagChanged) {
            console.log(`Updating task ${task.id}:`, {
              title: `${existingTask.title} → ${task.title}`,
              status: `${existingTask.status} → ${task.status}`,
              priority: `${existingTask.priority} → ${task.priority}`,
              tag: `${existingTask.tag} → ${task.tag}`
            });
            await updateTask(task.id, task.title, task.status, task.priority, task.tag);
          }
        }
      }

      // Update store with tasks that have real MongoDB IDs
      setStore(p => ({
        ...p,
        [user.id]: { ...p[user.id], tasks: updatedTasks }
      }));

      // Delete tasks that were removed
      for (const oldTask of currentTasks) {
        const stillExists = updatedTasks.some(t => t.id === oldTask.id);
        if (!stillExists) {
          console.log("Deleting task:", oldTask.title);
          await deleteTask(oldTask.id);
        }
      }
    } catch (error) {
      console.error("Error syncing tasks:", error);
    }
  };

  // Provide authentication context to all child components
  return (
    <AuthCtx.Provider value={{ 
      user,           // Current authenticated user object
      login,          // Login function
      register,       // Registration function
      logout,         // Logout function
      err,            // Error message state
      setErr,         // Set error message
      getData,        // Get user's notes and tasks
      setNotes,       // Update notes with backend sync
      setTasks,       // Update tasks with backend sync
      demoUsers: DEMO_USERS,  // Demo users for testing
      loading,        // Loading state for auth operations
      chatHistory,    // Chat message history
      chatLoading,    // Chat loading state
      refreshChatHistory, // Manual chat refresh function
      appendChatMessage,  // Add message to chat
      getUserInitials,    // Generate user initials for avatar
      getUserColor,       // Generate user color for avatar
      chatVersion,        // Chat version counter for refresh triggers
      bumpChatVersion,    // Increment chat version
    }}>
      {children}
    </AuthCtx.Provider>
  );
}