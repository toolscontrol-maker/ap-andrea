import { useState, useEffect } from 'react';
import { useDev } from '../context/DevContext';
import { Profile } from '@andrea/types';

export function useAuth() {
  const dev = useDev();

  const profile: Profile = {
    id: dev.currentDevUser.id,
    name: dev.currentDevUser.name,
    avatar_url: null,
    partner_id: dev.partnerDevUser.id,
    pairing_code: '123456',
    paired_at: '2026-01-01T00:00:00Z',
    subscription_status: dev.isPremium ? 'active' : 'free',
    subscription_owner_id: dev.currentDevUser.id,
    encryption_pubkey: 'mock-pubkey-base64',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  };

  const user = {
    id: dev.currentDevUser.id,
    email: `${dev.currentDevUser.name.toLowerCase()}@andrea.app`
  };

  return {
    user,
    profile,
    loading: false,
    isUnlocked: true,
    signIn: async () => {},
    signUp: async () => {},
    signOut: async () => {},
    refreshProfile: () => {}
  };
}
