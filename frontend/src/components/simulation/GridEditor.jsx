"use client"
import React, { useState } from "react"
import { useSimulation } from "../../context/SimulationContext" 

import Sidebar from "./Sidebar"
import GridCanvas from "./GridCanvas"
import SimulationControls from "./SimulationControls"
import RightPanel from "./RightPanel"

const GridEditor = () => {
  const { sendMessage, gridConfig } = useSimulation()
  
  // Valores por defecto seguros para evitar errores antes de cargar la config
  const width = gridConfig?.width || 25
  const height = gridConfig?.height || 25
  const cellSize = gridConfig?.cellSize || 20 

  const [isDraggingOver, setIsDraggingOver] = useState(false)

  // --- LÓGICA DE DROP ---
  const handleDrop = (e) => {
    e.preventDefault()
    setIsDraggingOver(false)

    try {
      const rawData = e.dataTransfer.getData("application/json")
      if (!rawData) return;
      
      const data = JSON.parse(rawData)
      const rect = e.currentTarget.getBoundingClientRect()
      
      // CAMBIO CLAVE PARA SCROLL: 
      // Calculamos la posición relativa al contenedor visible, no a la ventana.
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;
      
      const x = Math.floor(offsetX / cellSize)
      const y = Math.floor(offsetY / cellSize)

      // Verificamos límites
      if (x >= 0 && x < width && y >= 0 && y < height) {
        
        let messageType = "ADD_AGENT"
        if (data.type === "obstacle") messageType = "ADD_OBSTACLE"
        if (data.type === "resource") messageType = "ADD_FOOD"

        const payload = { 
            type: messageType,
            data: { 
                x, 
                y, 
                agent_type: data.subtype, 
                // Enviamos el subtipo para que el canvas sepa qué icono pintar (Manzana/Rayo)
                food_type: data.subtype,  
                config: data.config       
            }
        };
        sendMessage(payload)
      }
    } catch (error) {
      console.error("Error en Drop:", error)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
    setIsDraggingOver(true)
  }

  return (
    <div className="flex h-full w-full bg-zinc-950 text-white overflow-hidden">
      {/* 1. Sidebar Izquierdo */}
      <Sidebar />

      {/* 2. Área Central */}
      <div className="flex-1 flex flex-col relative h-full">
        {/* Barra superior de controles */}
        <div className="p-2 border-b border-zinc-800 bg-zinc-900/95 backdrop-blur z-20 flex justify-center shrink-0">
          <SimulationControls />
        </div>

        {/* ÁREA DE SCROLL 
            El padre tiene overflow-auto para permitir moverse si el grid es gigante.
        */}
        <div className="flex-1 overflow-auto bg-black/50 p-8 relative flex items-center justify-center">
          
          {/* CONTENEDOR DE DROP (Wrapper del Canvas) */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={handleDrop}
            // ESTILOS CRÍTICOS PARA EL FUNCIONAMIENTO DEL GRID GRANDE:
            style={{
                width: width * cellSize,
                height: height * cellSize,
                minWidth: width * cellSize,   // Fuerza el scroll horizontal
                minHeight: height * cellSize, // Fuerza el scroll vertical
            }}
            className={`relative transition-all duration-200 border-2 shadow-2xl ${
              isDraggingOver 
                ? "border-blue-500 bg-blue-500/10 scale-[1.01]" 
                : "border-zinc-800 bg-zinc-900"
            }`}
          >
            <GridCanvas />
            
            {/* Capa invisible para asegurar que el evento Drop se detecte correctamente */}
            <div className="absolute inset-0 z-10" />
          </div>

        </div>
      </div>

      {/* 3. Panel Derecho */}
      <RightPanel />
    </div>
  )
}

export default GridEditor