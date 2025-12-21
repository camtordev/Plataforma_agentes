import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl"> 🤖 </span>
          </div>
          <span className="text-xl font-bold text-white">AgentLab</span>
        </Link>
        <div className="flex gap-6 items-center">
          <Link
            to="/workspace"
            className="text-zinc-300 hover:text-white transition-colors"
          >
            Workspace
          </Link>
          <Link
            to="/projects"
            className="text-zinc-300 hover:text-white transition-colors"
          >
            Proyectos
          </Link>
          <Link
            to="/gallery"
            className="text-zinc-300 hover:text-white transition-colors"
          >
            Galería
          </Link>
          <Link
            to="/tutorials"
            className="text-zinc-300 hover:text-white transition-colors"
          >
            Tutorials
          </Link>
          {user ? (
            <button
              onClick={logout}
              className="ml-4 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors"
            >
              Cerrar sesión
            </button>
          ) : (
            <Link
              to="/login"
              className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
