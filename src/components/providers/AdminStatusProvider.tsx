'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { getAdminStatus, invalidateAdminStatusCache } from '@/lib/admin';

type AdminStatusContextValue = {
  isAdmin: boolean;
  isLoadingAdmin: boolean;
  refreshAdminStatus: (forceRefresh?: boolean) => Promise<boolean>;
};

const AdminStatusContext = createContext<AdminStatusContextValue | null>(null);

export function AdminStatusProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(true);

  const refreshAdminStatus = useCallback(async (forceRefresh = false) => {
    const nextStatus = await getAdminStatus({ forceRefresh });
    setIsAdmin(nextStatus);
    setIsLoadingAdmin(false);
    return nextStatus;
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void refreshAdminStatus();
    }, 0);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      invalidateAdminStatusCache();
      void refreshAdminStatus(true);
    });

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [refreshAdminStatus]);

  const value = useMemo(
    () => ({ isAdmin, isLoadingAdmin, refreshAdminStatus }),
    [isAdmin, isLoadingAdmin, refreshAdminStatus]
  );

  return (
    <AdminStatusContext.Provider value={value}>
      {children}
    </AdminStatusContext.Provider>
  );
}

export function useAdminStatus() {
  const context = useContext(AdminStatusContext);

  if (!context) {
    throw new Error('useAdminStatus must be used within AdminStatusProvider');
  }

  return context;
}
