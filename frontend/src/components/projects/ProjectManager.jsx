import React, { useState, useEffect } from "react";
import {
  getMyProjects,
  createProject,
  updateProject,
  deleteProject,
  exportProject,
  importProject,
  getProject,
} from "../../services/projectService";
import ShareModal from "./ShareModal";
import { toast } from "react-hot-toast";
import Navbar from "../layout/Navbar";

/**
 * RF5.1 - Gestor de Proyectos
 * CRUD completo y exportar
 */
const ProjectManager = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [shareLinks, setShareLinks] = useState({});

  const handleImport = async (file) => {
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importProject(data);
      toast.success("Proyecto importado exitosamente");
      setShowImportModal(false);
      loadProjects();
    } catch (error) {
      toast.error("Error al importar: " + error.message);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await getMyProjects();
      setProjects(data);
    } catch (error) {
      toast.error("Error al cargar proyectos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    try {
      await createProject(formData);
      toast.success("Proyecto creado exitosamente");
      setShowCreateModal(false);
      loadProjects();
    } catch (error) {
      toast.error("Error al crear proyecto: " + error.message);
    }
  };

  const handleDelete = async (projectId) => {
    if (!confirm("¿Estás seguro de eliminar este proyecto?")) return;

    try {
      await deleteProject(projectId);
      toast.success("Proyecto eliminado");
      loadProjects();
    } catch (error) {
      toast.error("Error al eliminar: " + error.message);
    }
  };

  const handleExport = async (projectId) => {
    try {
      await exportProject(projectId, true);
      toast.success("Proyecto exportado");
    } catch (error) {
      toast.error("Error al exportar: " + error.message);
    }
  };

  const handleShare = (project) => {
    setSelectedProject(project);
    setShowShareModal(true);
  };

  const handleLinkChange = (projectId, link) => {
    setShareLinks((prev) => ({
      ...prev,
      [projectId]: link,
    }));
  };

  const handleEdit = async (projectId) => {
    try {
      const fullProject = await getProject(projectId);
      setProjectToEdit(fullProject);
    } catch (error) {
      toast.error("No se pudo cargar el proyecto completo: " + error.message);
    }
  };

  const handleUpdate = async (projectId, formData) => {
    try {
      await updateProject(projectId, formData);
      toast.success("Proyecto actualizado");
      setProjectToEdit(null);
      loadProjects();
    } catch (error) {
      toast.error("Error al actualizar: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />
      <div className="flex-1 p-6">
        {/* Header de sección */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Mis Proyectos</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-md border border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:border-zinc-500 transition-colors shadow-sm"
            >
              + Nuevo Proyecto
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 rounded-md border border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:border-zinc-500 transition-colors shadow-sm"
            >
              Importar proyecto
            </button>
          </div>
        </div>

        {/* Modal Importar Proyecto */}
        {showImportModal && (
          <ImportProjectModal
            onClose={() => setShowImportModal(false)}
            onImport={handleImport}
          />
        )}

        {/* Lista de Proyectos */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-lg shadow">
            <p className="text-zinc-400 mb-4">No tienes proyectos aún</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 shadow"
            >
              Crear tu primer proyecto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg shadow p-6"
              >
                {/* Título */}
                <h3 className="text-lg font-semibold text-white mb-2">
                  {project.title}
                </h3>

                {/* Descripción */}
                <p className="text-zinc-400 text-sm mb-4 line-clamp-2">
                  {project.description || "Sin descripción"}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-zinc-500 mb-4">
                  <span>▶ {project.execution_count}</span>
                  <span>🍴 {project.forks_count}</span>
                  <span
                    className={
                      project.is_public ? "text-green-400" : "text-zinc-600"
                    }
                  >
                    {project.is_public ? "🌐 Público" : "🔒 Privado"}
                  </span>
                </div>

                {/* Acciones */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      (window.location.href = `/workspace?project=${project.id}`)
                    }
                    className="flex-1 px-3 py-2 text-sm rounded-md border border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:border-blue-500 shadow-sm transition"
                  >
                    Abrir
                  </button>

                  <button
                    onClick={() => handleEdit(project.id)}
                    className="px-3 py-2 text-sm rounded-md border border-amber-700/60 bg-amber-900/30 text-amber-100 hover:bg-amber-800/50 shadow-sm transition"
                    title="Editar"
                  >
                    ✏️
                  </button>

                  <button
                    onClick={() => handleShare(project)}
                    className="px-3 py-2 text-sm rounded-md border border-green-700/60 bg-green-900/30 text-green-100 hover:bg-green-800/50 shadow-sm transition"
                    title="Compartir"
                  >
                    🔗
                  </button>

                  <button
                    onClick={() => handleExport(project.id)}
                    className="px-3 py-2 text-sm rounded-md border border-purple-700/60 bg-purple-900/30 text-purple-100 hover:bg-purple-800/50 shadow-sm transition"
                    title="Exportar"
                  >
                    ⬇️
                  </button>

                  <button
                    onClick={() => handleDelete(project.id)}
                    className="px-3 py-2 text-sm rounded-md border border-red-700/60 bg-red-900/30 text-red-100 hover:bg-red-800/50 shadow-sm transition"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Crear Proyecto */}
        {showCreateModal && (
          <CreateProjectModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreate}
          />
        )}

        {/* Modal Editar Proyecto */}
        {projectToEdit && (
          <CreateProjectModal
            initialData={projectToEdit}
            onClose={() => setProjectToEdit(null)}
            onCreate={(data) => handleUpdate(projectToEdit.id, data)}
            mode="edit"
          />
        )}

        {/* Modal Compartir */}
        {showShareModal && selectedProject && (
          <ShareModal
            project={selectedProject}
            initialLink={shareLinks[selectedProject.id]}
            onLinkChange={(link) => handleLinkChange(selectedProject.id, link)}
            onClose={() => {
              setShowShareModal(false);
              setSelectedProject(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

const ImportProjectModal = ({ onClose, onImport }) => {
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (file) onImport(file);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-white mb-4">Importar Proyecto</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Selecciona archivo JSON
            </label>
            <input
              type="file"
              accept="application/json"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full px-4 py-2 border border-zinc-700 bg-zinc-950 text-zinc-100 rounded-lg"
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 shadow"
            >
              Importar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-zinc-800 text-zinc-300 py-2 rounded-lg hover:bg-zinc-700"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * Modal para crear proyecto
 */
const AGENT_OPTIONS = [
  { value: "reactive", label: "Reactivo" },
  { value: "explorer", label: "Explorador" },
  { value: "collector", label: "Recolector" },
  { value: "cooperative", label: "Cooperativo" },
  { value: "competitive", label: "Competitivo" },
  { value: "q_learning", label: "Q-Learning" },
  { value: "custom", label: "Personalizado" },
];

const CreateProjectModal = ({ onClose, onCreate, initialData, mode = "create" }) => {
  const [formData, setFormData] = useState(
    initialData || {
      title: "",
      description: "",
      is_public: false,
      agent_type: "reactive",
      difficulty_level: 1,
      simulation_config: {},
    }
  );
  const [agentSelections, setAgentSelections] = useState(() =>
    hydrateSelectedTypes(initialData)
  );
  const [showAgentPicker, setShowAgentPicker] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        simulation_config: initialData.simulation_config || {},
      });
      setAgentSelections(hydrateSelectedTypes(initialData));
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedAgents = agentSelections.length
      ? agentSelections
      : ["reactive"];
    const agent_type =
      selectedAgents.length === 1 ? selectedAgents[0] : "mixed";

    onCreate({
      ...formData,
      agent_type,
      simulation_config: {
        ...(formData.simulation_config || {}),
        agentPlan: selectedAgents.map((type) => ({ type })),
      },
    });
  };

  const toggleAgent = (value) => {
    setAgentSelections((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-white mb-4">
          {mode === "edit" ? "Editar Proyecto" : "Nuevo Proyecto"}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2 border border-zinc-700 bg-zinc-950 text-zinc-100 rounded-lg focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 border border-zinc-700 bg-zinc-950 text-zinc-100 rounded-lg focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-500"
              rows="3"
            />
          </div>

          <div className="mb-4 space-y-2">
            <button
              type="button"
              onClick={() => setShowAgentPicker((prev) => !prev)}
              className="w-full flex items-center justify-between px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-950 text-zinc-200 hover:border-blue-500 transition-colors"
            >
              <span className="text-sm font-medium text-zinc-300">
                Agentes iniciales (selección múltiple)
              </span>
              <span className="text-xs text-zinc-400">
                {showAgentPicker ? "Ocultar" : "Mostrar"}
              </span>
            </button>

            {showAgentPicker && (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 border border-zinc-800 rounded-lg p-3 bg-zinc-950/70">
                {AGENT_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2 p-2 rounded-lg border border-zinc-800 bg-zinc-950/60 text-sm text-zinc-200 cursor-pointer hover:border-zinc-700"
                  >
                    <input
                      type="checkbox"
                      checked={agentSelections.includes(opt.value)}
                      onChange={() => toggleAgent(opt.value)}
                      className="accent-blue-500"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
                <p className="text-xs text-zinc-500">
                  Puedes elegir varios tipos; se marcará “mixed” si hay más de uno.
                </p>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Dificultad
            </label>
            <select
              value={formData.difficulty_level}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  difficulty_level: parseInt(e.target.value),
                })
              }
              className="w-full px-4 py-2 border border-zinc-700 bg-zinc-950 text-zinc-100 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">⭐ Principiante</option>
              <option value="2">⭐⭐ Fácil</option>
              <option value="3">⭐⭐⭐ Intermedio</option>
              <option value="4">⭐⭐⭐⭐ Avanzado</option>
              <option value="5">⭐⭐⭐⭐⭐ Experto</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_public}
                onChange={(e) =>
                  setFormData({ ...formData, is_public: e.target.checked })
                }
                className="mr-2 accent-blue-600"
              />
              <span className="text-sm text-zinc-300">Hacer público</span>
            </label>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 shadow"
            >
              {mode === "edit" ? "Guardar" : "Crear"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-zinc-800 text-zinc-300 py-2 rounded-lg hover:bg-zinc-700"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const hydrateSelectedTypes = (data) => {
  const existingPlan = data?.simulation_config?.agentPlan || [];
  if (existingPlan.length) {
    return existingPlan.map((a) => a.type);
  }
  return ["reactive"];
};

export default ProjectManager;
