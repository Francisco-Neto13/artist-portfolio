'use client';

import { useUploadLogic } from './useUploadLogic';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
  const {
    file, setFile, previewUrl, setPreviewUrl, formData, setFormData,
    loading, uploadProgress, handleUpload, resetForm
  } = useUploadLogic(onSuccess, onClose);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(selectedFile);
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-slate-700/50 rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
        
        <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-blue-400/30 rounded-tl-lg pointer-events-none" />
        <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-blue-400/30 rounded-tr-lg pointer-events-none" />
        
        <div className="relative px-8 pt-8 pb-6 border-b border-slate-700/30 shrink-0">
          <h2 className="text-2xl font-light text-white tracking-wide">Nova Obra de Arte</h2>
          <p className="text-slate-500 text-[10px] uppercase tracking-wider mt-1">
            WebP 95% Quality • Conversão Automática
          </p>
          <button 
            onClick={handleClose} 
            disabled={loading} 
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-800/50 border border-slate-700/50 hover:border-red-500/50 flex items-center justify-center text-slate-400 hover:text-red-400 transition-all disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleUpload} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
          
          <div className="relative">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Imagem</label>
            <div className="relative">
              {previewUrl ? (
                <div className="relative aspect-video w-full rounded-xl overflow-hidden border-2 border-slate-700/50 bg-slate-950 group">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-end justify-center p-4">
                    <label className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-all">
                      Trocar Imagem
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={loading} />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center aspect-video w-full rounded-xl border-2 border-dashed border-slate-700/50 hover:border-blue-500/50 bg-slate-950/50 hover:bg-slate-900/50 transition-all cursor-pointer group">
                  <svg className="w-12 h-12 text-slate-600 group-hover:text-blue-500 transition-all mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  <span className="text-slate-400 text-sm mb-1">Clique para selecionar</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={loading} required />
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Título da Obra</label>
              <input type="text" placeholder="Ex: Paisagem Digital" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 outline-none focus:border-blue-500/50 transition-all cursor-text" disabled={loading} required />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Categoria</label>
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50 transition-all cursor-pointer" disabled={loading}>
                <option value="Digital">Digital</option>
                <option value="Painting">Painting</option>
                <option value="Sketches">Sketches</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Tipo</label>
              <input type="text" placeholder="Ex: Ilustração" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 outline-none focus:border-blue-500/50 transition-all cursor-text" disabled={loading} required />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Descrição</label>
              <textarea placeholder="Descreva sua obra..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 h-24 resize-none outline-none focus:border-blue-500/50 transition-all cursor-text" disabled={loading} />
            </div>
          </div>
        </form>

        <div className="p-8 border-t border-slate-700/30 bg-slate-900/50 shrink-0">
          {loading && (
            <div className="mb-6 space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-500 uppercase">Processando e convertendo...</span>
                <span className="text-blue-400">{uploadProgress}%</span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button 
              type="button" 
              onClick={handleClose} 
              disabled={loading} 
              className="flex-1 py-3 text-slate-400 hover:text-white uppercase text-[10px] font-bold tracking-wider transition-all disabled:opacity-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              onClick={handleUpload} 
              disabled={loading || !file} 
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-3 rounded-xl uppercase text-[10px] font-bold tracking-wider shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? 'Convertendo...' : 'Publicar Obra'}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3b82f6;
        }
      `}</style>
    </div>
  );
}