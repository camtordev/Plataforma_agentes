import { useSimulation } from "../context/SimulationContext";

export const useSocket = () => {
    // Ya no creamos new WebSocket() aquí.
    // Solo pedimos la función sendMessage del Contexto global.
    const { sendMessage } = useSimulation();
    
    return { sendMessage };
}