import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Navbar from "../components/layout/Navbar"

const Tutorials = () => {
  // Inicializamos como array vacío para evitar errores de .map
  const [tutorials, setTutorials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Intentamos conectar con el Backend
    fetch("http://localhost:8000/api/v1/tutorials/")
      .then((res) => {
        if (!res.ok) throw new Error("Error conectando al servidor")
        return res.json()
      })
      .then((data) => {
        // Verificamos que sea un array antes de guardarlo
        if (Array.isArray(data)) {
          setTutorials(data)
        } else {
          console.error("Formato de datos incorrecto:", data)
          setTutorials([]) 
        }
      })
      .catch((err) => {
        console.error("Error fetching tutorials:", err)
        setError("No se pudieron cargar los tutoriales. Asegúrate de que el Backend esté corriendo.")
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-white mb-3">Tutoriales Interactivos</h1>
        <p className="text-zinc-400 mb-12">
          Aprende programación basada en agentes paso a paso.
        </p>

        {/* MENS AJE DE CARGA */}
        {loading && (
            <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-zinc-400">Cargando lecciones...</p>
            </div>
        )}

        {/* MENSAJE DE ERROR */}
        {error && (
            <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-200 text-center">
                {error}
            </div>
        )}

        {/* LISTA VACÍA (Si no hay error pero tampoco datos) */}
        {!loading && !error && tutorials.length === 0 && (
            <div className="text-center py-10 text-zinc-500">
                No hay tutoriales disponibles en la base de datos.
                <br/>
                <span className="text-xs">Tip: Ejecuta el script de "seed" en el backend.</span>
            </div>
        )}

        {/* GRID DE TUTORIALES */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutorials.map((tutorial) => (
            <Link
              key={tutorial.id}
              to={`/tutorials/${tutorial.id}`}
              className="group p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-blue-500 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                  {tutorial.level}
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Nivel {tutorial.level}</div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                {tutorial.title}
              </h3>
              <p className="text-sm text-zinc-400 mb-4">{tutorial.description_markdown ? tutorial.description_markdown.substring(0, 60) + "..." : "Sin descripción"}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Tutorials