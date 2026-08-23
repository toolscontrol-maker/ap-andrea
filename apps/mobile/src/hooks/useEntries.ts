import { useMemo } from 'react';
import { useDev } from '../context/DevContext';
import { DiaryEntryUI, EntryType, EntryVisibility, MoodTag } from '@andrea/types';

export function useEntries(_coupleId?: string | null, _currentUserId?: string | null, filterType?: EntryType) {
  const dev = useDev();

  const entries = useMemo(() => {
    return dev.entries
      .filter((e) => {
        // If private, only show if authored by current active role
        if (e.visibility === 'private') {
          return e.authorId === dev.currentDevUser.id && (filterType ? e.type === filterType : true);
        }
        // If shared, filter by type if provided
        return filterType ? e.type === filterType : true;
      })
      .map((e) => ({
        ...e,
        isMine: e.authorId === dev.currentDevUser.id
      }));
  }, [dev.entries, dev.currentDevUser.id, filterType]);

  const createEntry = async (
    type: EntryType,
    visibility: EntryVisibility,
    content: any,
    entryDate: string,
    moodTag?: MoodTag,
    location?: { lat: number; lng: number; name: string },
    ayaConsentBoth: boolean = false
  ) => {
    dev.addEntry({
      type,
      visibility,
      content,
      date: entryDate,
      moodTag,
      location,
      ayaConsentBoth: ayaConsentBoth || (dev.user1Consent && dev.user2Consent)
    });
  };

  return {
    entries,
    loading: false,
    createEntry,
    refreshEntries: async () => {}
  };
}
