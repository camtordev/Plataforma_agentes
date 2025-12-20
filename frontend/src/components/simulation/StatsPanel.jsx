import React, { useState } from "react";
import { useSimulation } from "../../context/SimulationContext";
import {
  Activity,
  Apple,
  Zap,
  Users,
  Clock,
  Footprints,
  History,
} from "lucide-react";

const StatsPanel = () => {
  const { worldState } = useSimulation();
  const [activeTab, setActiveTab] = useState("general");

  const agents = worldState?.agents || [];
  const food = worldState?.food || [];
  const step = worldState?.step || 0;

  // --- CÁLCULOS GENERALES ---
  const totalAgents = agents.length;
  const totalFood = food.length;
  const totalEnergy = agents.reduce((acc, curr) => acc + (curr.energy || 0), 0);
  const avgEnergy = totalAgents > 0 ? Math.round(totalEnergy / totalAgents) : 0;

  return (
    <div className="flex flex-col h-full font-sans text-zinc-100 bg-zinc-900 w-full">
      {/* 1. SELECTOR DE PESTAÑAS */}
      <div className="flex bg-zinc-950 p-1 border-b border-zinc-800 shrink-0 gap-1">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex-1 text-xs py-2 rounded-md font-medium transition-all ${
            activeTab === "general"
              ? "bg-zinc-800 text-blue-400 shadow-sm"
              : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Activity size={14} /> Dashboard
          </div>
        </button>
        <button
          onClick={() => setActiveTab("agents")}
          className={`flex-1 text-xs py-2 rounded-md font-medium transition-all ${
            activeTab === "agents"
              ? "bg-zinc-800 text-blue-400 shadow-sm"
              : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Footprints size={14} /> Pasos
          </div>
        </button>
      </div>

      {/* CONTENIDO PRINCIPAL (SCROLL) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-700">
        {activeTab === "general" ? (
          // --- VISTA GENERAL (Tu diseño mejorado) ---
          <div className="space-y-4 h-full flex flex-col">
            {/* Tarjeta: Paso Actual */}
            <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 flex justify-between items-center shadow-sm">
              <div>
                <p className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">
                  Tick Actual
                </p>
                <p className="text-xl font-mono text-white tracking-widest">
                  {step}
                </p>
              </div>
              <Clock className="text-zinc-600" size={20} />
            </div>

            <div className="grid grid-cols-1 gap-3">
              {/* Población */}
              <StatCard
                icon={Users}
                label="Población"
                value={totalAgents}
                subtext="Agentes vivos"
                color="text-blue-400"
                bgColor="bg-blue-500/10"
                borderColor="border-blue-500/20"
              />

              {/* Energía */}
              <StatCard
                icon={Zap}
                label="Energía Prom."
                value={`${avgEnergy}%`}
                subtext={avgEnergy < 20 ? "¡Crítico!" : "Estable"}
                color={avgEnergy < 20 ? "text-red-400" : "text-yellow-400"}
                bgColor={avgEnergy < 20 ? "bg-red-500/10" : "bg-yellow-500/10"}
                borderColor={
                  avgEnergy < 20 ? "border-red-500/20" : "border-yellow-500/20"
                }
              />

              {/* Recursos */}
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

            {/* Logs del Sistema (Integrados al final) */}
            <div className="flex-1 min-h-[120px] border-t border-zinc-800 bg-black/20 -mx-4 -mb-4 p-4 flex flex-col mt-4">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase mb-2 flex items-center gap-2">
                <History size={10} /> Logs del Sistema
              </h3>
              <div className="flex-1 overflow-hidden relative">
                <div className="absolute inset-0 overflow-y-auto font-mono text-[10px] space-y-1 text-zinc-400 scrollbar-thin scrollbar-thumb-zinc-800">
                  <p>> Sistema iniciado.</p>
                  {step > 0 && (
                    <p className="text-blue-400/70">
                      > Simulación activa. Tick {step}
                    </p>
                  )}
                  {/* Mostramos eventos recientes simulados */}
                  {agents.map(
                    (a, i) =>
                      i < 2 && (
                        <p key={i}>> Agente {a.id.split("_")[1]} activo.</p>
                      )
                  )}
                  {agents.length === 0 && step > 5 && (
                    <p className="text-red-400">> Alerta: Población cero.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // --- VISTA DETALLE PASOS (Funcionalidad nueva) ---
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase">
                Historial por Agente
              </h3>
              <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                {totalAgents} Agentes
              </span>
            </div>

            {agents.map((agent) => (
              <div
                key={agent.id}
                className="bg-zinc-800/30 border border-zinc-800 rounded-lg p-3 text-xs hover:border-zinc-700 transition-colors"
              >
                {/* Cabecera Agente */}
                <div className="flex justify-between items-center mb-2 border-b border-zinc-800/50 pb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full shadow-[0_0_5px]"
                      style={{
                        background: agent.color,
                        boxShadow: `0 0 5px ${agent.color}`,
                      }}
                    ></div>
                    <span className="font-bold text-zinc-200 uppercase">
                      {agent.type}
                    </span>
                    <span className="text-zinc-600 font-mono text-[10px]">
                      #{agent.id.split("_")[1]}
                    </span>
                  </div>
                  <div className="bg-zinc-900 px-2 py-0.5 rounded text-blue-300 font-mono font-bold border border-zinc-800 text-[10px]">
                    {agent.steps || 0} pasos
                  </div>
                </div>

                {/* Historial (Rastro) */}
                <div className="text-zinc-500 mb-1 flex items-center gap-1 text-[10px] uppercase font-bold">
                  <Footprints size={10} /> <span>Últimos movimientos</span>
                </div>
                <div className="font-mono text-[10px] text-zinc-400 break-words leading-relaxed bg-black/30 p-2 rounded border border-zinc-800/50">
                  {agent.path && agent.path.length > 0 ? (
                    agent.path.slice(-8).map((pos, idx) => (
                      <span
                        key={idx}
                        className={
                          idx === agent.path.slice(-8).length - 1
                            ? "text-yellow-200 font-bold"
                            : ""
                        }
                      >
                        {idx > 0 && " → "}[{pos[0]},{pos[1]}]
                      </span>
                    ))
                  ) : (
                    <span className="italic text-zinc-600">Sin movimiento</span>
                  )}
                </div>
              </div>
            ))}
            {agents.length === 0 && (
              <div className="text-center py-8 text-zinc-600">
                <Users size={24} className="mx-auto mb-2 opacity-20" />
                <p>No hay agentes en la simulación.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Componente auxiliar para las tarjetas
const StatCard = ({
  icon: Icon,
  label,
  value,
  subtext,
  color,
  bgColor,
  borderColor,
}) => (
  <div
    className={`p-4 rounded-lg border ${borderColor} ${bgColor} transition-all hover:brightness-110`}
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
          {label}
        </p>
        <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
        {subtext && (
          <p className="text-[10px] text-zinc-500 mt-0.5 opacity-80">
            {subtext}
          </p>
        )}
      </div>
      <div
        className={`p-2 rounded-md bg-zinc-900/40 backdrop-blur-sm ${color}`}
      >
        <Icon size={18} />
      </div>
    </div>
  </div>
);

export default StatsPanel;
