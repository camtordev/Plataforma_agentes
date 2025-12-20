import React, { useState } from "react";
import { X, Link2, Copy } from "lucide-react";
import {
  createShareLink,
  revokeShareLink,
} from "../../services/projectService";
import { toast } from "react-hot-toast";

/**
 * RF5.2 - Modal para Compartir Proyecto
 * Genera URL única con opciones de expiración
 */
const ShareModal = ({ project, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [shareData, setShareData] = useState({
    expires_in_days: 30,
    allow_fork: true,
    allow_download: true,
  });
  const [shareLink, setShareLink] = useState(null);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const result = await createShareLink(project.id, shareData);

      const baseUrl = window.location.origin;
      const fullUrl = `${baseUrl}/shared/${result.share_token}`;

      setShareLink({
        ...result,
        full_url: fullUrl,
      });

      toast.success("Enlace generado exitosamente");
    } catch (error) {
      toast.error("Error al generar enlace: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!confirm("¿Estás seguro de revocar este enlace?")) return;

    try {
      await revokeShareLink(project.id);
      toast.success("Enlace revocado");
      setShareLink(null);
    } catch (error) {
      toast.error("Error al revocar: " + error.message);
    }
  };

  const handleCopy = async () => {
    if (!shareLink?.full_url) return;

    try {
      await navigator.clipboard.writeText(shareLink.full_url);
      toast.success("Enlace copiado al portapapeles");
    } catch (error) {
      toast.error("No se pudo copiar el enlace");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl text-zinc-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-950">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-300">
              Compartir proyecto
            </p>
            <h3 className="text-lg font-bold text-white leading-tight">{project.title}</h3>
            <p className="text-xs text-zinc-400">Genera y gestiona un enlace público.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {!shareLink ? (
            <>
              <div className="flex items-start gap-3 bg-zinc-800/60 border border-zinc-700 rounded-lg p-4">
                <div className="p-2 rounded-md bg-blue-500/10 text-blue-300">
                  <Link2 size={16} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">Enlace público</p>
                  <p className="text-xs text-zinc-400">
                    Cualquier persona con el enlace podrá ver el proyecto. Controla expiración y permisos.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-300">Tiempo de expiración</label>
                  <select
                    value={shareData.expires_in_days ?? ""}
                    onChange={(e) =>
                      setShareData({
                        ...shareData,
                        expires_in_days: e.target.value === "" ? null : parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-zinc-700 bg-zinc-950 text-zinc-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1">1 día</option>
                    <option value="7">7 días</option>
                    <option value="30">30 días</option>
                    <option value="90">90 días</option>
                    <option value="">Sin expiración</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 transition-colors">
                  <div>
                    <p className="text-sm text-white">Permitir clonar (fork)</p>
                    <p className="text-xs text-zinc-500">Los usuarios podrán duplicar el proyecto.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={shareData.allow_fork}
                    onChange={(e) => setShareData({ ...shareData, allow_fork: e.target.checked })}
                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-700 accent-blue-600 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 transition-colors">
                  <div>
                    <p className="text-sm text-white">Permitir descarga</p>
                    <p className="text-xs text-zinc-500">Habilita la exportación del proyecto.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={shareData.allow_download}
                    onChange={(e) => setShareData({ ...shareData, allow_download: e.target.checked })}
                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-700 accent-blue-600 cursor-pointer"
                  />
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-zinc-700 font-medium transition-colors shadow"
                >
                  {loading ? "Generando..." : "Generar enlace"}
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-zinc-800 text-zinc-300 py-3 rounded-lg hover:bg-zinc-700 font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 space-y-2">
                <p className="text-sm text-green-200 font-medium">Enlace generado</p>
                <p className="text-xs text-green-300">
                  Comparte este enlace con quien quieras.
                  {shareLink.expires_at && ` Expira el ${new Date(shareLink.expires_at).toLocaleDateString()}.`}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-300">Enlace compartido</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={shareLink.full_url}
                    readOnly
                    className="flex-1 px-4 py-2 border border-zinc-700 bg-zinc-950 text-zinc-100 rounded-lg text-sm"
                  />
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 whitespace-nowrap shadow"
                  >
                    <Copy size={16} /> Copiar
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => window.open(shareLink.full_url, "_blank")}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 shadow"
                >
                  Ver vista previa
                </button>
                <button
                  onClick={handleRevoke}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 shadow"
                  title="Revocar enlace"
                >
                  Revocar
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-zinc-800 text-zinc-300 px-4 py-2 rounded-lg hover:bg-zinc-700"
                >
                  Cerrar
                </button>
              </div>

              <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-3">
                <p className="text-xs text-yellow-200">
                  <strong>Importante:</strong> Cualquier persona con este enlace puede ver tu proyecto. Si lo revocas,
                  dejará de funcionar inmediatamente.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
