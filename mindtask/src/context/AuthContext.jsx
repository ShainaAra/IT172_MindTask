import { useRef, useState, useEffect } from "react";
import { DEMO_USERS, makeUserData, DEFAULT_NOTES, DEFAULT_TASKS } from "../data/defaults";
import { AuthCtx } from "./AuthCtx";
import { registerUser as registerUserAPI, loginUser as loginUserAPI, getNotes, getTasks, createNote, updateNote, deleteNote, createTask, updateTask, deleteTask } from "../api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [err, setErr] = useState("");
  const [store, setStore] = useState({});
  const [loading, setLoading] = useState(false);

  // Get user initials from name (e.g., "Jenella Yvonne" -> "JY")
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

  // Generate consistent color based on user name
  const getUserColor = () => {
    if (!user || !user.name) return "#5b8af0";
    
    const colors = ["#5b8af0", "#c084fc", "#34d399", "#f472b6", "#fbbf24", "#fb923c", "#a78bfa"];
    const index = user.name.length % colors.length;
    return colors[index];
  };

  // Fetch user data from backend
  const fetchUserData = async (userId) => {
    try {
      const [notes, tasks] = await Promise.all([
        getNotes(userId),
        getTasks(userId),
      ]);

      let safeNotes = notes || [];

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

      setStore((prev) => ({
        ...prev,
        [userId]: makeUserData(userId),
      }));
    }
  };

  // Register with backend
  const register = async (name, email, pw) => {
    try {
      setLoading(true);
      setErr("");
      const response = await registerUserAPI(name, email, pw);
      const userData = response.user;
      
      if (response.token) {
        localStorage.setItem("mindtask_token", response.token);
      }
      localStorage.setItem("mindtask_user", JSON.stringify(userData));
      
      setUser(userData);

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

  // Login with backend
  const login = async (email, pw) => {
    try {
      setLoading(true);
      setErr("");
      const response = await loginUserAPI(email, pw);
      const userData = response.user;
      
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

  const logout = () => {
    setUser(null);
    localStorage.removeItem("mindtask_user");
    localStorage.removeItem("mindtask_token");
  };

  const getData = () => user ? store[user.id] : null;

  // Update notes in backend
  const setNotes = async (fn) => {
    if (!user) return;
    
    const currentNotes = store[user.id]?.notes || [];
    const newNotes = typeof fn === "function" ? fn(currentNotes) : fn;
    
    setStore(p => ({
      ...p,
      [user.id]: { ...p[user.id], notes: newNotes }
    }));

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

  // Update tasks in backend
  const setTasks = async (fn) => {
    if (!user) return;
    
    const currentTasks = store[user.id]?.tasks || [];
    const newTasks = typeof fn === "function" ? fn(currentTasks) : fn;
    
    // Update local store first for instant UI update
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
          const createdTask = await createTask(task.title, task.status, task.priority, user.id);
          // Replace temp ID with real MongoDB ID
          updatedTasks[i] = createdTask;
        } else {
          // Existing task - check if anything changed
          const titleChanged = existingTask.title !== task.title;
          const statusChanged = existingTask.status !== task.status;
          const priorityChanged = existingTask.priority !== task.priority;
          
          if (titleChanged || statusChanged || priorityChanged) {
            console.log(`Updating task ${task.id}:`, {
              title: `${existingTask.title} → ${task.title}`,
              status: `${existingTask.status} → ${task.status}`,
              priority: `${existingTask.priority} → ${task.priority}`
            });
            await updateTask(task.id, task.title, task.status, task.priority);
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

  return (
    <AuthCtx.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      err, 
      setErr, 
      getData, 
      setNotes, 
      setTasks, 
      demoUsers: DEMO_USERS,
      loading,
      getUserInitials,
      getUserColor
    }}>
      {children}
    </AuthCtx.Provider>
  );
} 