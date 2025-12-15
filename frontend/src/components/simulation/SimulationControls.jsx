"use client"
import React, { useState } from "react"
import { Play, Pause, Square, RotateCcw, SkipForward, Gauge } from "lucide-react"
import { useSimulation } from "../../context/SimulationContext"

const SimulationControls = () => {
  // 1. Obtenemos todo del Contexto (incluyendo sendMessage)
  const { isRunning, setIsRunning, worldState, sendMessage } = useSimulation()
  
  // Estado local para la UI de velocidad
  const [speedMultiplier, setSpeedMultiplier] = useState(1)

  // --- MANEJADORES ---

  const handleStart = () => {
    sendMessage({ type: "START" })
    setIsRunning(true)
  }

  const handlePause = () => {
    sendMessage({ type: "PAUSE" })
    setIsRunning(false)
  }

  const handleStop = () => {
    sendMessage({ type: "STOP" })
    setIsRunning(false)
  }

  const handleReset = () => {
    // 1. Detenemos localmente
    setIsRunning(false)
    // 2. Enviamos comando de limpieza al backend
    sendMessage({ type: "RESET" })
  }

  const handleStep = () => {
    // Avanzar un solo frame (útil para debug)
    sendMessage({ type: "STEP" })
  }

  const handleSpeedChange = (val) => {
    setSpeedMultiplier(val)
    sendMessage({ type: "SET_SPEED", data: { speed: val } })
  }

  return (
    <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 p-2 rounded-lg shadow-xl">
      
      {/* --- GRUPO 1: CONTROLES PRINCIPALES --- */}
      <div className="flex items-center gap-2">
        {!isRunning ? (
          <button 
            onClick={handleStart} 
            className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded transition shadow-lg shadow-emerald-900/20"
          >
            <Play size={16} fill="currentColor" /> Iniciar
          </button>
        ) : (
          <button 
            onClick={handlePause} 
            className="flex items-center gap-2 px-4 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded transition shadow-lg shadow-yellow-900/20"
          >
            <Pause size={16} fill="currentColor" /> Pausar
          </button>
        )}

        <button 
          onClick={handleStop} 
          className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded transition"
          title="Detener"
        >
          <Square size={16} fill="currentColor" />
        </button>

        {/* BOTÓN RESET (La flecha circular) */}
        <button 
          onClick={handleReset} 
          className="p-2 text-zinc-400 hover:text-blue-400 hover:bg-zinc-800 rounded transition"
          title="Reiniciar Simulación"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      <div className="w-px h-6 bg-zinc-700"></div>

      {/* --- GRUPO 2: VELOCIDAD Y PASOS --- */}
      <div className="flex items-center gap-4">
         <button 
            onClick={handleStep} 
            disabled={isRunning} 
            className="flex items-center gap-2 text-zinc-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
            title="Avanzar un paso"
        >
            <SkipForward size={18} />
        </button>
        
        {/* Selector de Velocidad */}
        <div className="flex items-center gap-1 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
            <Gauge size={14} className="text-zinc-500 mr-1"/>
            {[0.5, 1, 2, 5].map(v => (
                <button 
                    key={v}
                    onClick={() => handleSpeedChange(v)}
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition ${
                        speedMultiplier === v 
                        ? 'bg-blue-600 text-white' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                    {v}x
                </button>
            ))}
        </div>
      </div>

       {/* Step Counter */}
       <div className="ml-2 font-mono text-zinc-500 text-xs border-l border-zinc-700 pl-3">
          STEP: <span className="text-emerald-400 font-bold">{worldState?.step || 0}</span>
       </div>
    </div>
  )
}

export default SimulationControls