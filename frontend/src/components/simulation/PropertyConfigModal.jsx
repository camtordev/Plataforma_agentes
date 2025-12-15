"use client"
import React, { useState, useEffect } from "react"
import { X, Save } from "lucide-react"

export default function PropertyConfigModal({ isOpen, onClose, type, currentConfig, onSave }) {
  const [formData, setFormData] = useState(currentConfig || {})

  useEffect(() => {
    if (currentConfig) setFormData(currentConfig)
  }, [currentConfig])

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target
    const val = inputType === 'checkbox' ? checked : value
    setFormData(prev => ({ ...prev, [name]: val }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg w-80 shadow-2xl text-zinc-100 overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-zinc-800 bg-zinc-950">
          <h3 className="text-sm font-bold capitalize">Configurar {type}</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white"><X size={16}/></button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          
          {/* --- Configuración de Agentes --- */}
          {type === 'agent' && (
            <>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Velocidad (1-10)</label>
                <div className="flex items-center gap-2">
                  <input type="range" name="speed" min="1" max="10" value={formData.speed || 5} onChange={handleChange} className="flex-1 accent-blue-500 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer"/>
                  <span className="text-xs w-4 text-right">{formData.speed}</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Energía Inicial</label>
                <input type="number" name="initialEnergy" value={formData.initialEnergy || 100} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none"/>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Radio de Visión</label>
                <input type="number" name="visionRadius" value={formData.visionRadius || 3} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none"/>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Color</label>
                <input type="color" name="color" value={formData.color || "#3b82f6"} onChange={handleChange} className="w-full h-8 bg-transparent cursor-pointer rounded"/>
              </div>
            </>
          )}

          {/* --- Configuración de Recursos --- */}
          {type === 'resource' && (
            <>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Valor (Energía)</label>
                <input type="number" name="nutritionValue" value={formData.nutritionValue || 20} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none"/>
              </div>
            </>
          )}

          {/* --- Configuración de Obstáculos (ACTUALIZADO) --- */}
          {type === 'obstacle' && (
            <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-2 rounded bg-zinc-800/50 border border-zinc-700">
                  <label className="text-sm text-zinc-300">¿Es Destructible?</label>
                  <input 
                    type="checkbox" 
                    name="isDestructible" 
                    checked={formData.isDestructible || false} 
                    onChange={handleChange} 
                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-700 accent-blue-500 cursor-pointer"
                  />
                </div>
                
                {/* Solo mostramos el costo si es destructible */}
                {formData.isDestructible && (
                  <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex justify-between text-xs text-zinc-400">
                        <label>Costo de Destrucción</label>
                        <span className="text-blue-400 font-bold">{formData.destructionCost || 1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500">1</span>
                        <input 
                          type="range" 
                          name="destructionCost" 
                          min="1" 
                          max="20" 
                          value={formData.destructionCost || 1} 
                          onChange={handleChange} 
                          className="flex-1 accent-blue-500 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-xs text-zinc-500">20</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 pt-1">Energía necesaria para romperlo.</p>
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950">
          <button onClick={() => onSave(formData)} className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium transition-colors">
            <Save size={14} /> Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  )
}