"use client"
import React, { useState, useEffect } from "react"
import { Play, Save, Terminal } from "lucide-react"
import { useSimulation } from "../../context/SimulationContext"

const CodeEditor = () => {
  const { code, dispatch, sendMessage } = useSimulation()
  const [localCode, setLocalCode] = useState(code || "# Escribe tu lógica de agente aquí\n\ndef agent_decision(agent, sensors):\n    pass")
  const [consoleOutput, setConsoleOutput] = useState([])

  // Sincronizar si el contexto cambia externamente
  useEffect(() => {
    if (code) setLocalCode(code)
  }, [code])

  const handleCodeChange = (e) => {
    setLocalCode(e.target.value)
    // Actualizamos el contexto global
    dispatch({ type: "SET_CODE", payload: e.target.value })
  }

  const handleRunCode = () => {
    setConsoleOutput(prev => [...prev, "> Enviando código al sandbox..."])
    // Enviamos el código al backend para ser procesado
    sendMessage({ 
        type: "UPLOAD_CODE", 
        data: { code: localCode } 
    })
  }

  return (
    <div className="flex flex-col h-full bg-zinc-900 text-zinc-100 font-mono text-sm">
      
      {/* Barra de Herramientas del Editor */}
      <div className="flex items-center justify-between p-2 border-b border-zinc-800 bg-zinc-950">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Terminal size={14} />
            <span>main.py</span>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={handleRunCode}
                className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded transition font-bold"
            >
                <Play size={12} fill="currentColor"/> Ejecutar
            </button>
        </div>
      </div>

      {/* Área de Texto (Input) */}
      <div className="flex-1 relative">
        <textarea
            value={localCode}
            onChange={handleCodeChange}
            className="w-full h-full bg-[#0d1117] text-zinc-300 p-4 resize-none outline-none font-mono text-xs leading-5 border-none"
            spellCheck="false"
            placeholder="Escribe tu código Python aquí..."
        />
      </div>

      {/* Consola de Salida (Simulada) */}
      <div className="h-1/3 border-t border-zinc-800 bg-black flex flex-col">
        <div className="px-3 py-1 border-b border-zinc-800 bg-zinc-900/50 text-[10px] uppercase text-zinc-500 font-bold">
            Consola / Logs
        </div>
        <div className="flex-1 p-2 overflow-y-auto space-y-1">
            {consoleOutput.length === 0 && <span className="text-zinc-600 italic text-xs">Esperando ejecución...</span>}
            {consoleOutput.map((log, i) => (
                <div key={i} className="text-xs text-emerald-400">{log}</div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default CodeEditor