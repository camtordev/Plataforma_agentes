import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SimulationProvider, useSimulation } from './context/SimulationContext';
import { useSocket } from './hooks/useSocket'; // Usamos el hook centralizado para evitar lógica repetida

// Componentes de UI
import Navbar from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { CodeEditor } from './components/editor/CodeEditor';
import GridCanvas from './components/simulation/GridCanvas';

// Páginas
import Home from './pages/Home';
import Tutorials from './pages/Tutorials';

// Iconos
import { Play, Pause, Square, RotateCcw, SkipForward, Video, Gauge } from "lucide-react";

// --- COMPONENTE INTERNO DEL WORKSPACE (La vista principal) ---
const WorkspaceView = () => {
    // Obtenemos estado y acciones del contexto global
    const { isRunning, worldState, updateWorldState, setIsRunning } = useSimulation();
    
    // Obtenemos la conexión WS del hook personalizado
    // NOTA: El hook ya se encarga de conectar y llamar a updateWorldState cuando llegan mensajes
    const { sendMessage } = useSocket();

    // Estado local solo para la UI de velocidad
    const [speedMultiplier, setSpeedMultiplier] = useState(1);

    // --- MANEJADORES DE BOTONES ---
    const handleStart = () => {
        sendMessage({ type: "START" });
        setIsRunning(true);
    };

    const handlePause = () => {
        sendMessage({ type: "PAUSE" });
        setIsRunning(false);
    };

    const handleStop = () => {
        sendMessage({ type: "STOP" });
        setIsRunning(false);
    };

    const handleReset = () => {
        sendMessage({ type: "RESET" });
        setIsRunning(false);
    };

    const handleStep = () => {
        // Avanzar un frame manualmente
        sendMessage({ type: "STEP" });
    };

    const handleSpeedChange = (val) => {
        setSpeedMultiplier(val);
        sendMessage({ type: "SET_SPEED", data: { speed: val } });
    };

    return (
        <div className="flex flex-col h-screen bg-zinc-950 text-white overflow-hidden font-sans">
            <Navbar />
            
            <div className="flex flex-1 overflow-hidden">
                {/* 1. Panel Izquierdo: Herramientas y Configuración */}
                <Sidebar />

                {/* 2. Centro: Simulación */}
                <main className="flex-1 bg-zinc-900/50 relative flex flex-col">
                    
                    {/* --- BARRA DE CONTROL SUPERIOR --- */}
                    <div className="h-14 border-b border-zinc-800 bg-zinc-900 flex items-center px-4 justify-between gap-4 shadow-sm z-10">
                        
                        {/* Grupo 1: Reproducción */}
                        <div className="flex items-center gap-2">
                            {!isRunning ? (
                                <button 
                                    onClick={handleStart} 
                                    className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded transition shadow-lg shadow-emerald-900/20"
                                >
                                    <Play size={16} fill="currentColor" /> Iniciar
                                </button>
                            ) : (
                                <button 
                                    onClick={handlePause} 
                                    className="flex items-center gap-2 px-4 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded transition shadow-lg shadow-yellow-900/20"
                                >
                                    <Pause size={16} fill="currentColor" /> Pausar
                                </button>
                            )}

                            <button 
                                onClick={handleStop} 
                                className="flex items-center gap-2 px-3 py-1.5 border border-zinc-700 hover:bg-zinc-800 rounded text-zinc-300 transition"
                                title="Detener simulación"
                            >
                                <Square size={16} fill="currentColor" />
                            </button>

                            <button 
                                onClick={handleReset} 
                                className="flex items-center gap-2 px-3 py-1.5 border border-zinc-700 hover:bg-zinc-800 rounded text-zinc-300 transition"
                                title="Reiniciar todo"
                            >
                                <RotateCcw size={16} />
                            </button>
                        </div>

                        <div className="w-px h-6 bg-zinc-700 mx-2"></div>

                        {/* Grupo 2: Herramientas Extra */}
                        <div className="flex items-center gap-4">
                             <button 
                                onClick={handleStep} 
                                disabled={isRunning} 
                                className="flex items-center gap-2 text-zinc-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                                title="Avanzar un paso"
                            >
                                <SkipForward size={18} /> <span className="text-sm font-medium">Paso</span>
                            </button>
                            
                            <button className="flex items-center gap-2 text-zinc-300 hover:text-white transition">
                                <Video size={18} /> <span className="text-sm font-medium">Grabar</span>
                            </button>

                            {/* Selector de Velocidad */}
                            <div className="flex items-center gap-1 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                                <Gauge size={16} className="text-zinc-500 mr-1"/>
                                {[0.25, 0.5, 1, 2, 5].map(v => (
                                    <button 
                                        key={v}
                                        onClick={() => handleSpeedChange(v)}
                                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition ${
                                            speedMultiplier === v 
                                            ? 'bg-blue-600 text-white' 
                                            : 'text-zinc-500 hover:text-zinc-300'
                                        }`}
                                    >
                                        {v}x
                                    </button>
                                ))}
                            </div>
                        </div>

                         {/* Contador de Pasos (Derecha) */}
                         <div className="ml-auto font-mono text-zinc-500 text-xs bg-zinc-950 px-3 py-1 rounded border border-zinc-800">
                            STEP: <span className="text-emerald-400 font-bold text-sm">{worldState.step || 0}</span>
                        </div>
                    </div>

                    {/* --- ÁREA DEL GRID (CANVAS) --- */}
                    <div className="flex-1 flex items-center justify-center overflow-auto p-4 bg-[#0c0c0e]">
                        {/* El GridCanvas ahora recibe drop events (ver archivo GridCanvas.jsx) */}
                        <GridCanvas />
                    </div>
                </main>

                {/* 3. Panel Derecho: Editor de Código */}
                <aside className="w-[400px] border-l border-zinc-800 bg-zinc-900 flex flex-col shadow-xl z-20">
                    <div className="flex border-b border-zinc-800 bg-zinc-950">
                        <button className="px-4 py-3 text-sm font-medium border-b-2 border-blue-500 text-blue-400 bg-zinc-900">
                            Código (Python)
                        </button>
                        <button className="px-4 py-3 text-sm font-medium text-zinc-500 hover:text-zinc-300">
                            Consola
                        </button>
                    </div>
                    <div className="flex-1 overflow-hidden relative">
                        <CodeEditor />
                    </div>
                </aside>
            </div>
        </div>
    );
};

// --- APP PRINCIPAL CON RUTAS ---
function App() {
  return (
    <SimulationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/workspace" element={<WorkspaceView />} />
          <Route path="/tutorials" element={<Tutorials />} />
          <Route path="/tutorials/:id" element={<WorkspaceView />} />
        </Routes>
      </BrowserRouter>
    </SimulationProvider>
  );
}

export default App;