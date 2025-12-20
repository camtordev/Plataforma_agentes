"use client";
import React, { useState } from "react";
import {
  Bot,
  Apple,
  Box,
  Zap,
  Settings2,
  Shield,
  Eye,
  Grid3x3,
  Clock,
  MousePointer2,
  Brush,
  Eraser,
  BoxSelect,
  Activity,
  Users,
  Swords,
  BrainCircuit,
  TerminalSquare,
} from "lucide-react";
import { useSimulation } from "../../context/SimulationContext";
import PropertyConfigModal from "./PropertyConfigModal";

// --- A. DEFINICIÓN DE MODOS DE HERRAMIENTA ---
const TOOL_MODES = [
  { id: "select", label: "Seleccionar", icon: MousePointer2 },
  { id: "brush", label: "Pincel", icon: Brush },
  { id: "eraser", label: "Borrador", icon: Eraser },
  { id: "multiselect", label: "Sel. Múltiple", icon: BoxSelect },
];

// --- B. DEFINICIÓN DE ELEMENTOS ARRASTRABLES (LISTA COMPLETA) ---
const INITIAL_ELEMENTS = [
  // 1. Agente Reactivo
  {
    id: "agent-reactive",
    type: "agent",
    subtype: "reactive",
    label: "Reactivo",
    icon: Activity,
    color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    defaultConfig: { speed: 5, initialEnergy: 80, color: "#a855f7" },
  },
  // 2. Agente Explorador (Memoria)
  {
    id: "agent-explorer",
    type: "agent",
    subtype: "explorer",
    label: "Explorador",
    icon: Eye,
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    defaultConfig: {
      speed: 5,
      visionRadius: 5,
      initialEnergy: 100,
      color: "#60a5fa",
    },
  },
  // 3. Agente Recolector (Planificador)
  {
    id: "agent-collector",
    type: "agent",
    subtype: "collector",
    label: "Recolector",
    icon: Bot,
    color: "text-green-400 bg-green-500/10 border-green-500/20",
    defaultConfig: {
      speed: 3,
      visionRadius: 3,
      initialEnergy: 150,
      color: "#4ade80",
    },
  },
  // 4. Agente Cooperativo
  {
    id: "agent-coop",
    type: "agent",
    subtype: "cooperative",
    label: "Cooperativo",
    icon: Users,
    color: "text-teal-400 bg-teal-500/10 border-teal-500/20",
    defaultConfig: { speed: 4, initialEnergy: 120, color: "#2dd4bf" },
  },
  // 5. Agente Competitivo
  {
    id: "agent-comp",
    type: "agent",
    subtype: "competitive",
    label: "Competitivo",
    icon: Swords,
    color: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    defaultConfig: { speed: 6, initialEnergy: 100, color: "#fb923c" },
  },
  // 6. Agente Q-Learning
  {
    id: "agent-rl",
    type: "agent",
    subtype: "q_learning",
    label: "Q-Learning",
    icon: BrainCircuit,
    color: "text-pink-400 bg-pink-500/10 border-pink-500/20",
    defaultConfig: {
      speed: 5,
      initialEnergy: 100,
      color: "#f472b6",
      epsilon: 0.1,
      alpha: 0.5,
      gamma: 0.9,
    },
  },
  // 7. Agente Personalizado
  {
    id: "agent-custom",
    type: "agent",
    subtype: "custom",
    label: "Personalizado",
    icon: TerminalSquare,
    color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    defaultConfig: { speed: 5, initialEnergy: 100, color: "#6366f1" },
  },

  // --- RECURSOS Y OBSTÁCULOS ---
  {
    id: "res-food",
    type: "resource",
    subtype: "food",
    label: "Comida",
    icon: Apple,
    color: "text-red-400 bg-red-500/10 border-red-500/20",
    defaultConfig: { nutritionValue: 20 },
  },
  {
    id: "res-energy",
    type: "resource",
    subtype: "energy",
    label: "Batería",
    icon: Zap,
    color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    defaultConfig: { nutritionValue: 50 },
  },
  {
    id: "obs-static",
    type: "obstacle",
    subtype: "static",
    label: "Estático",
    icon: Box,
    color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
    defaultConfig: { isDestructible: false, destructionCost: 20 },
  },
  {
    id: "obs-dynamic",
    type: "obstacle",
    subtype: "dynamic",
    label: "Dinámico",
    icon: Shield,
    color: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    defaultConfig: { isDestructible: true, destructionCost: 5 },
  },
];

