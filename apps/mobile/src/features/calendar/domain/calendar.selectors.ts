import { CoupleEvent } from '@andrea/types';
import { SanitizedEventItem } from './calendar.types';

/**
 * Anti-spoiler selector that transforms raw CoupleEvents into a sanitized view
 * according to the currently active user role and the event's reveal state.
 */
export function sanitizeCoupleEvents(
  events: CoupleEvent[],
  currentUserId: string,
  currentDateIso: string = '2026-08-23T18:00:00'
): SanitizedEventItem[] {
  return events.map((ev) => {
    const isOwner = ev.ownerId === currentUserId;
    const isAlreadyRevealed =
      ev.status === 'revealed' ||
      ev.revealPolicy === 'immediately' ||
      (ev.revealAt && currentDateIso >= ev.revealAt);

    if (isOwner) {
      // Owner sees everything clearly (title, notes, location)
      return {
        id: ev.id,
        eventType: ev.eventType,
        date: ev.date,
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
        date: ev.date,
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
      date: ev.date,
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
    if (!map[ev.date]) map[ev.date] = [];
    map[ev.date].push(ev);
  }
  return map;
}
