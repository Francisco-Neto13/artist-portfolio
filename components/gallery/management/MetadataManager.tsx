'use client';
import { useState } from 'react';
import { CATEGORY_NAME_MAX, THEME_NAME_MAX } from '../types';
import MetadataToasts, { Toast } from './MetadataToasts';
import MetadataConfirmModal, { ConfirmState } from './MetadataConfirmModal';
import MetadataList from './MetadataList';

interface MetadataManagerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: { id: string; name: string }[];
  onAdd: (name: string) => Promise<void>;
  onRemove: (id: string, name: string) => Promise<void>;
  onSwitchType?: (type: 'category' | 'theme') => void;
  activeType?: 'category' | 'theme';
  onCheckCount?: (id: string, name: string) => Promise<number>;
}

export default function MetadataManager({
  isOpen, onClose, title, items, onAdd, onRemove,
  onSwitchType, activeType = 'category', onCheckCount
}: MetadataManagerProps) {
  const [newName, setNewName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);

  const currentMax = activeType === 'category' ? CATEGORY_NAME_MAX : THEME_NAME_MAX;

  if (!isOpen) return null;

  const pushToast = (message: string, type: Toast['type'] = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const handleAdd = async () => {
    if (!newName.trim() || newName.length > currentMax) return;
    setIsSubmitting(true);
    try {
      await onAdd(newName.trim());
      pushToast(`"${newName.trim()}" added successfully.`, 'success');
      setNewName('');
    } catch {
      pushToast('Failed to add. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestRemove = async (id: string, name: string) => {
    const count = onCheckCount ? await onCheckCount(id, name) : 0;
    setConfirmState({ id, name, artworkCount: count });
  };

  const confirmRemove = async () => {
    if (!confirmState) return;
    const { id, name } = confirmState;
    setConfirmState(null);
    setRemovingId(id);
    try {
      await onRemove(id, name);
      pushToast(`"${name}" was removed.`, 'warning');
    } catch (err: any) {
      if (err?.message?.startsWith('in_use')) {
        const count = err.message.split(':')[1];
        pushToast(`"${name}" is linked to ${count} artwork${Number(count) !== 1 ? 's' : ''} and cannot be deleted.`, 'error');
      } else {
        pushToast('Something went wrong. Please try again.', 'error');
      }
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <>
      <MetadataToasts toasts={toasts} />
      <MetadataConfirmModal
        confirmState={confirmState}
        activeType={activeType}
        onConfirm={confirmRemove}
        onCancel={() => setConfirmState(null)}
      />

      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl" onClick={onClose}>
        <div
          className="relative bg-slate-900/80 border border-white/[0.06] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
          style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 64px rgba(0,0,0,0.7)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

          <div className="px-6 pt-6 pb-5">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Manage</p>
              <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-all cursor-pointer">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {onSwitchType && (
            <div className="px-6 pb-5">
              <div className="flex gap-1 p-1 bg-slate-950/60 rounded-xl border border-white/5">
                {(['category', 'theme'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      onSwitchType(type);
                      setNewName(''); 
                    }}
                    className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer ${
                      activeType === type ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {type === 'category' ? 'Categories' : 'Themes'}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent mx-6" />

          <div className="px-6 pt-5 pb-6 space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <span className="text-[8px] font-bold text-blue-500 uppercase tracking-wider">New {activeType} Name</span>
                <span className={`text-[8px] font-bold transition-colors ${newName.length >= currentMax ? 'text-red-500' : 'text-slate-600'}`}>
                  {newName.length}/{currentMax}
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={currentMax}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  placeholder="Type a name..."
                  className="flex-1 bg-slate-950/80 border border-white/[0.06] rounded-xl px-4 py-3 text-white text-xs placeholder:text-slate-700 outline-none focus:border-blue-500/50 focus:bg-slate-950 transition-all"
                />
                <button
                  onClick={handleAdd}
                  disabled={isSubmitting || !newName.trim() || newName.length > currentMax}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl transition-all cursor-pointer flex items-center justify-center shadow-lg shadow-blue-500/20"
                >
                  {isSubmitting ? (
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <MetadataList
              items={items}
              activeType={activeType}
              removingId={removingId}
              onRemove={requestRemove}
            />

            <p className="text-[10px] text-slate-500 text-center tracking-widest uppercase">
              {items.length} {items.length === 1 ? activeType : `${activeType}s`}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}