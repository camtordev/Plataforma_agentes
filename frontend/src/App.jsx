import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SimulationProvider } from './context/SimulationContext';

// --- IMPORTS DE UI ---
import Navbar from './components/layout/Navbar';
// IMPORTANTE: Importamos el GridEditor que contiene Sidebar + Canvas + Stats
import GridEditor from './components/simulation/GridEditor';

// --- IMPORTS DE PÁGINAS ---
import Home from './pages/Home';
import Tutorials from './pages/Tutorials';

// --- VISTA DEL WORKSPACE ---
const WorkspaceView = () => {
    return (
        <div className="flex flex-col h-screen bg-zinc-950 text-white overflow-hidden font-sans">
            {/* 1. Navbar Superior */}
            <Navbar />
            
            {/* 2. Área Principal */}
            <div className="flex-1 overflow-hidden">
                {/* GridEditor es ahora tu "Super Componente". 
                   Ya incluye: 
                   - Sidebar Izquierdo (Drag & Drop)
                   - Canvas Central (Simulación)
                   - Controles Flotantes (Play/Pause)
                   - Panel Derecho (Estadísticas)
                */}
                <GridEditor />
            </div>
        </div>
    );
};

// --- APP PRINCIPAL ---
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