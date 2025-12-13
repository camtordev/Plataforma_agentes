import { Link } from "react-router-dom" 

const Navbar = () => {
  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-3"> {/* href cambia a to */}
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl"> 🤖 </span>
          </div>
          <span className="text-xl font-bold text-white">AgentLab</span>
        </Link>
        <div className="flex gap-6">
          <Link to="/workspace" className="text-zinc-300 hover:text-white transition-colors">
            Workspace
          </Link>
          <Link to="/tutorials" className="text-zinc-300 hover:text-white transition-colors">
            Tutorials
          </Link>
        </div>
      </div>
    </nav>
  )
}
export default Navbar