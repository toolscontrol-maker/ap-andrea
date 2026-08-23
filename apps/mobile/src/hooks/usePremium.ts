import { useMemo } from 'react';
import { useDev } from '../context/DevContext';
import { Profile } from '@andrea/types';

export function usePremium(_profile?: Profile | null, _partnerProfile?: Profile | null) {
  const dev = useDev();

  const isPremium = dev.isPremium;

  const features = useMemo(() => ({
    isPremium,
    ayaUnlimited: isPremium,
    unlimitedPhotos: isPremium,
    advancedInsights: isPremium,
    exportPdf: isPremium,
    surprisePlannerAdvanced: isPremium,
    mapHeatmaps: isPremium
  }), [isPremium]);

  return features;
}
