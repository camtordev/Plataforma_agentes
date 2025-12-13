import React, { useState } from "react"
import { Play, Save, FileCode } from "lucide-react"

export function CodeEditor() {
  const [code, setCode] = useState(`// Comportamiento del Agente
function decidir(percepcion) {
    // Tu código aquí
    if (percepcion.energia < 20) {
        return "descansar";
    }
    return "mover_aleatorio";
}`);

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-gray-300">
      {/* Tabs superiores */}
      <div className="flex bg-[#252526] text-xs">
        <div className="px-3 py-2 bg-[#1e1e1e] text-white border-t-2 border-primary flex items-center gap-2">
            <FileCode className="h-3 w-3 text-yellow-500" />
            main.py
        </div>
      </div>

      {/* Área de texto simple (Reemplazaremos con Monaco luego si quieres) */}
      <textarea
        className="flex-1 bg-[#1e1e1e] p-4 font-mono text-sm resize-none focus:outline-none text-gray-200"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck="false"
      />

      {/* Barra de acciones inferior */}
      <div className="p-2 bg-[#252526] border-t border-[#3e3e42] flex justify-between">
        <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition">
            <Play className="h-3 w-3" /> Ejecutar
        </button>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition">
            <Save className="h-3 w-3" /> Guardar
        </button>
      </div>
    </div>
  )
}