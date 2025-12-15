"use client"
import React, { useState } from "react"
import { Activity, Code2, BookOpen, Copy } from "lucide-react"
import StatsPanel from "./StatsPanel"
// import CodeEditor from "../editor/CodeEditor" // Lo reemplazamos por el visor directo para este paso
import { useSimulation } from "../../context/SimulationContext"

const RightPanel = () => {
  const [activeTab, setActiveTab] = useState("code") // Por defecto en 'code' para ver el efecto inmediato
  
  // 1. Obtenemos la plantilla seleccionada del contexto global
  const { selectedTemplate } = useSimulation()

  const handleCopyCode = () => {
    if (selectedTemplate?.code) {
        navigator.clipboard.writeText(selectedTemplate.code);
        // Aquí podrías poner un toast de "Copiado"
    }
  }

  return (
    // Ancho aumentado a 450px como pediste
    <div className="w-[450px] h-full bg-zinc-900 border-l border-zinc-800 flex flex-col overflow-hidden transition-all duration-300">
      
      {/* --- TABS --- */}
      <div className="flex border-b border-zinc-800 bg-zinc-950 shrink-0">
        <button
          onClick={() => setActiveTab("stats")}
          className={`flex-1 py-3 text-xs font-medium uppercase tracking-wide flex items-center justify-center gap-2 transition-colors ${
            activeTab === "stats"
              ? "text-blue-400 border-b-2 border-blue-500 bg-zinc-800/30"
              : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
          }`}
        >
          <Activity size={14} /> Estadísticas
        </button>
        
        <button
          onClick={() => setActiveTab("code")}
          className={`flex-1 py-3 text-xs font-medium uppercase tracking-wide flex items-center justify-center gap-2 transition-colors ${
            activeTab === "code"
              ? "text-blue-400 border-b-2 border-blue-500 bg-zinc-800/30"
              : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
          }`}
        >
          <Code2 size={14} /> Editor
        </button>
      </div>

      {/* --- CONTENIDO --- */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        {activeTab === "stats" ? (
          <div className="h-full w-full overflow-y-auto">
            <StatsPanel />
          </div>
        ) : (
          // --- VISTA DE CÓDIGO / PLANTILLA ---
          <div className="flex flex-col h-full bg-[#1e1e1e]">
            
            {/* Cabecera de la Plantilla (Título y Descripción) */}
            <div className="p-4 border-b border-zinc-800 bg-zinc-900 shadow-sm shrink-0">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <BookOpen size={16} className="text-blue-400"/>
                        <h2 className="font-bold text-zinc-100 text-sm">
                            {selectedTemplate?.title || "Selecciona un Agente"}
                        </h2>
                    </div>
                    {/* Botón Copiar */}
                    <button 
                        onClick={handleCopyCode}
                        className="p-1.5 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white transition-colors" 
                        title="Copiar código"
                    >
                        <Copy size={14}/>
                    </button>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                    {selectedTemplate?.description || "Haz clic en una tarjeta de herramienta o un agente en el mapa para ver su lógica interna."}
                </p>
            </div>

            {/* Editor (Solo Lectura por ahora) */}
            <div className="flex-1 overflow-auto p-4 font-mono text-xs custom-scrollbar">
                {selectedTemplate?.code ? (
                    <pre className="text-zinc-300 whitespace-pre-wrap leading-relaxed">
                        <code className={`language-${selectedTemplate.language || 'python'}`}>
                            {selectedTemplate.code}
                        </code>
                    </pre>
                ) : (
                    <div className="h-full flex items-center justify-center text-zinc-600 italic">
                        Sin código para mostrar
                    </div>
                )}
            </div>

            {/* Footer del editor */}
            <div className="p-2 border-t border-zinc-800 bg-zinc-900 text-center shrink-0">
                <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
                    {selectedTemplate?.language || "Texto"} • Solo Lectura
                </span>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

export default RightPanel