export default function Sidebar({ onSelectElement }) {
  // Recibimos la prop del padre
  const [elementsList, setElementsList] = useState(INITIAL_ELEMENTS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState("elements");

  const {
    gridConfig,
    simulationConfig,
    dispatch,
    sendMessage,
    isRunning,
    selectedTool,
    setSelectedTool,
    setTemplateByType,
  } = useSimulation();

  if (isReadOnly) {
    return null;
  }

  const handleDragStart = (e, element) => {
    if (selectedTool === "eraser") {
      e.preventDefault();
      return;
    }
    if (selectedTool !== "brush") setSelectedTool("brush");

    // ACTUALIZAR PLANTILLA AL ARRASTRAR
    setTemplateByType(element.subtype, element.defaultConfig);

    // NOTIFICAR AL PADRE QUÉ ELEMENTO ESTAMOS USANDO (Para el pincel)
    if (onSelectElement) {
      onSelectElement({
        type: element.type,
        subtype: element.subtype,
        config: element.defaultConfig,
      });
    }

    e.dataTransfer.effectAllowed = "copy";
    const payload = {
      type: element.type,
      subtype: element.subtype,
      config: element.defaultConfig,
    };
    e.dataTransfer.setData("application/json", JSON.stringify(payload));
  };

  const openConfig = (id) => {
    setEditingId(id);
    setModalOpen(true);
  };

  const saveConfig = (newConfig) => {
    setElementsList((prev) =>
      prev.map((t) =>
        t.id === editingId ? { ...t, defaultConfig: newConfig } : t
      )
    );
    setModalOpen(false);
    setEditingId(null);
  };

  // --- MANEJO DE REDIMENSIÓN DE GRID ---
  const handleGridResize = (dimension, value) => {
    const newValue = parseInt(value, 10);
    const newGridConfig = { ...gridConfig, [dimension]: newValue };
    dispatch({ type: "SET_GRID_CONFIG", payload: newGridConfig });

    sendMessage({
      type: "RESIZE_GRID",
      data: { width: newGridConfig.width, height: newGridConfig.height },
    });
  };

  // --- MANEJO DE CONFIGURACIÓN DE SIMULACIÓN ---
  const handleSimConfigChange = (key, value) => {
    const newConfig = { ...simulationConfig, [key]: value };
    dispatch({ type: "SET_SIMULATION_CONFIG", payload: newConfig });

    sendMessage({
      type: "UPDATE_CONFIG",
      data: newConfig,
    });
  };

  const currentEditingElement = elementsList.find((t) => t.id === editingId);

  return (
    <>
      <div className="w-72 h-full bg-zinc-900 border-r border-zinc-800 flex flex-col font-sans overflow-hidden">
        {/* HERRAMIENTAS SUPERIORES */}
        <div className="p-3 border-b border-zinc-800 bg-zinc-950/50">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase mb-2 px-1">
            Herramientas
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {TOOL_MODES.map((mode) => {
              const Icon = mode.icon;
              const isActive = selectedTool === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setSelectedTool(mode.id)}
                  title={mode.label}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                    isActive
                      ? "bg-green-600 border-green-500 text-white shadow-lg shadow-green-900/20"
                      : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-750 hover:text-zinc-200"
                  }`}
                >
                  <Icon size={20} className="mb-1" />
                </button>
              );
            })}
          </div>
          <div className="text-center mt-2">
            <span className="text-xs text-zinc-400 font-medium">
              Modo:{" "}
              <span className="text-green-400">
                {TOOL_MODES.find((m) => m.id === selectedTool)?.label}
              </span>
            </span>
          </div>
        </div>

        {/* PESTAÑAS (PALETA / AJUSTES) */}
        <div className="flex border-b border-zinc-800 shrink-0">
          <button
            onClick={() => setActiveTab("elements")}
            className={`flex-1 py-3 text-xs font-medium uppercase tracking-wide transition-colors ${
              activeTab === "elements"
                ? "text-blue-400 border-b-2 border-blue-500 bg-zinc-800/50"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Paleta
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 py-3 text-xs font-medium uppercase tracking-wide transition-colors ${
              activeTab === "settings"
                ? "text-blue-400 border-b-2 border-blue-500 bg-zinc-800/50"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Ajustes
          </button>
        </div>

        {/* CONTENIDO: ELEMENTOS (AGENTES, RECURSOS, OBSTÁCULOS) */}
        {activeTab === "elements" && (
          <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
            {["agent", "resource", "obstacle"].map((category) => (
              <div key={category} className="space-y-2">
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase px-1">
                  {category === "agent"
                    ? "Agentes"
                    : category === "resource"
                    ? "Recursos"
                    : "Obstáculos"}
                </h3>
                <div className="space-y-2">
                  {elementsList
                    .filter((t) => t.type === category)
                    .map((element) => {
                      const Icon = element.icon;
                      return (
                        <div
                          key={element.id}
                          className="relative group flex items-center"
                        >
                          <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, element)}
                            // ACTUALIZAR PLANTILLA Y PINCEL AL HACER CLIC
                            onClick={() => {
                              setTemplateByType(
                                element.subtype,
                                element.defaultConfig
                              );
                              if (onSelectElement) {
                                onSelectElement({
                                  type: element.type,
                                  subtype: element.subtype,
                                  config: element.defaultConfig,
                                });
                              }
                            }}
                            className={`flex-1 flex items-center gap-3 p-2.5 rounded-md border cursor-pointer active:cursor-grabbing transition-all hover:brightness-110 ${
                              element.color
                            } border-opacity-40 ${
                              selectedTool === "eraser"
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            <Icon size={18} className="shrink-0" />
                            <div className="overflow-hidden">
                              <span className="block text-sm font-medium text-zinc-200 truncate">
                                {element.label}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => openConfig(element.id)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg border border-zinc-700 z-10"
                          >
                            <Settings2 size={14} />
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CONTENIDO: AJUSTES GLOBALES */}
        {activeTab === "settings" && (
          <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
            {/* Mapa */}
            <div className="space-y-3 p-3 rounded-lg bg-zinc-950/50 border border-zinc-800/50">
              <h3 className="font-semibold text-xs text-zinc-400 flex items-center gap-2 uppercase">
                <Grid3x3 size={14} /> Mapa
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-zinc-400 mb-1">
                    <span>Ancho (X)</span>{" "}
                    <span className="text-zinc-200">
                      {gridConfig?.width || 20}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={gridConfig?.width || 20}
                    disabled={isRunning}
                    onChange={(e) => handleGridResize("width", e.target.value)}
                    className="w-full accent-blue-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-zinc-400 mb-1">
                    <span>Alto (Y)</span>{" "}
                    <span className="text-zinc-200">
                      {gridConfig?.height || 20}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={gridConfig?.height || 20}
                    disabled={isRunning}
                    onChange={(e) => handleGridResize("height", e.target.value)}
                    className="w-full accent-blue-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Límites */}
            <div className="space-y-3 p-3 rounded-lg bg-zinc-950/50 border border-zinc-800/50">
              <h3 className="font-semibold text-xs text-zinc-400 flex items-center gap-2 uppercase">
                <Clock size={14} /> Límites
              </h3>

              <div className="flex items-center justify-between">
                <label className="text-xs text-zinc-300">
                  Pasos Ilimitados
                </label>
                <input
                  type="checkbox"
                  checked={simulationConfig?.isUnlimited || false}
                  onChange={(e) =>
                    handleSimConfigChange("isUnlimited", e.target.checked)
                  }
                  className="accent-blue-500 h-4 w-4 rounded border-zinc-700 bg-zinc-800"
                />
              </div>

              <div className="flex items-center justify-between">
                <label
                  className="text-xs text-zinc-300"
                  title="Detiene la simulación si se acaba la comida"
                >
                  Detener al terminar comida
                </label>
                <input
                  type="checkbox"
                  checked={simulationConfig?.stopOnFood !== false}
                  onChange={(e) =>
                    handleSimConfigChange("stopOnFood", e.target.checked)
                  }
                  className="accent-blue-500 h-4 w-4 rounded border-zinc-700 bg-zinc-800"
                />
              </div>

              {!simulationConfig?.isUnlimited && (
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">
                    Máximo de Pasos
                  </label>
                  <input
                    type="number"
                    value={simulationConfig?.maxSteps || 100}
                    onChange={(e) =>
                      handleSimConfigChange(
                        "maxSteps",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full bg-zinc-900 border border-zinc-700 text-white text-xs rounded p-1.5 focus:border-blue-500 outline-none"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <PropertyConfigModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          type={currentEditingElement?.type}
          currentConfig={currentEditingElement?.defaultConfig}
          onSave={saveConfig}
          label={currentEditingElement?.label}
        />
      )}
    </>
  );
}
