import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { getTemplate } from "../templates/agentTemplates";

const initialState = {
  isRunning: false,
  step: 0,
  agents: [],
  food: [],
  obstacles: [],
  gridConfig: { width: 25, height: 25, cellSize: 20 },
  selectedTool: "select",
  code: "",
  selectedTemplate: getTemplate("reactive"),
  agentConfig: {
    type: "reactive",
    strategy: "bfs",
  },
  simulationConfig: {
    maxSteps: 100,
    isUnlimited: false,
    stopOnFood: true,
  },
};

function simulationReducer(state, action) {
  switch (action.type) {
    case "SET_GRID_CONFIG":
      return {
        ...state,
        gridConfig: { ...state.gridConfig, ...action.payload },
      };
    case "UPDATE_WORLD":
      return {
        ...state,
        agents: action.payload.agents || [],
        food: action.payload.food || [],
        obstacles: action.payload.obstacles || [],
        step: action.payload.step || 0,
        gridConfig: {
          ...state.gridConfig,
          width: action.payload.width || state.gridConfig.width,
          height: action.payload.height || state.gridConfig.height,
        },
        isRunning:
          action.payload.isRunning !== undefined
            ? action.payload.isRunning
            : state.isRunning,
        simulationConfig: action.payload.config
          ? { ...state.simulationConfig, ...action.payload.config }
          : state.simulationConfig,
      };
    case "START_SIMULATION":
      return { ...state, isRunning: true };
    case "STOP_SIMULATION":
      return { ...state, isRunning: false };
    case "SET_TOOL":
      return { ...state, selectedTool: action.payload };
    case "SET_TEMPLATE":
      return { ...state, selectedTemplate: action.payload };
    case "SET_AGENT_CONFIG":
      return { ...state, agentConfig: { ...state.agentConfig, ...action.payload } };
    case "SET_SIMULATION_CONFIG":
      return {
        ...state,
        simulationConfig: { ...state.simulationConfig, ...action.payload },
      };
    default:
      return state;
  }
}

const SimulationContext = createContext(null);

export function SimulationProvider({ children, projectId, readOnly = false, instanceId }) {
  const [state, dispatch] = useReducer(simulationReducer, initialState);
  const socketRef = useRef(null);
  const instanceRef = useRef(instanceId);

  // Generar/recordar un UUID por proyecto para aislar motores de simulación
  useEffect(() => {
    const storageKey = `sim-instance-${projectId || "default"}`;
    if (!instanceRef.current) {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        instanceRef.current = stored;
      } else {
        const newId =
          (typeof crypto !== "undefined" && crypto.randomUUID)
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        instanceRef.current = newId;
        sessionStorage.setItem(storageKey, newId);
      }
    }
  }, [projectId, instanceId]);

  useEffect(() => {
    const instance = instanceRef.current;
    const readonlyFlag = readOnly ? "1" : "0";
    const WS_URL = projectId
      ? `ws://localhost:8000/ws/simulacion?project=${projectId}&instance=${instance}&readonly=${readonlyFlag}`
      : `ws://localhost:8000/ws/simulacion?instance=${instance}&readonly=${readonlyFlag}`;

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    const ws = new WebSocket(WS_URL);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("[Context] WebSocket Conectado");
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "WORLD_UPDATE") {
          dispatch({ type: "UPDATE_WORLD", payload: message.data });
        }
      } catch (e) {
        console.error("Error socket:", e);
      }
    };

    ws.onclose = () => console.log("[Context] WebSocket Desconectado");

    ws.onerror = (error) => {
      console.error("Error en WebSocket:", error);
    };

    return () => {
      if (
        ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING
      ) {
        ws.close();
      }
    };
  }, [projectId]);

  const sendMessage = useCallback((msg) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(msg));
    } else {
      console.warn("Socket no listo para enviar:", msg);
    }
  }, []);

  const setTemplateByType = useCallback((type, params = {}) => {
    const template = getTemplate(type, params);
    dispatch({ type: "SET_TEMPLATE", payload: template });
  }, []);

  const setIsRunning = useCallback(
    (isRunning) => {
      dispatch({ type: isRunning ? "START_SIMULATION" : "STOP_SIMULATION" });
      sendMessage({ type: isRunning ? "START" : "STOP" });
    },
    [sendMessage],
  );

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
      step: state.step,
    },
    selectedTemplate: state.selectedTemplate,
    setTemplateByType,
    sendMessage,
    setIsRunning,
    setSelectedTool,
    updateWorldState,
    dispatch,
    isReadOnly: readOnly,
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
