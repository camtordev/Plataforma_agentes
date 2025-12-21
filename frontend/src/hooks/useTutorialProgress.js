// frontend/src/hooks/useTutorialProgress.js
/**
 * Hook personalizado para gestionar el progreso de tutoriales
 * Sincroniza automáticamente con el backend y mantiene caché en localStorage
 */

import { useState, useEffect, useCallback } from "react";
import {
  getTutorialProgress,
  startTutorial,
  autosaveTutorial,
  completeTutorial,
} from "../services/tutorialService";

const STORAGE_KEY = "tutorials_progress_cache";
const AUTOSAVE_INTERVAL = 15000; // 15 segundos

/**
 * Hook para gestionar progreso de un tutorial individual
 * @param {number} level - Nivel del tutorial
 * @param {boolean} isOpen - Si el modal del tutorial está abierto
 */
export function useTutorialProgress(level, isOpen = false) {
  const [progress, setProgress] = useState({
    status: "not_started",
    current_code: null,
    time_spent_seconds: 0,
    started_at: null,
    completed_at: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);

  // Cargar progreso inicial desde backend
  useEffect(() => {
    if (!level) return;

    async function fetchProgress() {
      try {
        setLoading(true);
        const data = await getTutorialProgress(level);
        setProgress(data);
        setError(null);
      } catch (err) {
        console.error("Error loading progress:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProgress();
  }, [level]);

  // Iniciar tutorial
  const start = useCallback(
    async (initialCode = null) => {
      try {
        const data = await startTutorial(level, initialCode);
        setProgress(data);
        setLastSaved(new Date());
        return data;
      } catch (err) {
        console.error("Error starting tutorial:", err);
        setError(err.message);
        throw err;
      }
    },
    [level]
  );

  // Guardar automáticamente
  const save = useCallback(
    async (code, timeSpent) => {
      try {
        const data = await autosaveTutorial(level, code, timeSpent);
        setProgress(data);
        setLastSaved(new Date());
        return data;
      } catch (err) {
        console.error("Error autosaving tutorial:", err);
        setError(err.message);
        throw err;
      }
    },
    [level]
  );

  // Completar tutorial
  const complete = useCallback(
    async (finalCode, timeSpent) => {
      try {
        const data = await completeTutorial(level, finalCode, timeSpent);
        setProgress(data);
        setLastSaved(new Date());
        return data;
      } catch (err) {
        console.error("Error completing tutorial:", err);
        setError(err.message);
        throw err;
      }
    },
    [level]
  );

  // Refrescar progreso desde el backend
  const refresh = useCallback(async () => {
    try {
      const data = await getTutorialProgress(level);
      setProgress(data);
      return data;
    } catch (err) {
      console.error("Error refreshing progress:", err);
      setError(err.message);
      throw err;
    }
  }, [level]);

  return {
    progress,
    loading,
    error,
    lastSaved,
    start,
    save,
    complete,
    refresh,
  };
}

/**
 * Hook para gestionar progreso global de todos los tutoriales
 */
export function useAllTutorialsProgress() {
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar progreso de todos los niveles
  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const levels = [1, 2, 3, 4, 5, 6, 7, 8];
      const promises = levels.map((level) => getTutorialProgress(level));
      const results = await Promise.all(promises);

      const map = {};
      results.forEach((result, index) => {
        map[levels[index]] = result;
      });

      setProgressMap(map);
      setError(null);

      // Guardar en caché
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch (err) {
      console.error("Error loading all progress:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar al montar
  useEffect(() => {
    // Intentar cargar desde caché primero
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        setProgressMap(JSON.parse(cached));
      } catch (e) {
        console.error("Error parsing cached progress:", e);
      }
    }

    // Luego cargar desde backend
    loadAll();
  }, [loadAll]);

  // Calcular estadísticas
  const stats = {
    total: 8,
    completed: Object.values(progressMap).filter((p) => p.status === "completed").length,
    inProgress: Object.values(progressMap).filter((p) => p.status === "in_progress").length,
    notStarted: Object.values(progressMap).filter((p) => p.status === "not_started").length,
    totalTimeSeconds: Object.values(progressMap).reduce(
      (sum, p) => sum + (p.time_spent_seconds || 0),
      0
    ),
  };

  stats.completionPercentage = Math.round((stats.completed / stats.total) * 100);

  return {
    progressMap,
    stats,
    loading,
    error,
    refresh: loadAll,
  };
}
