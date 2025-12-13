import React from "react";
import { 
  Bot, Apple, Square, Eraser, Settings2, 
  Grid3x3, MousePointer2 
} from "lucide-react";
import { useSimulation } from "../../context/SimulationContext";
import { useSocket } from "../../hooks/useSocket"; 

const elements = [
  { type: "agent", label: "Agente", icon: Bot, color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/50" },
  { type: "food", label: "Comida", icon: Apple, color: "text-pink-500 bg-pink-500/10 border-pink-500/50" },
  { type: "obstacle", label: "Obstáculo", icon: Square, color: "text-gray-400 bg-gray-400/10 border-gray-400/50" },
];

export function Sidebar() {
  const { 
    selectedTool, setSelectedTool, 
    gridConfig, agentConfig, simulationConfig, 
    dispatch, isRunning // Asegúrate de tener isRunning del contexto para bloquear cambios si corre
  } = useSimulation();
  
  const { sendMessage } = useSocket();

  // --- 1. MANEJO DE CONFIGURACIÓN DE SIMULACIÓN ---
  const handleSimConfigChange = (key, value) => {
    const newConfig = { ...simulationConfig, [key]: value };
    dispatch({ type: "SET_SIMULATION_CONFIG", payload: newConfig });
    sendMessage({ type: "UPDATE_CONFIG", data: newConfig });
  };

  // --- 2. MANEJO DE CONFIGURACIÓN DE AGENTE ---
  const handleAgentConfigChange = (key, value) => {
    dispatch({ type: "SET_AGENT_CONFIG", payload: { [key]: value } });
  };

  // --- 3. MANEJO DE DRAG & DROP ---
  const handleDragStart = (e, type) => {
    e.dataTransfer.setData("elementType", type);
    if (type === 'agent') {
        e.dataTransfer.setData("agentType", agentConfig.type);
        e.dataTransfer.setData("agentStrategy", agentConfig.strategy);
    }
  };

  // --- 4. NUEVO: MANEJO DEL GRID ---
  const handleGridResize = (dimension, value) => {
    const newValue = parseInt(value, 10);
    // Creamos la nueva configuración combinando lo actual
    const newGridConfig = { 
        ...gridConfig, 
        [dimension]: newValue 
    };

    // 1. Actualizamos visualmente rápido (Optimistic UI)
    dispatch({ type: "SET_GRID_CONFIG", payload: newGridConfig });

    // 2. Enviamos el comando al Backend
    // El backend espera: { type: "RESIZE_GRID", data: { width, height } }
    sendMessage({
        type: "RESIZE_GRID",
        data: {
            width: newGridConfig.width,
            height: newGridConfig.height
        }
    });
  };

  return (
    <aside className="w-72 border-r border-zinc-800 bg-zinc-900 flex flex-col h-full overflow-y-auto">
      
      {/* SECCIÓN 1: ELEMENTOS */}
      <div className="p-4 border-b border-zinc-800">
        <h3 className="font-semibold text-sm mb-3 text-zinc-100">Elementos</h3>
        <div className="grid grid-cols-3 gap-2">
          {elements.map((el) => (
            <div
              key={el.type}
              draggable
              onDragStart={(e) => handleDragStart(e, el.type)}
              onClick={() => setSelectedTool(el.type)}
              className={`flex flex-col items-center p-2 rounded border cursor-grab active:cursor-grabbing transition-all ${
                selectedTool === el.type 
                  ? el.color 
                  : "border-transparent bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              <el.icon className="h-5 w-5 mb-1" />
              <span className="text-[10px] font-medium">{el.label}</span>
            </div>
          ))}
           {/* Herramienta Borrador */}
           <button
              onClick={() => setSelectedTool("eraser")}
              className={`flex flex-col items-center p-2 rounded border transition-all ${
                selectedTool === "eraser" ? "bg-red-500/20 border-red-500 text-red-400" : "border-transparent bg-zinc-800 text-zinc-400"
              }`}
            >
              <Eraser className="h-5 w-5 mb-1" />
              <span className="text-[10px]">Borrar</span>
            </button>
        </div>
      </div>

      {/* SECCIÓN 2: CONFIGURACIÓN DEL GRID (AGREGADA) */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
        <h3 className="font-semibold text-sm mb-3 text-zinc-100 flex items-center gap-2">
            <Grid3x3 size={14}/> Tamaño del Mapa
        </h3>
        
        <div className="space-y-4">
            {/* Slider Ancho */}
            <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-1">
                    <span>Ancho (X)</span>
                    <span className="text-zinc-200">{gridConfig.width}</span>
                </div>
                <input 
                    type="range" 
                    min="10" max="50" 
                    value={gridConfig.width}
                    disabled={isRunning} // Deshabilitar si corre la simulación
                    onChange={(e) => handleGridResize("width", e.target.value)}
                    className="w-full accent-blue-500 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
            </div>

            {/* Slider Alto */}
            <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-1">
                    <span>Alto (Y)</span>
                    <span className="text-zinc-200">{gridConfig.height}</span>
                </div>
                <input 
                    type="range" 
                    min="10" max="50" 
                    value={gridConfig.height}
                    disabled={isRunning}
                    onChange={(e) => handleGridResize("height", e.target.value)}
                    className="w-full accent-blue-500 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
            </div>
        </div>
      </div>

      {/* SECCIÓN 3: CONFIGURACIÓN DEL AGENTE */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
        <h3 className="font-semibold text-sm mb-3 text-zinc-100 flex items-center gap-2">
            <Settings2 size={14}/> Configuración de Agente
        </h3>
        
        <div className="space-y-3">
            <div>
                <label className="text-xs text-zinc-400 block mb-1">Tipo de Comportamiento</label>
                <select 
                    value={agentConfig.type}
                    onChange={(e) => handleAgentConfigChange("type", e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs rounded p-2 focus:border-blue-500 outline-none"
                >
                    <option value="reactive">Reactivo (Simple)</option>
                    <option value="goal_based">Basado en Objetivos (Planificador)</option>
                    <option value="random">Aleatorio (Errático)</option>
                </select>
            </div>

            {/* Solo mostramos Estrategia si es Goal Based */}
            {agentConfig.type === 'goal_based' && (
                <div>
                    <label className="text-xs text-zinc-400 block mb-1">Estrategia de Búsqueda</label>
                    <select 
                        value={agentConfig.strategy}
                        onChange={(e) => handleAgentConfigChange("strategy", e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs rounded p-2 focus:border-blue-500 outline-none"
                    >
                        <option value="bfs">Amplitud (BFS)</option>
                        <option value="dfs">Profundidad (DFS)</option>
                        <option value="a_star">A* (A Star)</option>
                    </select>
                </div>
            )}
        </div>
      </div>

      {/* SECCIÓN 4: LÍMITES */}
      <div className="p-4 border-b border-zinc-800">
        <h3 className="font-semibold text-sm mb-3 text-zinc-100">Límites de Simulación</h3>
        
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-xs text-zinc-300">Pasos Ilimitados</label>
                <input 
                    type="checkbox" 
                    checked={simulationConfig.isUnlimited}
                    onChange={(e) => handleSimConfigChange("isUnlimited", e.target.checked)}
                    className="accent-blue-500 h-4 w-4"
                />
            </div>

            {!simulationConfig.isUnlimited && (
                <div>
                    <label className="text-xs text-zinc-400 block mb-1">Detener en paso:</label>
                    <div className="flex gap-2">
                        <input 
                            type="number" 
                            value={simulationConfig.maxSteps}
                            onChange={(e) => handleSimConfigChange("maxSteps", parseInt(e.target.value))}
                            className="w-full bg-zinc-950 border border-zinc-700 text-white text-xs rounded p-2"
                        />
                        <button 
                            onClick={() => handleSimConfigChange("maxSteps", simulationConfig.maxSteps + 50)}
                            className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs px-2 rounded border border-zinc-600"
                        >
                            +50
                        </button>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                <label className="text-xs text-zinc-300">Detener si no hay comida</label>
                <input 
                    type="checkbox" 
                    checked={simulationConfig.stopOnFood}
                    onChange={(e) => handleSimConfigChange("stopOnFood", e.target.checked)}
                    className="accent-green-500 h-4 w-4"
                />
            </div>
        </div>
      </div>
    </aside>
  );
}