"use client"
import React from "react"
import { useSimulation } from "../../context/SimulationContext"
import { Activity, Apple, Zap, Trophy, Users, Clock } from "lucide-react"

const StatsPanel = () => {
  // Obtenemos el estado del mundo desde el contexto
  const { worldState } = useSimulation()

  // Si no hay datos aún, usamos valores por defecto
  const agents = worldState?.agents || []
  const food = worldState?.food || [] // O resources, dependiendo de tu backend
  const step = worldState?.step || 0

  // --- CÁLCULOS EN TIEMPO REAL ---
  const totalAgents = agents.length
  const totalFood = food.length
  
  // Calcular energía promedio
  const totalEnergy = agents.reduce((acc, curr) => acc + (curr.energy || 0), 0)
  const avgEnergy = totalAgents > 0 ? Math.round(totalEnergy / totalAgents) : 0

  return (
    <div className="w-72 bg-zinc-900 border-l border-zinc-800 flex flex-col h-full font-sans text-zinc-100">
      
      {/* Encabezado */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-950/50">
        <h2 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wide text-zinc-400">
          <Activity className="text-blue-500" size={16}/>
          Estadísticas en Vivo
        </h2>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto flex-1">
        
        {/* Tarjeta: Paso Actual */}
        <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 flex justify-between items-center">
            <div>
                <p className="text-[10px] uppercase text-zinc-500 font-bold">Tick Actual</p>
                <p className="text-xl font-mono text-white">{step}</p>
            </div>
            <Clock className="text-zinc-600" size={20}/>
        </div>

        {/* Tarjeta: Agentes */}
        <StatCard 
          icon={Users} 
          label="Población" 
          value={totalAgents} 
          subtext="Agentes vivos"
          color="text-blue-400"
          bgColor="bg-blue-500/10"
          borderColor="border-blue-500/20"
        />

        {/* Tarjeta: Energía Promedio */}
        <StatCard 
          icon={Zap} 
          label="Energía Promedio" 
          value={`${avgEnergy}%`} 
          subtext={avgEnergy < 20 ? "¡Crítico!" : "Estable"}
          color={avgEnergy < 20 ? "text-red-400" : "text-yellow-400"}
          bgColor={avgEnergy < 20 ? "bg-red-500/10" : "bg-yellow-500/10"}
          borderColor={avgEnergy < 20 ? "border-red-500/20" : "border-yellow-500/20"}
        />

        {/* Tarjeta: Comida Disponible */}
        <StatCard 
          icon={Apple} 
          label="Recursos" 
          value={totalFood} 
          subtext="Unidades en mapa"
          color="text-emerald-400"
          bgColor="bg-emerald-500/10"
          borderColor="border-emerald-500/20"
        />
      </div>
      
      {/* Pie: Logs Rápidos (Simulados o Reales) */}
      <div className="h-1/3 border-t border-zinc-800 bg-black/20 p-4 flex flex-col">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Logs del Sistema</h3>
        <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-0 overflow-y-auto font-mono text-[10px] space-y-1 text-zinc-400">
                <p>> Sistema iniciado.</p>
                <p>> Esperando comandos...</p>
                {step > 0 && <p>> Simulación corriendo: Paso {step}</p>}
                {totalAgents === 0 && step > 10 && <p className="text-red-400">> Alerta: Extinción total.</p>}
            </div>
        </div>
      </div>
    </div>
  )
}

// Componente auxiliar para las tarjetas
const StatCard = ({ icon: Icon, label, value, subtext, color, bgColor, borderColor }) => (
  <div className={`p-4 rounded-lg border ${borderColor} ${bgColor} transition-all hover:brightness-110`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{label}</p>
        <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
        {subtext && <p className="text-[10px] text-zinc-500 mt-0.5">{subtext}</p>}
      </div>
      <div className={`p-2 rounded-md bg-zinc-900/40 ${color}`}>
        <Icon size={18} />
      </div>
    </div>
  </div>
)

export default StatsPanel