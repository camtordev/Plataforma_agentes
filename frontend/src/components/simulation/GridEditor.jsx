"use client";
import React, { useState } from "react";
import { useSimulation } from "../../context/SimulationContext";

import Sidebar from "./Sidebar";
import GridCanvas from "./GridCanvas";
import SimulationControls from "./SimulationControls";
import RightPanel from "./RightPanel";

const GridEditor = ({ hideControls = false }) => {
  const { sendMessage, gridConfig, isReadOnly } = useSimulation();

  // Valores por defecto seguros
  const width = gridConfig?.width || 25;
  const height = gridConfig?.height || 25;
  const cellSize = gridConfig?.cellSize || 20;

  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // --- NUEVO: Estado para saber qué ítem pintar con el Pincel ---
  // Por defecto empezamos con un obstáculo estático
  const [activeBrushItem, setActiveBrushItem] = useState({
    type: "obstacle",
    subtype: "static",
    config: { isDestructible: false, destructionCost: 20 },
  });

  // --- LÓGICA DE DROP (Mantenemos tu versión corregida) ---
  const handleDrop = (e) => {
    e.preventDefault();
    if (isReadOnly) {
      setIsDraggingOver(false);
      return;
    }
    setIsDraggingOver(false);

    try {
      const rawData = e.dataTransfer.getData("application/json");
      if (!rawData) return;

      const data = JSON.parse(rawData);
      const rect = e.currentTarget.getBoundingClientRect();

      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;

      const x = Math.floor(offsetX / cellSize);
      const y = Math.floor(offsetY / cellSize);

      if (x >= 0 && x < width && y >= 0 && y < height) {
        let messageType = "ADD_AGENT";
        if (data.type === "obstacle") messageType = "ADD_OBSTACLE";
        if (data.type === "resource") messageType = "ADD_FOOD";

        const payload = {
          type: messageType,
          data: {
            x,
            y,
            agent_type: data.subtype,
            subtype: data.subtype,
            food_type: data.subtype,
            config: data.config,
          },
        };
        sendMessage(payload);
      }
    } catch (error) {
      console.error("Error en Drop:", error);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (isReadOnly) return;
    e.dataTransfer.dropEffect = "copy";
    setIsDraggingOver(true);
  };

  return (
    <div className="flex h-full w-full bg-zinc-950 text-white overflow-hidden">
      {/* 1. CAMBIO: Pasamos la función para recibir el ítem seleccionado */}
      <Sidebar onSelectElement={setActiveBrushItem} />

      {/* 2. Área Central */}
      <div className="flex-1 flex flex-col relative h-full min-h-0">
        {!hideControls && (
          <div className="p-2 border-b border-zinc-800 bg-zinc-900/95 backdrop-blur z-20 flex justify-center shrink-0">
            <SimulationControls />
          </div>
        )}

        <div className="flex-1 overflow-auto bg-black/50 p-8 relative flex items-center justify-center">
          <div
            onDragOver={handleDragOver}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={handleDrop}
            style={{
              width: width * cellSize,
              height: height * cellSize,
              minWidth: width * cellSize,
              minHeight: height * cellSize,
            }}
            className={`relative transition-all duration-200 border-2 shadow-2xl ${
              isDraggingOver
                ? "border-blue-500 bg-blue-500/10 scale-[1.01]"
                : "border-zinc-800 bg-zinc-900"
            }`}
          >
            {/* 2. CAMBIO: Pasamos el ítem activo al Canvas para que sepa qué pintar */}
            <GridCanvas activeBrushItem={activeBrushItem} />
          </div>
        </div>
      </div>

      <RightPanel />
    </div>
  );
};

export default GridEditor;
