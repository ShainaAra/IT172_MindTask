/**
 * API Client Module
 * Description: Centralized API communication layer for all backend operations.
 * Base URL points to local backend server running on port 5000.
 * Handles authentication, notes CRUD, tasks CRUD, and chat functionality.
 * All functions include error handling and throw meaningful errors for UI consumption.
 */

const API_BASE = "http://localhost:5000/api";

// ━━━━━ AUTHENTICATION API ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Function: registerUser
 * Description: Registers a new user account
 * @param {string} name - User's full name
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} User data and JWT token
 * @throws {Error} If registration fails
 */
export async function registerUser(name, email, password) {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Registration failed");
    return data;
  } catch (error) {
    console.error("registerUser error:", error);
    throw error;
  }
}

/**
 * Function: loginUser
 * Description: Authenticates an existing user
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} User data and JWT token
 * @throws {Error} If login fails
 */
export async function loginUser(email, password) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
    return data;
  } catch (error) {
    console.error("loginUser error:", error);
    throw error;
  }
}

// ━━━━━ NOTES API ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Function: createNote
 * Description: Creates a new note for a user
 * @param {string} title - Note title
 * @param {string} content - Note content (markdown)
 * @param {string} type - Note type (welcome, notes-grid, tasks, note)
 * @param {string} userId - ID of the user owning the note
 * @param {string} icon - Emoji icon for the note
 * @returns {Promise<Object>} Created note object
 */
export async function createNote(title, content, type, userId, icon) {
  try {
    const res = await fetch(`${API_BASE}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, type, icon, userId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to create note");
    return data;
  } catch (error) {
    console.error("createNote error:", error);
    throw error;
  }
}

/**
 * Function: getNotes
 * Description: Fetches all notes for a specific user
 * @param {string} userId - ID of the user
 * @returns {Promise<Array>} Array of note objects
 */
export async function getNotes(userId) {
  try {
    const res = await fetch(`${API_BASE}/notes/${userId}`);
    if (!res.ok) throw new Error("Failed to fetch notes");
    return await res.json();
  } catch (error) {
    console.error("getNotes error:", error);
    throw error;
  }
}

/**
 * Function: updateNote
 * Description: Updates an existing note
 * @param {string} id - Note ID
 * @param {string} title - Updated title
 * @param {string} content - Updated content
 * @param {string} type - Updated type
 * @param {string} icon - Updated icon
 * @returns {Promise<Object>} Updated note object
 */
export async function updateNote(id, title, content, type, icon) {
  try {
    const res = await fetch(`${API_BASE}/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, type, icon }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update note");
    return data;
  } catch (error) {
    console.error("updateNote error:", error);
    throw error;
  }
}

/**
 * Function: deleteNote
 * Description: Deletes a note by ID
 * @param {string} id - Note ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export async function deleteNote(id) {
  try {
    const res = await fetch(`${API_BASE}/notes/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete note");
    return data;
  } catch (error) {
    console.error("deleteNote error:", error);
    throw error;
  }
}

// ━━━━━ TASKS API ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Function: createTask
 * Description: Creates a new task for a user
 * @param {string} title - Task title
 * @param {string} status - Task status (todo, in-progress, done)
 * @param {string} priority - Task priority (high, medium, low)
 * @param {string} userId - ID of the user owning the task
 * @param {string} tag - Task category tag (default: "Other")
 * @returns {Promise<Object>} Created task object
 */
export async function createTask(title, status, priority, userId, tag = "Other") {
  try {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, status, priority, tag, userId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to create task");
    return data;
  } catch (error) {
    console.error("createTask error:", error);
    throw error;
  }
}

/**
 * Function: getTasks
 * Description: Fetches all tasks for a specific user
 * @param {string} userId - ID of the user
 * @returns {Promise<Array>} Array of task objects
 */
export async function getTasks(userId) {
  try {
    const res = await fetch(`${API_BASE}/tasks/${userId}`);
    if (!res.ok) throw new Error("Failed to fetch tasks");
    return await res.json();
  } catch (error) {
    console.error("getTasks error:", error);
    throw error;
  }
}

/**
 * Function: updateTask
 * Description: Updates an existing task
 * @param {string} id - Task ID
 * @param {string} title - Updated title
 * @param {string} status - Updated status
 * @param {string} priority - Updated priority
 * @param {string} tag - Updated tag
 * @returns {Promise<Object>} Updated task object
 */
export async function updateTask(id, title, status, priority, tag) {
  try {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, status, priority, tag }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update task");
    return data;
  } catch (error) {
    console.error("updateTask error:", error);
    throw error;
  }
}

/**
 * Function: deleteTask
 * Description: Deletes a task by ID
 * @param {string} id - Task ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export async function deleteTask(id) {
  try {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete task");
    return data;
  } catch (error) {
    console.error("deleteTask error:", error);
    throw error;
  }
}

// ━━━━━ CHAT API ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Function: sendChatMessage
 * Description: Sends a message to the AI wellness companion and receives a response
 * @param {string} message - User's message to the AI
 * @param {string} userId - ID of the user (for context/personalization)
 * @returns {Promise<Object>} AI response object containing reply
 */
export async function sendChatMessage(message, userId) {
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, userId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to send message");
    return data;
  } catch (error) {
    console.error("sendChatMessage error:", error);
    throw error;
  }
}

/**
 * Function: getChatHistory
 * Description: Fetches complete chat history for a specific user
 * @param {string} userId - ID of the user
 * @returns {Promise<Array>} Array of chat message/response pairs
 */
export async function getChatHistory(userId) {
  try {
    const res = await fetch(`${API_BASE}/chats/${userId}`);
    if (!res.ok) throw new Error("Failed to fetch chat history");
    return await res.json();
  } catch (error) {
    console.error("getChatHistory error:", error);
    throw error;
  }
}