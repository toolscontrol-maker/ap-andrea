import { useDev } from '../context/DevContext';
import { Profile } from '@andrea/types';

export function useCouple(_currentUserProfile?: Profile | null) {
  const dev = useDev();

  const partnerProfile: Profile = {
    id: dev.partnerDevUser.id,
    name: dev.partnerDevUser.name,
    avatar_url: null,
    partner_id: dev.currentDevUser.id,
    pairing_code: '654321',
    paired_at: '2026-01-01T00:00:00Z',
    subscription_status: dev.isPremium ? 'active' : 'free',
    subscription_owner_id: dev.currentDevUser.id,
    encryption_pubkey: 'mock-partner-pubkey-base64',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  };

  return {
    partnerProfile,
    coupleId: 'demo-couple-id',
    isPaired: true,
    loading: false,
    generateMyPairingCode: async () => '789123',
    enterPartnerPairingCode: async () => true,
    refreshCouple: () => {}
  };
}
