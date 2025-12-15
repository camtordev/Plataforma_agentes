"use client"
import React, { useState } from "react"
import { Activity, Code2 } from "lucide-react"
import StatsPanel from "./StatsPanel"
import CodeEditor from "../editor/CodeEditor"

const RightPanel = () => {
  const [activeTab, setActiveTab] = useState("stats")

  return (
    // CAMBIO AQUÍ: Cambié 'w-80' por 'w-[450px]' (puedes poner 500px si quieres más)
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
      <div className="flex-1 overflow-hidden relative">
        {activeTab === "stats" ? (
          <div className="h-full w-full">
            <StatsPanel />
          </div>
        ) : (
          <div className="h-full w-full">
            <CodeEditor />
          </div>
        )}
      </div>

    </div>
  )
}

export default RightPanel