"use client"
import React, { useState, useEffect } from "react"
import { Activity, Code2, BookOpen, Copy, Save, Play } from "lucide-react"
import Editor from "@monaco-editor/react" // <-- IMPORTANTE
import StatsPanel from "./StatsPanel"
import { useSimulation } from "../../context/SimulationContext"
import { getTemplate } from "../../templates/agentTemplates"

const RightPanel = () => {
  const [activeTab, setActiveTab] = useState("code")
  
  // Obtenemos la plantilla seleccionada y la función para enviar mensajes
  const { selectedTemplate, sendMessage, isRunning } = useSimulation()

  // Estado local para el código que se está editando en el momento
  const [editorCode, setEditorCode] = useState("")
  const [isDirty, setIsDirty] = useState(false) // Si hay cambios sin guardar

  // Efecto para cargar el código cuando cambia la selección
  useEffect(() => {
    if (selectedTemplate?.code) {
        setEditorCode(selectedTemplate.code);
        setIsDirty(false);
    } else {
        // Si no hay template seleccionado, cargar el default de custom
        const customDefault = getTemplate("custom");
        setEditorCode(customDefault.code);
        setIsDirty(false)
    }
  }, [selectedTemplate]);

  const handleEditorChange = (value) => {
    setEditorCode(value);
    setIsDirty(true);
  };

  // Función para GUARDAR el código personalizado
  const handleSaveCode = () => {
    // Solo permitimos guardar si es del tipo custom
    if (selectedTemplate?.type === 'custom') {
        console.log("Guardando código personalizado...");
        sendMessage({
            type: "UPDATE_AGENT_CODE",
            data: {
                // Necesitamos el ID del agente para saber a cuál actualizar.
                // NOTA: El sistema actual de plantillas no pasa el ID del agente, 
                // solo el tipo. Para que esto funcione al 100% con agentes individuales,
                // necesitaríamos refactorizar cómo se selecciona el agente.
                // 
                // POR AHORA: Este ejemplo asume que aplicamos el código a TODOS los
                // agentes de tipo 'custom' o que el backend maneja una "plantilla global".
                agent_type: "custom", 
                code: editorCode
            }
        });
        setIsDirty(false);
        // Opcional: Mostrar un toast de éxito
    } else {
        alert("Solo puedes editar el código del Agente Personalizado.");
        // Revertir cambios
        setEditorCode(selectedTemplate?.code || "");
        setIsDirty(false);
    }
  }

  const handleCopyCode = () => {
    if (editorCode) {
        navigator.clipboard.writeText(editorCode);
    }
  }

  // Determinamos si es editable
  const isEditable = selectedTemplate?.type === 'custom' || !selectedTemplate;

  return (
    <div className="w-[450px] h-full bg-zinc-900 border-l border-zinc-800 flex flex-col overflow-hidden transition-all duration-300 relative">
      
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
          className={`flex-1 py-3 text-xs font-medium uppercase tracking-wide flex items-center justify-center gap-2 transition-colors relative ${
            activeTab === "code"
              ? "text-blue-400 border-b-2 border-blue-500 bg-zinc-800/30"
              : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
          }`}
        >
          <Code2 size={14} /> Editor
          {isDirty && activeTab !== 'code' && <span className="absolute top-2 right-2 w-2 h-2 bg-yellow-500 rounded-full"></span>}
        </button>
      </div>

      {/* --- CONTENIDO --- */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        {activeTab === "stats" ? (
          <div className="h-full w-full overflow-y-auto">
            <StatsPanel />
          </div>
        ) : (
          // --- VISTA DE EDITOR ---
          <div className="flex flex-col h-full bg-[#1e1e1e]">
            
            {/* Cabecera y Botones de Acción */}
            <div className="p-3 border-b border-zinc-800 bg-zinc-900 shadow-sm shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                    <BookOpen size={16} className={isEditable ? "text-indigo-400" : "text-blue-400"}/>
                    <h2 className="font-bold text-zinc-100 text-sm truncate">
                        {selectedTemplate?.title || "Editor Personalizado"}
                    </h2>
                    {isDirty && <span className="text-xs text-yellow-500 italic ml-2">(Sin guardar)</span>}
                </div>
                
                <div className="flex items-center gap-1">
                    {/* Botón Guardar (Solo si es editable y hay cambios) */}
                    {isEditable && (
                        <button 
                            onClick={handleSaveCode}
                            disabled={!isDirty || isRunning}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                                isDirty && !isRunning
                                ? "bg-indigo-600 text-white hover:bg-indigo-500" 
                                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                            }`}
                            title="Aplicar cambios (Detén la simulación primero)"
                        >
                            <Save size={14}/> Aplicar
                        </button>
                    )}
                    <button 
                        onClick={handleCopyCode}
                        className="p-1.5 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white transition-colors" 
                        title="Copiar código"
                    >
                        <Copy size={14}/>
                    </button>
                </div>
            </div>
            
            {isEditable && (
                <div className="px-4 py-2 bg-indigo-500/10 border-b border-indigo-500/20 text-indigo-300 text-xs">
                    Modo edición activo. Escribe tu lógica en Python.
                </div>
            )}

            {/* EDITOR MONACO */}
            <div className="flex-1 overflow-hidden relative">
                <Editor
                    height="100%"
                    defaultLanguage="python"
                    language="python"
                    value={editorCode}
                    onChange={handleEditorChange}
                    theme="vs-dark"
                    options={{
                        readOnly: !isEditable || isRunning, // No editar mientras corre
                        minimap: { enabled: false },
                        fontSize: 12,
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                        padding: { top: 10 }
                    }}
                />
                 {isRunning && isEditable && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center z-10 pointer-events-none">
                        <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-700 flex items-center gap-2 text-yellow-400">
                            <Play size={16} className="animate-pulse"/> Simulación en curso. Pausa para editar.
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-zinc-800 bg-zinc-900 text-center shrink-0">
                <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
                    {isEditable ? "Python (Editable)" : "Solo Lectura"}
                </span>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

export default RightPanel