import React, { useRef } from "react";
import { Stage, Layer, Rect, Circle, Line } from "react-konva";
import { useSimulation } from "../../context/SimulationContext";
import { useSocket } from "../../hooks/useSocket"; 

const GridCanvas = () => {
  // 1. IMPORTANTE: Extraemos agentConfig del contexto para saber qué tipo de agente pintar
  const { worldState = {}, gridConfig, selectedTool, agentConfig } = useSimulation();
  const { sendMessage } = useSocket();
  const stageRef = useRef(null);

  // Datos seguros para evitar crash
  const agents = worldState.agents || [];
  const food = worldState.food || [];
  const obstacles = worldState.obstacles || [];

  const { width, height, cellSize } = gridConfig; 
  const actualCellSize = cellSize || 30; 
  const canvasWidth = width * actualCellSize;
  const canvasHeight = height * actualCellSize;

  // --- LÓGICA PRINCIPAL: Agregar Elemento ---
  // Aceptamos un objeto 'specificConfig' opcional. Si no viene, usamos la config global del contexto.
  const handleAddElement = (type, x, y, specificConfig = {}) => {
    
    if (type === "agent") {
        sendMessage({ 
            type: "ADD_AGENT", 
            data: { 
                x, 
                y,
                // Prioridad: 1. Configuración del Drop (si existe) -> 2. Configuración del Sidebar
                agent_type: specificConfig.agent_type || agentConfig.type,
                strategy: specificConfig.strategy || agentConfig.strategy
            } 
        });
    } else if (type === "food") {
        sendMessage({ type: "ADD_FOOD", data: { x, y } });
    } else if (type === "obstacle") {
        sendMessage({ type: "ADD_OBSTACLE", data: { x, y } });
    }
  };

  // --- LÓGICA PRINCIPAL: Borrar Elemento ---
  const handleRemoveElement = (x, y) => {
    sendMessage({ type: "REMOVE_ELEMENT", data: { x, y } });
  };

  // --- Evento al soltar (Drop) ---
  const handleDrop = (e) => {
    e.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    stage.setPointersPositions(e);
    const pointer = stage.getRelativePointerPosition();
    
    const gridX = Math.floor(pointer.x / actualCellSize);
    const gridY = Math.floor(pointer.y / actualCellSize);
    
    // Recuperamos el tipo de elemento
    const type = e.dataTransfer.getData("elementType");
    
    // 2. IMPORTANTE: Recuperamos la configuración específica que venía en el arrastre
    const droppedAgentType = e.dataTransfer.getData("agentType");
    const droppedStrategy = e.dataTransfer.getData("agentStrategy");
    
    if (type && gridX >= 0 && gridX < width && gridY >= 0 && gridY < height) {
        // Pasamos la configuración específica a la función
        handleAddElement(type, gridX, gridY, {
            agent_type: droppedAgentType,
            strategy: droppedStrategy
        });
    }
  };

  // --- Evento Clic (Pincel o Borrador) ---
  const handleStageClick = (e) => {
    const stage = e.target.getStage();
    const pointer = stage.getRelativePointerPosition();
    const gridX = Math.floor(pointer.x / actualCellSize);
    const gridY = Math.floor(pointer.y / actualCellSize);

    if (selectedTool === "eraser") {
        handleRemoveElement(gridX, gridY);
    } else if (["agent", "food", "obstacle"].includes(selectedTool)) {
        // Al hacer clic normal (Pincel), no pasamos config específica, 
        // así que handleAddElement usará automáticamente agentConfig del contexto.
        handleAddElement(selectedTool, gridX, gridY);
    }
  };

  return (
    <div 
        className="relative overflow-auto border-4 border-zinc-800 rounded-lg bg-zinc-950 flex justify-center shadow-xl"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
    >
      <Stage
        ref={stageRef}
        width={canvasWidth}
        height={canvasHeight}
        onClick={handleStageClick}
      >
        <Layer>
          {/* Fondo del grid */}
          <Rect width={canvasWidth} height={canvasHeight} fill="#09090b" />

          {/* Líneas del Grid */}
          {Array.from({ length: width + 1 }).map((_, i) => (
            <Line key={`v-${i}`} points={[i * actualCellSize, 0, i * actualCellSize, canvasHeight]} stroke="#27272a" strokeWidth={1} />
          ))}
          {Array.from({ length: height + 1 }).map((_, i) => (
            <Line key={`h-${i}`} points={[0, i * actualCellSize, canvasWidth, i * actualCellSize]} stroke="#27272a" strokeWidth={1} />
          ))}

          {/* Renderizado de Obstáculos */}
          {obstacles.map((obs, i) => (
            <Rect key={`o-${i}`} x={obs.x * actualCellSize} y={obs.y * actualCellSize} width={actualCellSize} height={actualCellSize} fill="#52525b" />
          ))}

          {/* Renderizado de Comida */}
          {food.map((f, i) => (
            <Circle key={`f-${i}`} x={f.x * actualCellSize + actualCellSize/2} y={f.y * actualCellSize + actualCellSize/2} radius={actualCellSize/3} fill="#ec4899" />
          ))}

          {/* Renderizado de Agentes */}
          {agents.map((a, i) => (
            <React.Fragment key={`a-${i}`}>
                {/* Cuerpo del agente (el color viene del backend) */}
                <Circle 
                    x={a.x * actualCellSize + actualCellSize/2} 
                    y={a.y * actualCellSize + actualCellSize/2} 
                    radius={actualCellSize/2.5} 
                    fill={a.color || "#22d3ee"} 
                    shadowBlur={10} 
                    shadowColor={a.color || "#22d3ee"} 
                />
                {/* Barra de Energía */}
                <Rect 
                    x={a.x * actualCellSize + 2} 
                    y={a.y * actualCellSize - 4} 
                    width={((actualCellSize - 4) * (a.energy || 100))/100} 
                    height={3} 
                    fill={a.energy < 20 ? "#ef4444" : "#22c55e"} 
                    cornerRadius={1}
                />
            </React.Fragment>
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default GridCanvas;