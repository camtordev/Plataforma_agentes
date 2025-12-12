import { useEffect, useState, useRef } from 'react';
// Importamos el componente del Grid que creamos en el paso anterior
import GridCanvas from './components/simulation/GridCanvas';
import './App.css';

function App() {
  // Estado donde guardaremos la lista de agentes (puntos) que vienen de Python
  const [agents, setAgents] = useState([]);
  
  // Usamos useRef para mantener la conexión WebSocket activa
  const ws = useRef(null);

  useEffect(() => {
    // 1. INICIAR CONEXIÓN (RF2 Motor de Simulación)
    // Nos conectamos al puerto 8000 donde corre FastAPI
    ws.current = new WebSocket("ws://localhost:8000/ws/simulacion");

    ws.current.onopen = () => {
      console.log("✅ Conectado al Backend (Python)");
    };

    ws.current.onmessage = (event) => {
      // 2. RECIBIR DATOS EN TIEMPO REAL
      // Python envía texto JSON -> Lo convertimos a Array de JavaScript
      try {
        const data = JSON.parse(event.data);
        setAgents(data); // Esto actualiza el estado y redibuja el Grid
      } catch (error) {
        console.error("Error al procesar datos:", error);
      }
    };

    ws.current.onclose = () => console.log("❌ Desconectado del Backend");

    // Limpieza al cerrar la ventana
    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      backgroundColor: '#f3f4f6' 
    }}>
      <h1 style={{ color: '#111827', marginBottom: '20px' }}>
        Plataforma Multi-Agente
      </h1>

      <div style={{ 
        padding: '10px', 
        background: 'white', 
        borderRadius: '8px', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
      }}>
        {/* Aquí renderizamos el componente del Grid pasando los agentes */}
        <GridCanvas agents={agents} />
      </div>

      <p style={{ marginTop: '15px', color: '#4b5563' }}>
        Estado: {agents.length > 0 
          ? <span style={{ color: '#059669', fontWeight: 'bold' }}>🟢 Simulación Activa</span> 
          : <span style={{ color: '#dc2626', fontWeight: 'bold' }}>🔴 Esperando datos...</span>
        }
      </p>
    </div>
  );
}

export default App;