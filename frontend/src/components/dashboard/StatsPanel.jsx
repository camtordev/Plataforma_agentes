import { useSimulation } from "../../context/SimulationContext"

const StatsPanel = () => {
  const { worldState } = useSimulation()

  const totalEnergy = worldState.agents.reduce((sum, agent) => sum + agent.energy, 0)
  const avgEnergy = worldState.agents.length > 0 ? totalEnergy / worldState.agents.length : 0

  return (
    <div className="p-4 bg-zinc-900 border-b border-zinc-800">
      <h3 className="text-sm font-semibold text-white mb-3">Statistics</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-800 p-3 rounded-lg">
          <div className="text-xs text-zinc-400 mb-1">Step</div>
          <div className="text-xl font-bold text-white">{worldState.step}</div>
        </div>

        <div className="bg-zinc-800 p-3 rounded-lg">
          <div className="text-xs text-zinc-400 mb-1">Agents</div>
          <div className="text-xl font-bold text-blue-400">{worldState.agents.length}</div>
        </div>

        <div className="bg-zinc-800 p-3 rounded-lg">
          <div className="text-xs text-zinc-400 mb-1">Food</div>
          <div className="text-xl font-bold text-green-400">{worldState.food.length}</div>
        </div>

        <div className="bg-zinc-800 p-3 rounded-lg">
          <div className="text-xs text-zinc-400 mb-1">Avg Energy</div>
          <div className="text-xl font-bold text-yellow-400">{avgEnergy.toFixed(1)}</div>
        </div>
      </div>
    </div>
  )
}

export default StatsPanel
