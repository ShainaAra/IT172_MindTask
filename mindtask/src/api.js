const API_BASE = "http://localhost:5000/api";

// ━━━━━ AUTH ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

// ━━━━━ NOTES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

// ━━━━━ TASKS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function createTask(title, status, priority, userId) {
  try {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, status, priority, userId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to create task");
    return data;
  } catch (error) {
    console.error("createTask error:", error);
    throw error;
  }
}

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

export async function updateTask(id, title, status, priority) {
  try {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, status, priority }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update task");
    return data;
  } catch (error) {
    console.error("updateTask error:", error);
    throw error;
  }
}

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

// ━━━━━ CHAT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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