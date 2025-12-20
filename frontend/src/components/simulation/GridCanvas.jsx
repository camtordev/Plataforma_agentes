import React, { useRef, useState } from "react";
import { Stage, Layer, Rect, Circle, Line, Group, Path } from "react-konva";
import { useSimulation } from "../../context/SimulationContext";

// --- ICONOS SVG ---
const ICON_ENERGY = "M13 2L3 14h9l-1 8 10-12h-9l1-8z";
const ICON_APPLE_BODY = "M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z";
const ICON_APPLE_LEAF = "M10 2c1 0 2 .5 2 2a2 2 0 0 1-2 2 2 2 0 0 1-2-2c0-1.1.9-2 2-2Z";

const GridCanvas = ({ activeBrushItem }) => {
  const { worldState = {}, gridConfig, selectedTool, sendMessage, setTemplateByType } = useSimulation();
  const stageRef = useRef(null);
  
  // --- ESTADOS INTERNOS ---
  const isDrawing = useRef(false);
  const isMovingGroup = useRef(false);
  
  // Guardamos el inicio del drag y los LÍMITES del grupo seleccionado
  const dragStart = useRef({ x: 0, y: 0, minX: 0, maxX: 0, minY: 0, maxY: 0 }); 
  const lastCell = useRef({ x: -1, y: -1 }); 
  
  const [selectionRect, setSelectionRect] = useState(null); 
  const [selectedAgentIds, setSelectedAgentIds] = useState([]);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const agents = worldState.agents || [];
  const food = worldState.food || [];
  const obstacles = worldState.obstacles || [];

  const width = gridConfig?.width || 25;
  const height = gridConfig?.height || 25;
  const actualCellSize = gridConfig?.cellSize || 20; 
  const canvasWidth = width * actualCellSize;
  const canvasHeight = height * actualCellSize;

  // --- 1. LÓGICA DE PINTAR / BORRAR ---
  const handleDraw = (stage, x, y) => {
    if (lastCell.current.x === x && lastCell.current.y === y) return; 
    lastCell.current = { x, y };

    if (selectedTool === "eraser") {
        sendMessage({ type: "REMOVE_ELEMENT", data: { x, y } });
    } else if (selectedTool === "brush") {
        const item = activeBrushItem || { type: 'obstacle', subtype: 'static', config: {} };
        if (item.type === 'obstacle') sendMessage({ type: "ADD_OBSTACLE", data: { x, y, subtype: item.subtype, config: item.config } });
        else if (item.type === 'resource') sendMessage({ type: "ADD_FOOD", data: { x, y, food_type: item.subtype, config: item.config } });
        else if (item.type === 'agent') sendMessage({ type: "ADD_AGENT", data: { x, y, agent_type: item.subtype, config: item.config } });
    }
  };

  // --- MANEJADORES DE MOUSE UNIFICADOS ---
  const handleMouseDown = (e) => {
    const stage = e.target.getStage();
    const pointer = stage.getRelativePointerPosition();
    const x = Math.floor(pointer.x / actualCellSize);
    const y = Math.floor(pointer.y / actualCellSize);

    // 1. MODO MOVER (Clic sobre selección)
    const clickedAgent = agents.find(a => a.x === x && a.y === y);
    const isClickingSelected = clickedAgent && selectedAgentIds.includes(clickedAgent.id);

    if (selectedTool === 'select' && selectedAgentIds.length > 0 && isClickingSelected) {
        isMovingGroup.current = true;
        
        // --- CÁLCULO DE LÍMITES DEL GRUPO (BOUNDING BOX) ---
        // Buscamos los valores extremos del grupo para saber cuándo choca con la pared
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        
        selectedAgentIds.forEach(id => {
            const agent = agents.find(a => a.id === id);
            if (agent) {
                if(agent.x < minX) minX = agent.x;
                if(agent.x > maxX) maxX = agent.x;
                if(agent.y < minY) minY = agent.y;
                if(agent.y > maxY) maxY = agent.y;
            }
        });

        dragStart.current = { x, y, minX, maxX, minY, maxY };
        return; 
    }

    // 2. MODO PINCEL/BORRADOR
    if (selectedTool === 'brush' || selectedTool === 'eraser') {
        isDrawing.current = true;
        handleDraw(stage, x, y);
    }
    // 3. MODO SELECCIÓN MÚLTIPLE O SIMPLE
    else if (selectedTool === 'multiselect' || selectedTool === 'select') {
        if (selectedTool === 'multiselect') {
             isDrawing.current = true;
             setSelectionRect({ startX: x, startY: y, endX: x, endY: y });
             setSelectedAgentIds([]);
        }
    }
  };

  const handleMouseMove = (e) => {
    const stage = e.target.getStage();
    const pointer = stage.getRelativePointerPosition();
    
    // Clamping del puntero
    const safeX = Math.max(0, Math.min(canvasWidth - 1, pointer.x));
    const safeY = Math.max(0, Math.min(canvasHeight - 1, pointer.y));
    const x = Math.floor(safeX / actualCellSize);
    const y = Math.floor(safeY / actualCellSize);

    // MOVIMIENTO DE GRUPO (RIGID BODY)
    if (isMovingGroup.current) {
        let dx = x - dragStart.current.x;
        let dy = y - dragStart.current.y;

        // --- RESTRICCIÓN RÍGIDA ---
        // Si la parte izquierda del grupo choca con 0, impedimos mover más a la izquierda
        if (dragStart.current.minX + dx < 0) dx = -dragStart.current.minX;
        // Si la parte derecha del grupo choca con el ancho, impedimos mover más a la derecha
        if (dragStart.current.maxX + dx >= width) dx = (width - 1) - dragStart.current.maxX;
        
        // Lo mismo para Y
        if (dragStart.current.minY + dy < 0) dy = -dragStart.current.minY;
        if (dragStart.current.maxY + dy >= height) dy = (height - 1) - dragStart.current.maxY;

        setDragOffset({ x: dx, y: dy });
        return;
    }

    if (!isDrawing.current) return;

    if (selectedTool === 'brush' || selectedTool === 'eraser') {
        handleDraw(stage, x, y);
    } 
    else if (selectedTool === 'multiselect' && selectionRect) {
        setSelectionRect(prev => ({ ...prev, endX: x, endY: y }));
    }
  };

  const handleMouseUp = (e) => {
    // FINALIZAR MOVIMIENTO DE GRUPO
    if (isMovingGroup.current) {
        isMovingGroup.current = false;
        
        if (dragOffset.x !== 0 || dragOffset.y !== 0) {
            // Aplicamos el desplazamiento calculado (que ya es seguro)
            const moves = selectedAgentIds.map(id => {
                const agent = agents.find(a => a.id === id);
                if (!agent) return null;
                return { 
                    id: agent.id, 
                    x: agent.x + dragOffset.x, 
                    y: agent.y + dragOffset.y 
                };
            }).filter(Boolean);

            if (moves.length > 0) {
                sendMessage({ type: "BATCH_MOVE", data: { moves } });
            }
        } else {
            handleStageClickLogic(e); 
        }

        setDragOffset({ x: 0, y: 0 });
        return;
    }

    isDrawing.current = false;
    lastCell.current = { x: -1, y: -1 };

    // FINALIZAR MULTISELECT
    if (selectedTool === 'multiselect' && selectionRect) {
        const minX = Math.min(selectionRect.startX, selectionRect.endX);
        const maxX = Math.max(selectionRect.startX, selectionRect.endX);
        const minY = Math.min(selectionRect.startY, selectionRect.endY);
        const maxY = Math.max(selectionRect.startY, selectionRect.endY);

        const foundAgents = agents.filter(a => 
            a.x >= minX && a.x <= maxX &&
            a.y >= minY && a.y <= maxY
        );

        setSelectedAgentIds(foundAgents.map(a => a.id));
        setSelectionRect(null); 
    }
    else if (selectedTool === 'select' && !isMovingGroup.current) {
         handleStageClickLogic(e);
    }
  };

  const handleStageClickLogic = (e) => {
    const stage = e.target.getStage();
    const pointer = stage.getRelativePointerPosition();
    const x = Math.floor(pointer.x / actualCellSize);
    const y = Math.floor(pointer.y / actualCellSize);

    const clickedAgent = agents.find(a => a.x === x && a.y === y);
    
    if (clickedAgent) {
        setSelectedAgentIds([clickedAgent.id]);
        const agentType = clickedAgent.type ? clickedAgent.type.toLowerCase() : 'reactive';
        setTemplateByType(agentType, { 
            strategy: clickedAgent.strategy || 'bfs',
            speed: clickedAgent.speed,
            energy: clickedAgent.energy
        });
    } else {
        setSelectedAgentIds([]);
    }
  };

  const renderSelectionOverlay = () => {
    if (!selectionRect) return null;
    const minX = Math.min(selectionRect.startX, selectionRect.endX);
    const maxX = Math.max(selectionRect.startX, selectionRect.endX);
    const minY = Math.min(selectionRect.startY, selectionRect.endY);
    const maxY = Math.max(selectionRect.startY, selectionRect.endY);
    const widthCells = (maxX - minX) + 1;
    const heightCells = (maxY - minY) + 1;

    return (
        <Rect 
            x={minX * actualCellSize} y={minY * actualCellSize}
            width={widthCells * actualCellSize} height={heightCells * actualCellSize}
            fill="rgba(59, 130, 246, 0.3)" stroke="#3b82f6" strokeWidth={1} listening={false}
        />
    );
  };

  const renderGhosts = () => {
    if (dragOffset.x === 0 && dragOffset.y === 0) return null;

    return selectedAgentIds.map(id => {
        const agent = agents.find(a => a.id === id);
        if (!agent) return null;
        
        const targetX = agent.x + dragOffset.x;
        const targetY = agent.y + dragOffset.y;

        return (
            <Circle 
                key={`ghost-${id}`}
                x={targetX * actualCellSize + actualCellSize/2} 
                y={targetY * actualCellSize + actualCellSize/2} 
                radius={actualCellSize/2.5} 
                stroke="white" strokeWidth={2} dash={[4, 4]} opacity={0.6} fill="transparent"
                listening={false}
            />
        )
    });
  };

  return (
    <Stage
      ref={stageRef}
      width={canvasWidth}
      height={canvasHeight}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`cursor-${selectedTool === 'select' ? 'default' : selectedTool === 'brush' || selectedTool === 'eraser' ? 'crosshair' : 'cell'}`}
    >
      <Layer>
        <Rect width={canvasWidth} height={canvasHeight} fill="#09090b" />
        
        {Array.from({ length: width + 1 }).map((_, i) => (
            <Line key={`v-${i}`} points={[i * actualCellSize, 0, i * actualCellSize, canvasHeight]} stroke="#27272a" strokeWidth={1} />
        ))}
        {Array.from({ length: height + 1 }).map((_, i) => (
            <Line key={`h-${i}`} points={[0, i * actualCellSize, canvasWidth, i * actualCellSize]} stroke="#27272a" strokeWidth={1} />
        ))}

        {obstacles.map((obs, i) => {
            if (obs.x >= width || obs.y >= height) return null;
            return <Rect key={`o-${i}`} x={obs.x * actualCellSize} y={obs.y * actualCellSize} width={actualCellSize} height={actualCellSize} fill="#52525b" />
        })}

        {food.map((f, i) => {
            if (f.x >= width || f.y >= height) return null;
            const scale = (actualCellSize * 0.7) / 24;
            const offset = (actualCellSize - (24 * scale)) / 2;
            const color = f.type === "energy" ? "#facc15" : "#f87171";
            return (
                <Group key={`f-${i}`} x={f.x * actualCellSize} y={f.y * actualCellSize}>
                    <Circle x={actualCellSize / 2} y={actualCellSize / 2} radius={actualCellSize * 0.4} fill={color} opacity={0.2} />
                    {f.type === "energy" ? (
                        <Path data={ICON_ENERGY} fill={color} scaleX={scale} scaleY={scale} x={offset} y={offset} />
                    ) : (
                        <Group x={offset} y={offset} scaleX={scale} scaleY={scale}>
                            <Path data={ICON_APPLE_BODY} fill={color} />
                            <Path data={ICON_APPLE_LEAF} fill={color} />
                        </Group>
                    )}
                </Group>
            );
        })}

        {agents.map((a, i) => {
             if (a.x < 0 || a.x >= width || a.y < 0 || a.y >= height) return null;
             if ((a.energy || 0) <= 0) return null;
             
             const isSelected = selectedAgentIds.includes(a.id);

             return (
                <Group key={`a-${i}`} x={a.x * actualCellSize} y={a.y * actualCellSize}>
                    {isSelected && (
                        <Rect x={0} y={0} width={actualCellSize} height={actualCellSize} stroke="white" strokeWidth={2} shadowColor="white" shadowBlur={5} />
                    )}
                    <Circle x={actualCellSize/2} y={actualCellSize/2} radius={actualCellSize/2.5} fill={a.color || "#22d3ee"} shadowBlur={10} shadowColor={a.color} />
                    <Rect x={2} y={-4} width={Math.max(0, ((actualCellSize - 4) * (a.energy || 100))/100)} height={3} fill={a.energy < 20 ? "#ef4444" : "#22c55e"} cornerRadius={1} />
                </Group>
             )
        })}

        {renderGhosts()}
        {renderSelectionOverlay()}
      </Layer>
    </Stage>
  );
};

export default GridCanvas;