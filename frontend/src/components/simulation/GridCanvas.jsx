import React, { useMemo } from 'react';
import { Stage, Layer, Line, Circle, Rect, Text } from 'react-konva';

// --- CONFIGURACIÓN DEL GRID (RF1.1) ---
const CELL_SIZE = 20; // Tamaño de cada cuadro en pixeles
const GRID_SIZE = 25; // 25x25 celdas (Total 500x500 pixeles)
const CANVAS_SIZE = CELL_SIZE * GRID_SIZE;

const GridCanvas = ({ agents }) => {
  
  // OPTIMIZACIÓN: Calculamos las líneas del grid una sola vez (useMemo)
  // Esto evita que React recalcule las líneas en cada movimiento (60FPS), mejorando el rendimiento.
  const gridLines = useMemo(() => {
    const lines = [];
    
    // Líneas Verticales
    for (let i = 0; i <= GRID_SIZE; i++) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i * CELL_SIZE, 0, i * CELL_SIZE, CANVAS_SIZE]}
          stroke="#e5e7eb" // Color gris suave
          strokeWidth={1}
        />
      );
    }
    
    // Líneas Horizontales
    for (let i = 0; i <= GRID_SIZE; i++) {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, i * CELL_SIZE, CANVAS_SIZE, i * CELL_SIZE]}
          stroke="#e5e7eb"
          strokeWidth={1}
        />
      );
    }
    return lines;
  }, []);

  return (
    <div style={{ 
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", 
      borderRadius: "4px", 
      overflow: "hidden",
      border: "1px solid #d1d5db"
    }}>
      <Stage width={CANVAS_SIZE} height={CANVAS_SIZE} style={{ background: "white" }}>
        <Layer>
          {/* 1. Fondo Blanco */}
          <Rect width={CANVAS_SIZE} height={CANVAS_SIZE} fill="white" />
          
          {/* 2. Líneas del Grid (Dibujadas desde memoria) */}
          {gridLines}

          {/* 3. Agentes (RF2.2 Visualización Animada) */}
          {agents.map((agent) => (
            <Circle
              key={agent.id}
              // Matemáticas: Convertimos coordenada de celda (ej: 5) a pixel (ej: 100)
              // Sumamos CELL_SIZE / 2 para que el punto quede en el CENTRO de la celda
              x={agent.x * CELL_SIZE + CELL_SIZE / 2} 
              y={agent.y * CELL_SIZE + CELL_SIZE / 2}
              radius={CELL_SIZE * 0.4} // El radio es un 40% del tamaño de la celda
              fill={agent.color || "#ef4444"} // Color por defecto rojo si no viene del backend
              shadowBlur={2}
              shadowColor="black"
              shadowOpacity={0.3}
            />
          ))}
          
          {/* Texto de debug en la esquina */}
          <Text 
            text={`Simulación Activa: ${agents.length} Agentes`} 
            x={10} 
            y={CANVAS_SIZE - 20} 
            fill="gray" 
            fontSize={12}
          />
        </Layer>
      </Stage>
    </div>
  );
};

export default GridCanvas;