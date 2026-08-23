import { AyaMode, AyaConsentScope, AyaResponse } from '@andrea/types';
import { supabase } from './supabase';

export const AyaClient = {
  /**
   * Invokes AYA psychological assistant via Supabase Edge Function
   */
  async askAya(
    userId: string,
    coupleId: string,
    question: string,
    mode: AyaMode = 'mediate',
    consentScope: AyaConsentScope = 'shared_only'
  ): Promise<AyaResponse> {
    const { data, error } = await supabase.functions.invoke('aya-assistant', {
      body: {
        userId,
        coupleId,
        question,
        mode,
        consentScope
      }
    });

    if (error) {
      throw new Error(error.message || 'Error comunicando con AYA');
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    return data as AyaResponse;
  }
};
