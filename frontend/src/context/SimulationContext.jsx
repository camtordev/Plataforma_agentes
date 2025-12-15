import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from "react";

// 1. Estado Inicial
const initialState = {
  isRunning: false,
  step: 0,
  agents: [],       
  food: [],         
  obstacles: [],    
  gridConfig: { width: 25, height: 25, cellSize: 20 },
  
  // Herramienta activa por defecto
  selectedTool: "select", // 'select' | 'brush' | 'eraser' | 'multiselect'

  code: "",

  // Configuración del Agente a insertar
  agentConfig: {
    type: "reactive",   
    strategy: "bfs"    
  },

  // Configuración de la lógica de Simulación
  simulationConfig: {
    maxSteps: 100,      
    isUnlimited: false, 
    stopOnFood: true    
  }
};

// 2. Reducer
function simulationReducer(state, action) {
  switch (action.type) {
    
    // Optimistic UI para el slider
    case "SET_GRID_CONFIG":
      return { 
        ...state, 
        gridConfig: { ...state.gridConfig, ...action.payload } 
      };

    case "UPDATE_WORLD":
      // Sincronización total con el Backend
      return {
        ...state,
        agents: action.payload.agents || [],
        food: action.payload.food || [],
        obstacles: action.payload.obstacles || [],
        step: action.payload.step || 0,
        
        // Si el backend manda dimensiones, las respetamos
        gridConfig: {
            ...state.gridConfig,
            width: action.payload.width || state.gridConfig.width,
            height: action.payload.height || state.gridConfig.height
        },
        
        // Si el backend dice que paró (por límite de pasos), actualizamos
        isRunning: action.payload.isRunning !== undefined ? action.payload.isRunning : state.isRunning,

        // Sincronizar config si el backend la devuelve
        simulationConfig: action.payload.config ? { ...state.simulationConfig, ...action.payload.config } : state.simulationConfig
      };

    case "START_SIMULATION": return { ...state, isRunning: true };
    case "STOP_SIMULATION": return { ...state, isRunning: false };
    
    // Actualizar herramienta seleccionada
    case "SET_TOOL": return { ...state, selectedTool: action.payload };
    
    case "SET_AGENT_CONFIG":
      return { ...state, agentConfig: { ...state.agentConfig, ...action.payload } };

    case "SET_SIMULATION_CONFIG":
      return { ...state, simulationConfig: { ...state.simulationConfig, ...action.payload } };

    default:
      return state;
  }
}

// 3. Crear el Contexto
const SimulationContext = createContext(null);

// 4. Provider
export function SimulationProvider({ children }) {
  const [state, dispatch] = useReducer(simulationReducer, initialState);
  const socketRef = useRef(null); // Referencia única al WebSocket

  // --- CONEXIÓN WEBSOCKET CENTRALIZADA (CORREGIDA) ---
  useEffect(() => {
    const WS_URL = "ws://localhost:8000/ws/simulacion";
    
    // Si ya existe una conexión abierta, no creamos otra (evita duplicados en modo desarrollo)
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        return; 
    }

    const ws = new WebSocket(WS_URL);
    socketRef.current = ws;

    ws.onopen = () => {
        console.log("✅ [Context] WebSocket Conectado");
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        // Manejo del formato nuevo
        if (message.type === "WORLD_UPDATE") {
            dispatch({ type: "UPDATE_WORLD", payload: message.data });
        }
      } catch (e) {
        console.error("Error socket:", e);
      }
    };

    ws.onclose = () => console.log("🔌 [Context] WebSocket Desconectado");
    
    ws.onerror = (error) => {
        console.error("⚠️ Error en WebSocket:", error);
    };

    // Función de limpieza al desmontar
    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
      }
    };
  }, []); // Solo corre al montar

  // --- FUNCIÓN PARA ENVIAR (Accesible globalmente) ---
  const sendMessage = useCallback((msg) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify(msg));
    } else {
        console.warn("⚠️ Socket no listo para enviar:", msg);
    }
  }, []);

  // Helpers
  const setIsRunning = useCallback((isRunning) => {
    dispatch({ type: isRunning ? "START_SIMULATION" : "STOP_SIMULATION" });
    sendMessage({ type: isRunning ? "START" : "STOP" });
  }, [sendMessage]);

  const setSelectedTool = useCallback((tool) => {
    dispatch({ type: "SET_TOOL", payload: tool });
  }, []);

  const updateWorldState = useCallback((data) => {
    dispatch({ type: "UPDATE_WORLD", payload: data });
  }, []);


  const value = {
    ...state,        
    worldState: {    
      agents: state.agents,
      food: state.food,
      obstacles: state.obstacles,
      step: state.step
    },
    sendMessage,     
    setIsRunning,
    setSelectedTool, 
    updateWorldState,
    dispatch
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) throw new Error("useSimulation debe usarse dentro de SimulationProvider");
  return context;
}