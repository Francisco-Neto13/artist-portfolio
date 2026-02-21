'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const MAX_STORAGE = 1 * 1024 * 1024 * 1024;

export default function StorageMeter({ refreshTrigger }: { refreshTrigger?: any }) {
  const [usage, setUsage] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchUsage = async () => {
    try {
      const { data, error } = await supabase.rpc('get_storage_usage');
      if (!error) setUsage(data || 0);
    } catch (err) {
      console.error('Failed to fetch storage usage:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, [refreshTrigger]);

  const percentage = Math.min((usage / MAX_STORAGE) * 100, 100);
  const usedMB = (usage / (1024 * 1024)).toFixed(1);
  const isWarning = percentage > 85;
  const isCritical = percentage > 90;

  const barColor = isCritical
    ? 'from-red-700 to-red-500'
    : isWarning
    ? 'from-amber-700 to-amber-500'
    : 'from-blue-700 to-blue-500';

  const glowColor = isCritical
    ? 'rgba(239,68,68,0.5)'
    : isWarning
    ? 'rgba(245,158,11,0.5)'
    : 'rgba(59,130,246,0.4)';

  const statusDot = isCritical
    ? 'bg-red-500 animate-pulse'
    : isWarning
    ? 'bg-amber-500 animate-pulse'
    : 'bg-emerald-500';

  const statusLabel = isCritical ? 'Critical' : isWarning ? 'Warning' : 'Healthy';

  return (
    <div className="relative w-full border-b border-white/[0.03] bg-slate-950">

      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-600">
            Storage
          </span>
          {!loading && (
            <span className="text-[9px] font-mono text-slate-700">
              {usedMB} MB / 1024 MB
            </span>
          )}
        </div>

        {!loading && (
          <span className={`text-[9px] font-bold tabular-nums tracking-wider ${
            isCritical ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-slate-600'
          }`}>
            {percentage.toFixed(1)}% · {statusLabel}
          </span>
        )}
      </div>

      <div className="relative w-full h-[2px] bg-slate-900">
        {loading ? (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/40 to-transparent animate-pulse" />
        ) : (
          <div
            className={`absolute top-0 left-0 h-full bg-gradient-to-r ${barColor} transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]`}
            style={{
              width: `${percentage}%`,
              boxShadow: `0 0 8px ${glowColor}`,
            }}
          />
        )}
      </div>
    </div>
  );
}