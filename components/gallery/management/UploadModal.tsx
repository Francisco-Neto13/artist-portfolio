'use client'; 
import { useEffect } from 'react'; 
import { useUploadLogic } from './useUploadLogic'; 
import { Artwork } from '../types'; 

interface UploadModalProps { 
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess: () => void; 
  editingArtwork?: Artwork | null; 
} 

export default function UploadModal({ isOpen, onClose, onSuccess, editingArtwork }: UploadModalProps) { 
  const { 
    handleFileChange, 
    previewUrl, 
    setPreviewUrl, 
    isOptimized,      
    formData, 
    setFormData, 
    loading, 
    uploadProgress, 
    handleUpload, 
    resetForm, 
    availableCategories, 
    availableTypes
  } = useUploadLogic(onSuccess, onClose, editingArtwork); 

  useEffect(() => { 
    if (isOpen) { 
      if (editingArtwork) { 
        setFormData({ 
          title: editingArtwork.title, 
          category: editingArtwork.category, 
          type: editingArtwork.type, 
        }); 
        setPreviewUrl(editingArtwork.image_url); 
      } else { 
        resetForm(); 
      } 
    } 
  }, [isOpen, editingArtwork, resetForm, setFormData, setPreviewUrl]); 

  if (!isOpen) return null; 

  return ( 
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300"> 
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-slate-700/50 rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col"> 
          
        <div className="relative px-8 pt-8 pb-6 border-b border-slate-700/30 shrink-0"> 
          <h2 className="text-2xl font-light text-white tracking-wide"> 
            {editingArtwork ? 'Edit Artwork' : 'New Artwork'} 
          </h2> 
          <p className="text-slate-500 text-[9px] uppercase tracking-[0.2em] mt-1"> 
            WebP 82% Quality • Automatic Conversion 
          </p> 
          <button   
            onClick={() => !loading && onClose()}   
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-800/50 border border-slate-700/50 hover:border-red-500/50 flex items-center justify-center text-slate-400 hover:text-red-400 transition-all cursor-pointer" 
          > 
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg> 
          </button> 
        </div> 

        <form onSubmit={handleUpload} className="p-8 space-y-6 overflow-y-auto custom-scrollbar"> 
          <div className="aspect-video w-full rounded-xl overflow-hidden border-2 border-dashed border-slate-700 bg-slate-950 group relative transition-all hover:border-blue-500/40 shrink-0"> 
            {previewUrl ? ( 
              <> 
                <img src={previewUrl} className="w-full h-full object-contain" alt="Preview" /> 
                <label className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer backdrop-blur-sm"> 
                  <span className="text-white text-[10px] font-bold uppercase tracking-[0.2em] border border-white/20 px-4 py-2 rounded-full bg-white/5">Change File</span> 
                  <input type="file" className="hidden" accept="image/png, image/jpeg, image/jpg, image/webp" onChange={(e) => { 
                    const f = e.target.files?.[0]; 
                    if (f) handleFileChange(f);
                  }} /> 
                </label> 
              </> 
            ) : ( 
              <label className="flex flex-col items-center justify-center h-full cursor-pointer hover:bg-slate-900/50 transition-colors group"> 
                <svg className="w-12 h-12 text-slate-800 group-hover:text-blue-500 group-hover:scale-110 transition-all mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"> 
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /> 
                </svg> 
                <span className="text-slate-400 uppercase text-[10px] font-bold tracking-[0.2em] mb-3"> 
                  Select Artwork 
                </span> 
                <div className="w-8 h-[1px] bg-slate-800 mb-4 group-hover:w-12 group-hover:bg-blue-500/50 transition-all" /> 
                <div className="flex gap-2"> 
                  {['PNG', 'JPG', 'JPEG', 'WEBP'].map((format) => ( 
                    <span key={format} className="text-[7px] font-black text-slate-600 border border-slate-800 px-1.5 py-0.5 rounded-[4px] tracking-widest group-hover:text-slate-500 group-hover:border-slate-700 transition-colors"> 
                      {format} 
                    </span> 
                  ))} 
                </div> 
                <input type="file" className="hidden" accept="image/png, image/jpeg, image/jpg, image/webp" onChange={(e) => { 
                  const f = e.target.files?.[0]; 
                  if (f) handleFileChange(f);
                }} required={!editingArtwork} /> 
              </label> 
            )} 
          </div> 

          {isOptimized && (
            <div className="flex items-center gap-2 px-1 py-1 animate-in fade-in duration-500">
              <div className="flex-shrink-0 w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <svg className="w-2.5 h-2.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-[9px] font-bold text-emerald-500/90 uppercase tracking-[0.15em]">
                ✔ Image optimized for web (resized automatically)
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6"> 
            <div className="col-span-2"> 
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Title</label> 
              <input   
                type="text"   
                value={formData.title}   
                onChange={e => setFormData({...formData, title: e.target.value})}   
                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-800"   
                placeholder="Your artwork title..." 
                required   
              /> 
            </div> 
                
            <div> 
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Category</label>
              <select   
                value={formData.category}   
                onChange={e => setFormData({...formData, category: e.target.value})}   
                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none cursor-pointer focus:border-blue-500 transition-all appearance-none" 
                required
              > 
                <option value="" disabled className="bg-slate-900 text-slate-500">Select Category</option>
                {availableCategories.map(c => (
                  <option key={c.id} value={c.name} className="bg-slate-900">
                    {c.name}
                  </option>
                ))} 
              </select> 
            </div> 

            <div> 
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Type (Theme)</label>
              <select   
                value={formData.type}   
                onChange={e => setFormData({...formData, type: e.target.value})}   
                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none cursor-pointer focus:border-blue-500 transition-all appearance-none"   
                required 
              > 
                <option value="" disabled className="bg-slate-900 text-slate-500">Choose a type</option> 
                {availableTypes.map(t => (
                  <option key={t.id} value={t.name} className="bg-slate-900">
                    {t.name}
                  </option>
                ))} 
              </select> 
            </div> 
          </div> 

          <div className="flex gap-4 pt-4 shrink-0"> 
            <button type="button" onClick={onClose} disabled={loading} className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50"> 
              Cancel 
            </button> 
            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 cursor-pointer"> 
              {loading ? `Uploading ${uploadProgress}%` : editingArtwork ? 'Save Changes' : 'Publish Artwork'} 
            </button> 
          </div> 
        </form>
      </div> 

      <style jsx>{` 
        .custom-scrollbar::-webkit-scrollbar { width: 4px; } 
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } 
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; } 
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3b82f6; } 
      `}</style> 
    </div> 
  ); 
}