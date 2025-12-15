import React, { useRef } from "react";
import { Stage, Layer, Rect, Circle, Line, Group, Path } from "react-konva";
import { useSimulation } from "../../context/SimulationContext";

// --- DEFINIMOS LOS ICONOS SVG MANUALMENTE ---

// Icono de Rayo (Zap) - Lucide
const ICON_ENERGY = "M13 2L3 14h9l-1 8 10-12h-9l1-8z";

// Icono de Manzana (Apple) - Lucide (Tiene 2 partes: Cuerpo y Hoja)
const ICON_APPLE_BODY = "M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z";
const ICON_APPLE_LEAF = "M10 2c1 0 2 .5 2 2a2 2 0 0 1-2 2 2 2 0 0 1-2-2c0-1.1.9-2 2-2Z";

const GridCanvas = () => {
  const { worldState = {}, gridConfig, selectedTool, sendMessage } = useSimulation();
  const stageRef = useRef(null);

  // Seguridad: arrays vacíos si worldState falla
  const agents = worldState.agents || [];
  const food = worldState.food || [];
  const obstacles = worldState.obstacles || [];

  const width = gridConfig?.width || 25;
  const height = gridConfig?.height || 25;
  const actualCellSize = gridConfig?.cellSize || 20; 
  
  const canvasWidth = width * actualCellSize;
  const canvasHeight = height * actualCellSize;

  // --- LÓGICA DE CLIC ---
  const handleStageClick = (e) => {
    const stage = e.target.getStage();
    const pointer = stage.getRelativePointerPosition();
    const gridX = Math.floor(pointer.x / actualCellSize);
    const gridY = Math.floor(pointer.y / actualCellSize);

    // Validación básica de clic dentro del canvas visible
    if(gridX < 0 || gridX >= width || gridY < 0 || gridY >= height) return;

    if (selectedTool === "eraser") {
        sendMessage({ type: "REMOVE_ELEMENT", data: { x: gridX, y: gridY } });
        return;
    }

    if (selectedTool === "brush") {
         sendMessage({ type: "ADD_OBSTACLE", data: { x: gridX, y: gridY } });
    }
  };

  // --- RENDERIZADO DEL GRID ---
  const renderGridLines = () => (
    <>
      {Array.from({ length: width + 1 }).map((_, i) => (
        <Line key={`v-${i}`} points={[i * actualCellSize, 0, i * actualCellSize, canvasHeight]} stroke="#27272a" strokeWidth={1} />
      ))}
      {Array.from({ length: height + 1 }).map((_, i) => (
        <Line key={`h-${i}`} points={[0, i * actualCellSize, canvasWidth, i * actualCellSize]} stroke="#27272a" strokeWidth={1} />
      ))}
    </>
  );

  // --- RENDERIZADO DE OBSTÁCULOS ---
  const renderObstacles = () => (
    obstacles.map((obs, i) => {
      // MEJORA: Si el obstáculo quedó fuera del nuevo tamaño, no lo dibujamos
      if (obs.x >= width || obs.y >= height) return null;

      return (
        <Rect key={`o-${i}`} x={obs.x * actualCellSize} y={obs.y * actualCellSize} width={actualCellSize} height={actualCellSize} fill="#52525b" />
      )
    })
  );

  // --- RENDERIZADO DE COMIDA/ENERGÍA ---
  const renderFood = () => (
    food.map((f, i) => {
      // MEJORA: Filtro de límites
      if (f.x >= width || f.y >= height) return null;

      const x = f.x * actualCellSize;
      const y = f.y * actualCellSize;
      
      const isEnergy = f.type === "energy";
      const color = isEnergy ? "#facc15" : "#f87171"; 
      
      // Factor de escala: Los iconos son de 24x24, ajustamos al tamaño de celda
      const scaleFactor = (actualCellSize * 0.7) / 24; 
      // Centrado
      const offset = (actualCellSize - (24 * scaleFactor)) / 2;

      return (
        <Group key={`f-${i}`} x={x} y={y}>
           {/* Fondo circular */}
           <Circle 
             x={actualCellSize / 2}
             y={actualCellSize / 2}
             radius={actualCellSize * 0.4} 
             fill={color} 
             opacity={0.2}
           />
           
           {/* DIBUJO DEL ICONO */}
           {isEnergy ? (
             <Path
               data={ICON_ENERGY}
               fill={color}
               scaleX={scaleFactor}
               scaleY={scaleFactor}
               x={offset}
               y={offset}
             />
           ) : (
             <Group x={offset} y={offset} scaleX={scaleFactor} scaleY={scaleFactor}>
                <Path data={ICON_APPLE_BODY} fill={color} />
                <Path data={ICON_APPLE_LEAF} fill={color} />
             </Group>
           )}
        </Group>
      );
    })
  );

  // --- RENDERIZADO DE AGENTES ---
  const renderAgents = () => (
    agents.map((a, i) => {
      // MEJORA: Filtro de límites
      if (a.x >= width || a.y >= height) return null;
      // Filtro de agentes muertos
      if ((a.energy || 0) <= 0) return null;

      return (
      <React.Fragment key={`a-${i}`}>
        <Circle 
          x={a.x * actualCellSize + actualCellSize/2} 
          y={a.y * actualCellSize + actualCellSize/2} 
          radius={actualCellSize/2.5} 
          fill={a.color || "#22d3ee"} 
          shadowBlur={10} shadowColor={a.color || "#22d3ee"} 
        />
        <Rect 
          x={a.x * actualCellSize + 2} y={a.y * actualCellSize - 4} 
          width={Math.max(0, ((actualCellSize - 4) * (a.energy || 100))/100)}
          height={3} 
          fill={a.energy < 20 ? "#ef4444" : "#22c55e"} cornerRadius={1}
        />
      </React.Fragment>
    )})
  );

  return (
    <Stage
      ref={stageRef}
      width={canvasWidth}
      height={canvasHeight}
      onClick={handleStageClick}
      className={`cursor-${selectedTool === 'select' ? 'default' : 'crosshair'}`}
    >
      <Layer>
        <Rect width={canvasWidth} height={canvasHeight} fill="#09090b" />
        {renderGridLines()}
        {renderObstacles()}
        {renderFood()} 
        {renderAgents()}
      </Layer>
    </Stage>
  );
};

export default GridCanvas;