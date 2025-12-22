// frontend/src/services/tutorialService.js
/**
 * Servicio para interactuar con los endpoints de progreso de tutoriales
 * API Base: http://3.228.25.217/api/v1/tutorials
 */

import { getToken } from './authService';

const API_BASE = "http://3.228.25.217/api/v1/tutorials";

/**
 * Genera headers con autenticación JWT
 */
function getAuthHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` })
  };
}

/**
 * Obtiene el progreso del usuario en un tutorial específico
 * @param {number} level - Nivel del tutorial (1-8)
 * @returns {Promise<{status: string, current_code: string|null, time_spent_seconds: number, started_at: string|null, completed_at: string|null}>}
 */
export async function getTutorialProgress(level) {
  try {
    const response = await fetch(`${API_BASE}/${level}/progress`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('No autenticado. Por favor inicia sesión.');
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching progress for level ${level}:`, error);
    throw error;
  }
}

/**
 * Inicia un tutorial (crea el registro de progreso)
 * @param {number} level - Nivel del tutorial (1-8)
 * @param {string|null} initialCode - Código inicial opcional
 * @returns {Promise<{status: string, current_code: string|null, time_spent_seconds: number, started_at: string, completed_at: string|null}>}
 */
export async function startTutorial(level, initialCode = null) {
  try {
    const response = await fetch(`${API_BASE}/${level}/start`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        initial_code: initialCode,
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('No autenticado. Por favor inicia sesión.');
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error starting tutorial level ${level}:`, error);
    throw error;
  }
}

/**
 * Guarda automáticamente el progreso (código + tiempo)
 * @param {number} level - Nivel del tutorial (1-8)
 * @param {string} code - Código actual del usuario
 * @param {number} timeSpentSeconds - Tiempo total acumulado en segundos
 * @returns {Promise<{status: string, current_code: string, time_spent_seconds: number, started_at: string, completed_at: string|null}>}
 */
export async function autosaveTutorial(level, code, timeSpentSeconds) {
  try {
    const response = await fetch(`${API_BASE}/${level}/autosave`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        code: code,
        time_spent_seconds: timeSpentSeconds,
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('No autenticado. Por favor inicia sesión.');
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error autosaving tutorial level ${level}:`, error);
    throw error;
  }
}

/**
 * Marca el tutorial como completado
 * @param {number} level - Nivel del tutorial (1-8)
 * @param {string} finalCode - Código final del usuario
 * @param {number} timeSpentSeconds - Tiempo total empleado en segundos
 * @returns {Promise<{status: string, current_code: string, time_spent_seconds: number, started_at: string, completed_at: string}>}
 */
export async function completeTutorial(level, finalCode, timeSpentSeconds) {
  try {
    const response = await fetch(`${API_BASE}/${level}/complete`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        final_code: finalCode,
        time_spent_seconds: timeSpentSeconds,
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('No autenticado. Por favor inicia sesión.');
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error completing tutorial level ${level}:`, error);
    throw error;
  }
}

/**
 * Obtiene el progreso de todos los tutoriales del usuario
 * @returns {Promise<Array<{level: number, status: string, time_spent_seconds: number}>>}
 */
export async function getAllTutorialsProgress() {
  try {
    // Por ahora, obtener progreso de los 8 niveles
    const levels = [1, 2, 3, 4, 5, 6, 7, 8];
    const promises = levels.map((level) => getTutorialProgress(level));
    const results = await Promise.all(promises);

    return results.map((result, index) => ({
      level: levels[index],
      status: result.status,
      time_spent_seconds: result.time_spent_seconds,
      completed_at: result.completed_at,
    }));
  } catch (error) {
    console.error("Error fetching all tutorials progress:", error);
    throw error;
  }
}
