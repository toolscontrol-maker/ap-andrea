import { CoupleEvent } from '@andrea/types';
import { SanitizedEventItem } from './calendar.types';
import { normalizeDateStr } from '../utils/calendarDateUtils';

/**
 * Anti-spoiler selector that transforms raw CoupleEvents into a sanitized view
 * according to the currently active user role and the event's reveal state.
 */
export function sanitizeCoupleEvents(
  events: CoupleEvent[],
  currentUserId: string,
  currentDateIso?: string
): SanitizedEventItem[] {
  const effectiveCurrentDateIso = currentDateIso || new Date().toISOString();

  return events.map((ev) => {
    const isOwner = ev.ownerId === currentUserId;
    const isAlreadyRevealed =
      ev.status === 'revealed' ||
      ev.revealPolicy === 'immediately' ||
      (ev.revealAt && effectiveCurrentDateIso >= ev.revealAt);

    const normDate = normalizeDateStr(ev.date);

    if (isOwner) {
      // Owner sees everything clearly (title, notes, location)
      return {
        id: ev.id,
        eventType: ev.eventType,
        date: normDate,
        time: ev.time,
        title: ev.ownerView.title,
        subtitle: ev.ownerView.subtitle,
        description: ev.ownerView.description,
        locationName: ev.ownerView.locationName,
        notes: ev.ownerView.notes,
        isOwner: true,
        isRevealed: !!isAlreadyRevealed,
        isSecretSurprise: ev.eventType === 'surprise' && !isAlreadyRevealed,
        status: ev.status,
        ownerId: ev.ownerId,
        partnerId: ev.partnerId,
      };
    }

    // Partner Perspective (Anti-Spoiler Rules Applied)
    if (ev.eventType === 'surprise' && !isAlreadyRevealed) {
      // Secret surprise teaser view (No restaurant, no notes, no spoilers)
      return {
        id: ev.id,
        eventType: 'surprise',
        date: normDate,
        time: ev.partnerView.isSecret ? undefined : ev.time,
        title: ev.partnerView.title || '✨ Tienes un plan especial',
        subtitle: ev.partnerView.subtitle || 'Prepárate para un momento bonito juntos.',
        description: ev.partnerView.description,
        locationName: undefined, // Sanitized
        notes: undefined, // Sanitized private notes
        isOwner: false,
        isRevealed: false,
        isSecretSurprise: true,
        status: ev.status,
        ownerId: ev.ownerId,
        partnerId: ev.partnerId,
      };
    }

    // Shared plan or already revealed surprise
    return {
      id: ev.id,
      eventType: ev.eventType,
      date: normDate,
      time: ev.time,
      title: ev.ownerView.title,
      subtitle: ev.ownerView.subtitle,
      description: ev.ownerView.description,
      locationName: ev.ownerView.locationName,
      notes: undefined, // Private checklists remain private
      isOwner: false,
      isRevealed: true,
      isSecretSurprise: false,
      status: ev.status,
      ownerId: ev.ownerId,
      partnerId: ev.partnerId,
    };
  });
}

export function groupEventsByDate(events: SanitizedEventItem[]): Record<string, SanitizedEventItem[]> {
  const map: Record<string, SanitizedEventItem[]> = {};
  for (const ev of events) {
    const norm = normalizeDateStr(ev.date);
    if (!map[norm]) map[norm] = [];
    map[norm].push({ ...ev, date: norm });
  }
  return map;
}
