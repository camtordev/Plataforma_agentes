import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/layout/Navbar";
import { TUTORIAL_LEVELS } from "../content/tutorialsData";
import TutorialLevelModal from "../components/tutorials/TutorialLevelModal";
import { useAllTutorialsProgress } from "../hooks/useTutorialProgress";
import { completeTutorial, startTutorial } from "../services/tutorialService";
import { useAuth } from "../context/AuthContext";

function safeParse(raw, fallback) {
  try {
    const v = JSON.parse(raw);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

export default function Tutorials() {
  const { user } = useAuth();
  const [openId, setOpenId] = useState(null);
  const [tab, setTab] = useState("TEORIA");
  const [toast, setToast] = useState(null);

  // Clave de localStorage específica por usuario
  const STORAGE_KEY = user
    ? `tutorials_progress_user_${user.id}`
    : "tutorials_progress_guest";

  // Estado local para quiz/práctica (inmediato)
  const [progress, setProgress] = useState(() =>
    safeParse(localStorage.getItem(STORAGE_KEY), {
      completed: {},
      answers: {},
      quizChecked: {},
      quizPassed: {},
      drafts: {},
      codeChecked: {},
      codePassed: {},
      codeMissing: {},
    })
  );

  // Progreso global desde backend (persistente)
  const {
    progressMap,
    stats,
    loading: backendLoading,
    error: backendError,
    refresh: refreshBackend,
  } = useAllTutorialsProgress();

  // Guardar progreso local en localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress, STORAGE_KEY]);

  // Recargar progreso local cuando cambia el usuario
  useEffect(() => {
    const newProgress = safeParse(localStorage.getItem(STORAGE_KEY), {
      completed: {},
      answers: {},
      quizChecked: {},
      quizPassed: {},
      drafts: {},
      codeChecked: {},
      codePassed: {},
      codeMissing: {},
    });
    setProgress(newProgress);
  }, [user?.id, STORAGE_KEY]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const currentLevel = useMemo(
    () => TUTORIAL_LEVELS.find((x) => x.id === openId) || null,
    [openId]
  );

  // Usar stats del backend para progreso global
  const completedCount = stats.completed;
  const overallPct = stats.completionPercentage;

  function isUnlocked(levelObj) {
    if (levelObj.level === 1) return true;
    const prevLevel = levelObj.level - 1;
    // Verificar en backend si el nivel anterior está completado
    return progressMap[prevLevel]?.status === "completed";
  }

  function getStatus(levelObj) {
    const backendStatus = progressMap[levelObj.level]?.status || "not_started";

    // Verificar en backend primero
    if (backendStatus === "completed") return "COMPLETED";
    if (!isUnlocked(levelObj)) return "LOCKED";
    if (backendStatus === "in_progress") return "IN_PROGRESS";

    // Considerar progreso local también
    if (
      progress.quizPassed?.[levelObj.id] ||
      progress.codePassed?.[levelObj.id]
    ) {
      return "IN_PROGRESS";
    }

    return "AVAILABLE";
  }

  function openLevel(levelObj) {
    if (!isUnlocked(levelObj) && !progress.completed?.[levelObj.id]) {
      setToast("🔒 Completa el nivel anterior para desbloquear este.");
      return;
    }
    setOpenId(levelObj.id);
    setTab("TEORIA");
  }

  function closeModal() {
    setOpenId(null);
  }

  async function completeLevel(levelObj, finalCode, timeSpent) {
    try {
      // 1. Actualizar local inmediatamente (UI responsiva)
      setProgress((p) => ({
        ...p,
        completed: { ...(p.completed || {}), [levelObj.id]: true },
      }));

      // 2. Iniciar progreso si no existe (necesario para completar)
      const backendStatus = progressMap[levelObj.level]?.status;
      if (!backendStatus || backendStatus === "not_started") {
        await startTutorial(levelObj.level, finalCode || "");
      }

      // 3. Guardar en backend como completado
      await completeTutorial(levelObj.level, finalCode || "", timeSpent || 0);

      // 4. Refrescar progreso global
      await refreshBackend();

      setToast(
        "🏁 Nivel completado y guardado en el servidor. ¡Se desbloqueó el siguiente!"
      );
      closeModal();
    } catch (err) {
      console.error("Error completing level:", err);
      setToast(
        "⚠️ Nivel completado localmente. Error al sincronizar con servidor."
      );
      closeModal();
    }
  }

  function resetAll() {
    localStorage.removeItem(STORAGE_KEY);
    setProgress({
      completed: {},
      answers: {},
      quizChecked: {},
      quizPassed: {},
      drafts: {},
      codeChecked: {},
      codePassed: {},
      codeMissing: {},
    });
    setToast("Progreso reiniciado.");
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 shadow">
          {toast}
        </div>
      )}

      {backendError && (
        <div className="fixed top-16 right-4 z-50 px-4 py-3 rounded-lg bg-red-900 border border-red-700 text-red-100 shadow">
          ⚠️ Sin conexión al servidor: {backendError}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Tutoriales</h1>
            <p className="text-zinc-400">
              8 niveles con teoría, práctica guiada y quizzes. Progreso guardado
              en el servidor.
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 min-w-[280px]">
            <div className="flex justify-between text-sm text-zinc-200">
              <span>Progreso general {backendLoading && "(cargando...)"}</span>
              <span className="text-zinc-400">
                {completedCount}/{TUTORIAL_LEVELS.length} ({overallPct}%)
              </span>
            </div>
            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${overallPct}%` }}
              />
            </div>
            
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TUTORIAL_LEVELS.map((lvl) => {
            const st = getStatus(lvl);
            const locked = st === "LOCKED";
            const badge =
              st === "COMPLETED"
                ? "border-emerald-700 text-emerald-200 bg-emerald-900/20"
                : st === "IN_PROGRESS"
                ? "border-amber-700 text-amber-200 bg-amber-900/20"
                : st === "LOCKED"
                ? "border-zinc-700 text-zinc-300 bg-zinc-900/50"
                : "border-blue-700 text-blue-200 bg-blue-900/20";

            const checklistDone =
              (progress.codePassed?.[lvl.id] ? 1 : 0) +
              (progress.quizPassed?.[lvl.id] ? 1 : 0);
            const checklistPct = Math.round((checklistDone / 2) * 100);

            return (
              <button
                key={lvl.id}
                onClick={() => openLevel(lvl)}
                className={[
                  "text-left group bg-zinc-900 border rounded-xl p-6 transition-all relative",
                  locked
                    ? "border-zinc-800 opacity-60"
                    : "border-zinc-800 hover:border-blue-500",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {lvl.level}
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500">
                        Nivel {lvl.level}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {lvl.estimatedMinutes} min aprox.
                      </div>
                    </div>
                  </div>
                  <div
                    className={`text-xs px-2 py-1 rounded-full border ${badge}`}
                  >
                    {st}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {lvl.title}
                </h3>
                <p className="text-sm text-zinc-400 mb-4">{lvl.summary}</p>

                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Checklist (Práctica + Quiz)</span>
                    <span>{checklistDone}/2</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${checklistPct}%` }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-zinc-500">
                    {locked
                      ? "Completa el nivel anterior para desbloquear."
                      : "Abrir para estudiar y resolver."}
                  </div>
                </div>

                {locked && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="px-3 py-2 rounded-lg bg-zinc-950/60 border border-zinc-800 text-zinc-200 text-sm">
                      🔒 Bloqueado
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* MODAL REUTILIZABLE */}
      {currentLevel && (
        <TutorialLevelModal
          level={currentLevel}
          tab={tab}
          setTab={setTab}
          progress={progress}
          setProgress={setProgress}
          onClose={closeModal}
          onToast={setToast}
          onCompleteLevel={completeLevel}
        />
      )}
    </div>
  );
}
