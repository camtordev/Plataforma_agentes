"use client"
import { useSimulation } from "../../context/SimulationContext"

const Palette = () => {
  const { selectedTool, setSelectedTool } = useSimulation()

  const tools = [
    { id: "agent", label: "Agent", icon: "🤖", color: "bg-blue-600" },
    { id: "food", label: "Food", icon: "🍎", color: "bg-green-600" },
    { id: "obstacle", label: "Obstacle", icon: "⬛", color: "bg-gray-600" },
    { id: "eraser", label: "Eraser", icon: "🧹", color: "bg-red-600" },
  ]

  return (
    <div className="p-4 bg-zinc-900 border-b border-zinc-800">
      <h3 className="text-sm font-semibold text-white mb-3">Tools</h3>
      <div className="grid grid-cols-2 gap-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setSelectedTool(tool.id)}
            className={`p-3 rounded-lg border-2 transition-all ${
              selectedTool === tool.id
                ? "border-blue-500 bg-blue-500/20"
                : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
            }`}
          >
            <div className="text-2xl mb-1">{tool.icon}</div>
            <div className="text-xs text-zinc-300">{tool.label}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default Palette