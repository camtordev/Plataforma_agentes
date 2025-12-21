import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { getSharedProject, forkProject } from "../services/projectService";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { Link2 } from "lucide-react";
import GridEditor from "../components/simulation/GridEditor";
import { SimulationProvider, useSimulation } from "../context/SimulationContext";

/**
 * RF5.2 - Vista Previa de Proyecto Compartido
 * Acceso publico mediante token compartido
 */
const SharedProject = () => {
  const { token } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const viewerInstance = useMemo(
    () =>
      (typeof crypto !== "undefined" && crypto.randomUUID)
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    []
  );

  useEffect(() => {
    loadProject();
  }, [token]);

  const loadProject = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSharedProject(token);
      setProject(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFork = async () => {
    if (!user) {
      toast.error("Debes iniciar sesion para clonar este proyecto");
      return;
    }

    try {
      const forked = await forkProject(project.id);
      toast.success("Proyecto clonado exitosamente");
      setTimeout(() => {
        window.location.href = `/workspace?project=${forked.id}`;
      }, 1200);
    } catch (error) {
      toast.error("Error al clonar: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-sm text-zinc-400">Cargando proyecto compartido...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl p-8 text-center">
          <div className="text-4xl mb-3">:(</div>
          <h2 className="text-xl font-semibold text-white mb-2">No se pudo cargar el proyecto</h2>
          <p className="text-sm text-zinc-400 mb-6">{error}</p>
          <button
            onClick={() => (window.location.href = "/")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ir al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Encabezado compacto */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-700/40 text-blue-200">
              <Link2 size={14} /> Vista compartida · Enlace publico
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">{project.title}</h1>
              <p className="text-sm text-zinc-400">
                Proyecto accesible mediante token. Consulta, clona o ejecutalo en el espacio compartido.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            {user ? (
              <>
                <button
                  onClick={handleFork}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow transition-colors"
                >
                  Clonar a mi cuenta
                </button>
                <button
                  onClick={() =>
                    (window.location.href = `/workspace?project=${project.id}&view=shared`)
                  }
                  className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 transition-colors"
                >
                  Abrir en workspace
                </button>
              </>
            ) : (
              <button
                onClick={() => (window.location.href = "/login")}
                className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow transition-colors"
              >
                Iniciar sesion para clonar
              </button>
            )}
          </div>
        </div>

        {/* Resumen y metadatos */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700">
                  {project.is_public ? "Publico" : "Privado"}
                </span>
                {project.agent_type && (
                  <span className="px-2 py-1 rounded-md bg-blue-500/10 border border-blue-700/40 text-blue-200">
                    Tipo: {project.agent_type}
                  </span>
                )}
                {project.difficulty_level && (
                  <span className="px-2 py-1 rounded-md bg-purple-500/10 border border-purple-700/40 text-purple-200">
                    Dificultad: {"★".repeat(project.difficulty_level)}
                  </span>
                )}
              </div>
              {project.description && (
                <p className="text-sm text-zinc-300 leading-relaxed">{project.description}</p>
              )}
              <div className="flex flex-wrap gap-3 text-sm text-zinc-400">
                <span>▶ {project.execution_count} ejecuciones</span>
                <span>⤴ {project.forks_count} clones</span>
                <span>
                  ⏱ Creado el {new Date(project.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {project.thumbnail_url && (
              <div className="shrink-0">
                <img
                  src={project.thumbnail_url}
                  alt={project.title}
                  className="w-28 h-28 rounded-lg object-cover border border-zinc-800 shadow"
                />
              </div>
            )}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InfoCard label="Ancho" value={`${project.grid_width} celdas`} />
            <InfoCard label="Alto" value={`${project.grid_height} celdas`} />
            <InfoCard label="Tamano de celda" value={`${project.cell_size}px`} />
          </div>
        </div>

        {/* Codigo del usuario */}
        {project.user_code && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Codigo del agente</h2>
              <span className="text-xs text-zinc-500">Solo lectura</span>
            </div>
            <pre className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-xs overflow-x-auto leading-relaxed">
              <code>{project.user_code}</code>
            </pre>
          </div>
        )}

        {/* Estado del mundo */}
        {project.world_state && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-6 space-y-3">
            <h2 className="text-lg font-semibold text-white">Estado del mundo</h2>
            <details className="group">
              <summary className="cursor-pointer text-sm text-blue-300 group-open:text-blue-200">
                Ver configuracion JSON
              </summary>
              <pre className="mt-3 bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-xs overflow-x-auto leading-relaxed text-zinc-200">
                {JSON.stringify(project.world_state, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* Workspace en vivo */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Workspace compartido</h2>
            <p className="text-sm text-zinc-400">
              Explora y ejecuta la simulacion tal como fue compartida. La vista se abre automaticamente.
            </p>
          </div>

          <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950">
            <div className="h-[70vh]">
              <SimulationProvider
                projectId={project.id}
                readOnly={true}
                instanceId={viewerInstance}
                key={`shared-${project.id}`}
              >
                <SharedWorkspace />
              </SimulationProvider>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const InfoCard = ({ label, value }) => (
  <div className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-4">
    <p className="text-xs text-zinc-500 uppercase tracking-wide">{label}</p>
    <p className="text-lg font-semibold text-white mt-1">{value}</p>
  </div>
);

const SharedWorkspace = () => {
  const { setIsRunning } = useSimulation();

  useEffect(() => {
    setIsRunning(true);
  }, [setIsRunning]);

  return <GridEditor />;
};

export default SharedProject;
