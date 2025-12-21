import React from "react";
import { Bot, Save, Share2, Settings, Github, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-md">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-foreground">AgentLab</span>
        </div>
        <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
          v1.0
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Botones simplificados para no complicar con shadcn/ui completo aun */}
        <button className="p-2 hover:bg-secondary rounded text-muted-foreground transition">
          <Github className="h-5 w-5" />
        </button>
        <button className="p-2 hover:bg-secondary rounded text-muted-foreground transition">
          <Settings className="h-5 w-5" />
        </button>
        {user ? (
          <button
            className="bg-destructive text-destructive-foreground px-3 py-1.5 rounded text-sm font-medium hover:opacity-90 flex items-center gap-1"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </button>
        ) : (
          <button className="bg-primary text-primary-foreground px-3 py-1.5 rounded text-sm font-medium hover:opacity-90">
            Iniciar Sesión
          </button>
        )}
      </div>
    </header>
  );
}
