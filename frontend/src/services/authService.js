/**
 * Servicio de autenticación
 * Gestiona login, registro y tokens JWT
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

// Almacenar token en localStorage
export const setToken = (token) => {
  localStorage.setItem("token", token);
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const removeToken = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// Almacenar información de usuario
export const setUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

/**
 * Registrar nuevo usuario
 */
export const register = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Error al registrarse");
  }

  const data = await response.json();

  // Guardar token y usuario
  setToken(data.access_token);
  setUser(data.user);

  return data;
};

/**
 * Iniciar sesión
 */
export const login = async (credentials) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Error al iniciar sesión");
  }

  const data = await response.json();

  // Guardar token y usuario
  setToken(data.access_token);
  setUser(data.user);

  return data;
};

/**
 * Cerrar sesión
 */
export const logout = async () => {
  const token = getToken();
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (e) {
    // Ignorar errores de red para logout
  }
  removeToken();
};

/**
 * Obtener información del usuario actual
 */
export const getCurrentUser = async () => {
  const token = getToken();

  if (!token) {
    throw new Error("No hay sesión activa");
  }

  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      removeToken();
      throw new Error("Sesión expirada");
    }
    throw new Error("Error al obtener usuario");
  }

  const user = await response.json();
  setUser(user);

  return user;
};

/**
 * Renovar token JWT
 */
export const refreshToken = async () => {
  const token = getToken();

  if (!token) {
    throw new Error("No hay sesión activa");
  }

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    removeToken();
    throw new Error("Error al renovar sesión");
  }

  const data = await response.json();

  setToken(data.access_token);
  setUser(data.user);

  return data;
};

/**
 * Verificar si hay sesión activa
 */
export const isAuthenticated = () => {
  return !!getToken();
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  refreshToken,
  isAuthenticated,
  getToken,
  getUser,
};

export default authService;
