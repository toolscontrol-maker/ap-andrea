import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useCouple } from './CoupleProvider';
import { useAuth } from './AuthProvider';

export interface RealtimeSyncContextType {
  isRealtimeActive: boolean;
  lastEventTimestamp: string | null;
}

const RealtimeSyncContext = createContext<RealtimeSyncContextType | undefined>(undefined);

export const RealtimeSyncProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isConfigured } = useAuth();
  const { couple } = useCouple();
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);
  const [lastEventTimestamp, setLastEventTimestamp] = useState<string | null>(null);

  useEffect(() => {
    if (!isConfigured || !couple?.id) {
      setIsRealtimeActive(false);
      return;
    }

    const channelName = `couple-sync-${couple.id}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', filter: `couple_id=eq.${couple.id}` },
        () => {
          setLastEventTimestamp(new Date().toISOString());
        }
      )
      .subscribe((status) => {
        setIsRealtimeActive(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
      setIsRealtimeActive(false);
    };
  }, [isConfigured, couple?.id]);

  return (
    <RealtimeSyncContext.Provider value={{ isRealtimeActive, lastEventTimestamp }}>
      {children}
    </RealtimeSyncContext.Provider>
  );
};

export const useRealtimeSync = () => {
  const ctx = useContext(RealtimeSyncContext);
  if (!ctx) throw new Error('useRealtimeSync must be used within RealtimeSyncProvider');
  return ctx;
};
