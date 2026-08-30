import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth, UserProfile } from './AuthProvider';
import { triggerHaptic } from '../utils/haptics';

export interface CoupleData {
  id: string;
  relationshipStartedAt?: string;
  partnerProfile?: UserProfile;
  isPaired: boolean;
}

export interface CoupleContextType {
  couple: CoupleData | null;
  isLoadingCouple: boolean;
  createPairingCode: () => Promise<{ code?: string; error?: string }>;
  redeemPairingCode: (code: string) => Promise<{ success: boolean; error?: string }>;
  refreshCouple: () => Promise<void>;
}

const CoupleContext = createContext<CoupleContextType | undefined>(undefined);

export const CoupleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isConfigured } = useAuth();
  const [couple, setCouple] = useState<CoupleData | null>(null);
  const [isLoadingCouple, setIsLoadingCouple] = useState(false);

  const fetchCoupleData = async () => {
    if (!isConfigured || !user) {
      setCouple(null);
      return;
    }

    setIsLoadingCouple(true);
    try {
      const { data: memberData } = await supabase
        .from('couple_members')
        .select('couple_id, role, status, couples(*)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!memberData || !memberData.couple_id) {
        setCouple(null);
        return;
      }

      const { data: partnerMember } = await supabase
        .from('couple_members')
        .select('user_id, profiles(*)')
        .eq('couple_id', memberData.couple_id)
        .neq('user_id', user.id)
        .eq('status', 'active')
        .single();

      const partnerProfile: UserProfile | undefined = partnerMember?.profiles
        ? {
            id: (partnerMember.profiles as any).id,
            displayName: (partnerMember.profiles as any).display_name,
            avatarPath: (partnerMember.profiles as any).avatar_path,
            roleDescription: (partnerMember.profiles as any).role_description,
          }
        : undefined;

      setCouple({
        id: memberData.couple_id,
        relationshipStartedAt: (memberData.couples as any)?.relationship_started_at,
        partnerProfile,
        isPaired: Boolean(partnerProfile),
      });
    } catch {
      setCouple(null);
    } finally {
      setIsLoadingCouple(false);
    }
  };

  useEffect(() => {
    fetchCoupleData();
  }, [user]);

  const createPairingCode = async (): Promise<{ code?: string; error?: string }> => {
    if (!isConfigured || !couple?.id) return { error: 'No hay pareja activa.' };
    triggerHaptic('medium');
    try {
      const { data, error } = await supabase.rpc('create_pairing_code', { p_couple_id: couple.id });
      if (error) return { error: error.message };
      return { code: data?.code };
    } catch (e: any) {
      return { error: e.message || 'Error al generar código' };
    }
  };

  const redeemPairingCode = async (code: string): Promise<{ success: boolean; error?: string }> => {
    if (!isConfigured) return { success: false, error: 'Supabase no configurado.' };
    triggerHaptic('success');
    try {
      const { data, error } = await supabase.rpc('redeem_pairing_code', { p_code: code });
      if (error) return { success: false, error: error.message };
      await fetchCoupleData();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Error al canjear código' };
    }
  };

  return (
    <CoupleContext.Provider
      value={{
        couple,
        isLoadingCouple,
        createPairingCode,
        redeemPairingCode,
        refreshCouple: fetchCoupleData,
      }}
    >
      {children}
    </CoupleContext.Provider>
  );
};

export const useCouple = () => {
  const ctx = useContext(CoupleContext);
  if (!ctx) throw new Error('useCouple must be used within a CoupleProvider');
  return ctx;
};
