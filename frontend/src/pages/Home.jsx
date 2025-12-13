import { Link } from "react-router-dom"
import Navbar from "../components/layout/Navbar"

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-blue-950">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6">Aprende Programación Basada en Agentes</h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Plataforma interactiva para diseñar, programar y visualizar sistemas multi-agente en tiempo real
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Tarjeta Workspace */}
          <Link
            to="/workspace"
            className="group p-8 bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl hover:border-blue-500 transition-all"
          >
            <div className="text-4xl mb-4"> 🎨 </div>
            <h3 className="text-2xl font-bold text-white mb-3">Workspace</h3>
            <p className="text-zinc-400">
              Editor visual con grid interactivo, código Python y simulación en tiempo real
            </p>
          </Link>

          {/* Tarjeta Tutoriales */}
          <Link
            to="/tutorials"
            className="group p-8 bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl hover:border-purple-500 transition-all"
          >
            <div className="text-4xl mb-4"> 📚 </div>
            <h3 className="text-2xl font-bold text-white mb-3">Tutorials</h3>
            <p className="text-zinc-400">Aprende desde agentes reactivos hasta sistemas multi-agente con IA</p>
          </Link>
        </div>

        {/* Sección de características */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 bg-zinc-900/30 backdrop-blur border border-zinc-800 rounded-xl">
            <div className="text-3xl mb-3"> ⚡ </div>
            <h4 className="text-lg font-semibold text-white mb-2">Tiempo Real</h4>
            <p className="text-sm text-zinc-400">Visualiza el comportamiento de hasta 100 agentes simultáneos</p>
          </div>
          <div className="p-6 bg-zinc-900/30 backdrop-blur border border-zinc-800 rounded-xl">
            <div className="text-3xl mb-3"> 🎯 </div>
            <h4 className="text-lg font-semibold text-white mb-2">Interactivo</h4>
            <p className="text-sm text-zinc-400">Drag & drop para diseñar entornos complejos sin código</p>
          </div>
          <div className="p-6 bg-zinc-900/30 backdrop-blur border border-zinc-800 rounded-xl">
            <div className="text-3xl mb-3"> 📊 </div>
            <h4 className="text-lg font-semibold text-white mb-2">Análisis</h4>
            <p className="text-sm text-zinc-400">Métricas y gráficos en tiempo real del desempeño de tus agentes</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home