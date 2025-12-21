import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useSearchParams,
  useParams,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { SimulationProvider } from "./context/SimulationContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

// --- IMPORTS DE UI ---
import Navbar from "./components/layout/Navbar";
// IMPORTANTE: Importamos el GridEditor que contiene Sidebar + Canvas + Stats
import GridEditor from "./components/simulation/GridEditor";

// --- IMPORTS DE PÁGINAS ---
import Home from "./pages/Home";
import Tutorials from "./pages/Tutorials";
import Login from "./pages/Login";
import Gallery from "./pages/Gallery";
import SharedProject from "./pages/SharedProject";
import ProjectManager from "./components/projects/ProjectManager";

// --- COMPONENTE PARA RUTAS PROTEGIDAS ---
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-lg text-gray-400">Cargando...</div>
      </div>
    );
  }

  return isAuthenticated() ? children : <Navigate to="/login" />;
};

// --- VISTA DEL WORKSPACE ---
const WorkspaceView = () => {
  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white overflow-hidden font-sans">
      {/* 1. Navbar Superior */}
      <Navbar />

      {/* 2. Área Principal */}
      <div className="flex-1 overflow-hidden">
        {/* GridEditor es ahora tu "Super Componente".
                   Ya incluye:
                   - Sidebar Izquierdo (Drag & Drop)
                   - Canvas Central (Simulación)
                   - Controles Flotantes (Play/Pause)
                   - Panel Derecho (Estadísticas)
                */}
        <GridEditor />
      </div>
    </div>
  );
};

// Wrap del workspace con SimulationProvider aislado por proyecto/tutorial
const WorkspaceWithProvider = () => {
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const projectId = searchParams.get("project") || id || null;
  const isReadOnly =
    searchParams.get("readonly") === "1" ||
    searchParams.get("view") === "readonly";

  return (
    <SimulationProvider
      projectId={projectId}
      readOnly={isReadOnly}
      key={`${projectId || "default"}-${isReadOnly}`}
    >
      <WorkspaceView />
    </SimulationProvider>
  );
};

// --- APP PRINCIPAL ---
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login />} />
          <Route path="/tutorials" element={<Tutorials />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/shared/:token" element={<SharedProject />} />

          {/* Rutas protegidas - requieren autenticación */}
          <Route
            path="/workspace"
            element={
              <ProtectedRoute>
                <WorkspaceWithProvider />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tutorials/:id"
            element={
              <ProtectedRoute>
                <WorkspaceWithProvider />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <ProjectManager />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
