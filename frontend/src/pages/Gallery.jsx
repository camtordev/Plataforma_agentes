import React, { useState, useEffect } from "react";
import { getPublicProjects, forkProject } from "../services/projectService";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import Navbar from "../components/layout/Navbar";

/**
 * RF5.3 - Galería Comunitaria
 * Explora proyectos públicos con filtros
 */
const Gallery = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    agent_type: "",
    difficulty_level: "",
    sort_by: "recent",
    skip: 0,
    limit: 20,
  });

  useEffect(() => {
    loadProjects();
  }, [filters]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await getPublicProjects(filters);
      setProjects(data);
    } catch (error) {
      toast.error("Error al cargar proyectos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      skip: 0, // Reset paginación al cambiar filtros
    }));
  };

  const handleFork = async (projectId) => {
    if (!user) {
      toast.error("Debes iniciar sesión para hacer fork");
      return;
    }

    try {
      await forkProject(projectId);
      toast.success("¡Proyecto clonado exitosamente!");
    } catch (error) {
      toast.error("Error al clonar proyecto: " + error.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white font-sans">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Galería de Proyectos
          </h1>
          <p className="text-zinc-400">
            Explora proyectos públicos de la comunidad
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-zinc-900 rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tipo de Agente */}
            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-2">
                Tipo de Agente
              </label>
              <select
                value={filters.agent_type}
                onChange={(e) =>
                  handleFilterChange("agent_type", e.target.value)
                }
                className="w-full px-4 py-2 border border-zinc-700 bg-zinc-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="reactive">Reactivo</option>
                <option value="goal_based">Basado en Objetivos</option>
                <option value="utility">Utilidad</option>
                <option value="model_based">Basado en Modelos</option>
              </select>
            </div>

            {/* Dificultad */}
            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-2">
                Dificultad
              </label>
              <select
                value={filters.difficulty_level}
                onChange={(e) =>
                  handleFilterChange("difficulty_level", e.target.value)
                }
                className="w-full px-4 py-2 border border-zinc-700 bg-zinc-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas</option>
                <option value="1">⭐ Principiante</option>
                <option value="2">⭐⭐ Fácil</option>
                <option value="3">⭐⭐⭐ Intermedio</option>
                <option value="4">⭐⭐⭐⭐ Avanzado</option>
                <option value="5">⭐⭐⭐⭐⭐ Experto</option>
              </select>
            </div>

            {/* Ordenar por */}
            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-2">
                Ordenar por
              </label>
              <select
                value={filters.sort_by}
                onChange={(e) => handleFilterChange("sort_by", e.target.value)}
                className="w-full px-4 py-2 border border-zinc-700 bg-zinc-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="recent">Más Recientes</option>
                <option value="popular">Más Populares</option>
                <option value="liked">Más Gustados</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grid de Proyectos */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-zinc-400">Cargando proyectos...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900 rounded-lg shadow">
            <p className="text-zinc-400">No se encontraron proyectos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-zinc-900 rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden border border-zinc-800"
              >
                {/* Thumbnail */}
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                  {project.thumbnail_url ? (
                    <img
                      src={project.thumbnail_url}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-white text-6xl font-bold">
                      {project.title[0]}
                    </div>
                  )}

                  {/* Badge de dificultad */}
                  {project.difficulty_level && (
                    <span className="absolute top-2 right-2 bg-zinc-800 px-2 py-1 rounded text-sm font-medium text-white border border-zinc-700">
                      {"⭐".repeat(project.difficulty_level)}
                    </span>
                  )}
                </div>

                {/* Contenido */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2 truncate">
                    {project.title}
                  </h3>

                  <p className="text-zinc-400 text-sm mb-4 line-clamp-2">
                    {project.description || "Sin descripción"}
                  </p>

                  {/* Tipo de agente */}
                  {project.agent_type && (
                    <span className="inline-block bg-blue-900 text-blue-200 text-xs px-2 py-1 rounded mb-3">
                      {project.agent_type}
                    </span>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-zinc-400 mb-4">
                    <span>▶ {project.execution_count} ejecuciones</span>
                    <span>🍴 {project.forks_count} forks</span>
                  </div>

                    {/* Acciones */}
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                        (window.location.href = `/workspace?project=${project.id}&readonly=1`)
                        }
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Ver Proyecto
                      </button>

                    {user && (
                      <button
                        onClick={() => handleFork(project.id)}
                        className="bg-zinc-700 text-white px-4 py-2 rounded-lg hover:bg-zinc-600 transition-colors"
                        title="Clonar proyecto"
                      >
                        🍴
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginación */}
        {projects.length >= filters.limit && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  skip: prev.skip + prev.limit,
                }))
              }
              className="bg-zinc-900 px-6 py-3 rounded-lg shadow hover:shadow-lg transition-shadow text-white font-medium border border-zinc-800"
            >
              Cargar más proyectos
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Gallery;
