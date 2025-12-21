/**
 * Servicio para gestión de proyectos (RF5)
 * Incluye CRUD, exportar/importar, versionado, compartir y galería
 */

import { getToken } from "./authService";

const API_URL = import.meta.env.VITE_API_URL || "http://3.228.25.217/api/v1";

/**
 * Helper para hacer peticiones autenticadas
 */
const fetchWithAuth = async (url, options = {}) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Error en la petición");
  }

  // Manejar respuestas 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
};

// ============================================================================
// RF5.1 - CRUD DE PROYECTOS
// ============================================================================

/**
 * Crear nuevo proyecto
 */
export const createProject = async (projectData) => {
  return fetchWithAuth(`${API_URL}/projects/`, {
    method: "POST",
    body: JSON.stringify(projectData),
  });
};

/**
 * Obtener todos mis proyectos
 */
export const getMyProjects = async (skip = 0, limit = 20) => {
  return fetchWithAuth(`${API_URL}/projects/?skip=${skip}&limit=${limit}`);
};

/**
 * Obtener proyecto por ID
 */
export const getProject = async (projectId) => {
  return fetchWithAuth(`${API_URL}/projects/${projectId}`);
};

/**
 * Actualizar proyecto
 */
export const updateProject = async (projectId, projectData) => {
  return fetchWithAuth(`${API_URL}/projects/${projectId}`, {
    method: "PUT",
    body: JSON.stringify(projectData),
  });
};

/**
 * Eliminar proyecto
 */
export const deleteProject = async (projectId) => {
  return fetchWithAuth(`${API_URL}/projects/${projectId}`, {
    method: "DELETE",
  });
};

// ============================================================================
// RF5.1 - EXPORTAR / IMPORTAR
// ============================================================================

/**
 * Exportar proyecto a JSON
 */
export const exportProject = async (projectId, includeVersions = true) => {
  const data = await fetchWithAuth(
    `${API_URL}/projects/${projectId}/export?include_versions=${includeVersions}`
  );

  // Crear y descargar archivo JSON
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${data.title.replace(/\s+/g, "_")}_${
    new Date().toISOString().split("T")[0]
  }.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);

  return data;
};

/**
 * Importar proyecto desde JSON
 */
export const importProject = async (projectData) => {
  return fetchWithAuth(`${API_URL}/projects/import`, {
    method: "POST",
    body: JSON.stringify(projectData),
  });
};

// ============================================================================
// RF5.1 - VERSIONADO
// ============================================================================

/**
 * Crear nueva versión
 */
export const createVersion = async (projectId, versionData) => {
  return fetchWithAuth(`${API_URL}/projects/${projectId}/versions`, {
    method: "POST",
    body: JSON.stringify(versionData),
  });
};

/**
 * Obtener versiones de un proyecto
 */
export const getVersions = async (projectId) => {
  return fetchWithAuth(`${API_URL}/projects/${projectId}/versions`);
};

/**
 * Hacer fork (clonar) un proyecto
 */
export const forkProject = async (projectId) => {
  return fetchWithAuth(`${API_URL}/projects/${projectId}/fork`, {
    method: "POST",
  });
};

// ============================================================================
// RF5.2 - COMPARTIR
// ============================================================================

/**
 * Generar enlace para compartir
 */
export const createShareLink = async (projectId, shareData) => {
  return fetchWithAuth(`${API_URL}/projects/${projectId}/share`, {
    method: "POST",
    body: JSON.stringify(shareData),
  });
};

/**
 * Obtener proyecto compartido (público, sin autenticación)
 */
export const getSharedProject = async (shareToken) => {
  const response = await fetch(`${API_URL}/projects/shared/${shareToken}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Error al obtener proyecto compartido");
  }

  return response.json();
};

/**
 * Revocar enlace compartido
 */
export const revokeShareLink = async (projectId) => {
  return fetchWithAuth(`${API_URL}/projects/${projectId}/share`, {
    method: "DELETE",
  });
};

// ============================================================================
// RF5.3 - GALERÍA COMUNITARIA
// ============================================================================

/**
 * Obtener proyectos públicos con filtros
 */
export const getPublicProjects = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.agent_type) params.append("agent_type", filters.agent_type);
  if (filters.difficulty_level)
    params.append("difficulty_level", filters.difficulty_level);
  if (filters.sort_by) params.append("sort_by", filters.sort_by);
  params.append("skip", filters.skip || 0);
  params.append("limit", filters.limit || 20);

  const response = await fetch(`${API_URL}/projects/public/gallery?${params}`);

  if (!response.ok) {
    throw new Error("Error al obtener proyectos públicos");
  }

  return response.json();
};

/**
 * Obtener detalle de proyecto público
 */
export const getPublicProject = async (projectId) => {
  const response = await fetch(`${API_URL}/projects/public/${projectId}`);

  if (!response.ok) {
    throw new Error("Error al obtener proyecto público");
  }

  return response.json();
};

const projectService = {
  // CRUD
  createProject,
  getMyProjects,
  getProject,
  updateProject,
  deleteProject,

  // Exportar/Importar
  exportProject,
  importProject,

  // Versionado
  createVersion,
  getVersions,
  forkProject,

  // Compartir
  createShareLink,
  getSharedProject,
  revokeShareLink,

  // Galería
  getPublicProjects,
  getPublicProject,
};

export default projectService;
