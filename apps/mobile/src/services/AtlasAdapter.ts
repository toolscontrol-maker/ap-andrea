import {
  AtlasPlace,
  AtlasExperience,
  AtlasExperienceItem,
  AtlasMemory,
  AtlasMemoryLink,
  AtlasChapter,
  AtlasChapterItem,
  MapMarker,
  MapExplorationMode,
  PlaceKind,
  ExperienceKind,
} from '@andrea/types';
import { AndreaMapPlace } from '../types/map';

export interface NormalizedAtlasState {
  places: AtlasPlace[];
  experiences: AtlasExperience[];
  experienceItems: AtlasExperienceItem[];
  memories: AtlasMemory[];
  memoryLinks: AtlasMemoryLink[];
  chapters: AtlasChapter[];
  chapterItems: AtlasChapterItem[];
}

export class AtlasAdapter {
  public static normalizeLegacyPlaces(legacyPlaces: AndreaMapPlace[]): NormalizedAtlasState {
    const state: NormalizedAtlasState = {
      places: [],
      experiences: [],
      experienceItems: [],
      memories: [],
      memoryLinks: [],
      chapters: [],
      chapterItems: [],
    };

    if (!Array.isArray(legacyPlaces)) return state;

    for (const lp of legacyPlaces) {
      if (!lp || !lp.id) continue;

      // Map kind
      let placeKind: PlaceKind = 'other';
      if (lp.type === 'restaurant') placeKind = 'restaurant';
      else if (lp.type === 'stage') placeKind = 'home';
      else if (lp.type === 'future_place') placeKind = 'future_destination';
      else if (lp.type === 'trip') placeKind = 'landmark';
      else if (lp.type === 'date') placeKind = 'venue';
      else if (lp.type === 'memory') placeKind = 'landmark';

      const place: AtlasPlace = {
        id: lp.id,
        coupleId: 'andrea-tonet',
        kind: placeKind,
        name: lp.title || 'Rincón',
        subtitle: lp.subtitle || lp.formattedAddress,
        description: lp.description,
        address: lp.formattedAddress,
        city: lp.city || 'Valencia',
        latitude: lp.latitude,
        longitude: lp.longitude,
        coverImageUrl: lp.imageUrl || (lp.photos && lp.photos[0]),
        photos: lp.photos || [],
        createdByUserId: 'tonet',
        createdAt: lp.date ? new Date(lp.date).toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.places.push(place);

      // If legacy place was an experience (date, trip, surprise)
      if (lp.type === 'date' || lp.type === 'trip' || lp.type === 'surprise') {
        let expKind: ExperienceKind = 'plan';
        if (lp.type === 'date') expKind = 'date';
        else if (lp.type === 'trip') expKind = 'trip';
        else if (lp.type === 'surprise') expKind = 'surprise';

        const expId = 'exp_' + lp.id;
        const exp: AtlasExperience = {
          id: expId,
          coupleId: 'andrea-tonet',
          kind: expKind,
          status: 'completed',
          title: lp.title,
          summary: lp.description,
          startsAt: lp.date,
          visibility: lp.isPrivate ? 'private' : 'shared',
          revealPolicy: lp.type === 'surprise' ? 'manual' : 'immediate',
          coverImageUrl: place.coverImageUrl,
          photos: place.photos,
          invitedBy: lp.invitedBy,
          createdByUserId: 'tonet',
          createdAt: place.createdAt,
          updatedAt: place.updatedAt,
        };
        state.experiences.push(exp);

        state.experienceItems.push({
          id: 'ei_' + expId + '_' + place.id,
          parentExperienceId: expId,
          placeId: place.id,
          role: 'destination',
          position: 0,
        });
      }

      // If legacy place was a stage/chapter (Canet, Comte del Real)
      if (lp.type === 'stage') {
        const chapId = 'chap_' + lp.id;
        const chapter: AtlasChapter = {
          id: chapId,
          coupleId: 'andrea-tonet',
          kind: 'home',
          title: lp.title,
          summary: lp.stageSummary || lp.description,
          startsAt: lp.startDate,
          endsAt: lp.endDate,
          isOngoing: lp.isOngoing ?? false,
          coverImageUrl: place.coverImageUrl,
          colorTheme: 'gold',
          anchorPlaceId: place.id,
          createdByUserId: 'tonet',
          createdAt: place.createdAt,
          updatedAt: place.updatedAt,
        };
        state.chapters.push(chapter);

        state.chapterItems.push({
          id: 'ci_' + chapId + '_' + place.id,
          chapterId: chapId,
          placeId: place.id,
          role: 'anchor',
          position: 0,
        });
      }

      // If it has memories or photos
      if (lp.type === 'memory' || (lp.photos && lp.photos.length > 0) || lp.description) {
        const memId = 'mem_' + lp.id;
        const mem: AtlasMemory = {
          id: memId,
          coupleId: 'andrea-tonet',
          title: lp.title,
          narrative: lp.description,
          occurredAt: lp.date,
          importance: 'special',
          emotionalTone: ['romantic'],
          coverImageUrl: place.coverImageUrl,
          photos: place.photos,
          createdByUserId: 'tonet',
          createdAt: place.createdAt,
          updatedAt: place.updatedAt,
        };
        state.memories.push(mem);

        state.memoryLinks.push({
          id: 'ml_' + memId + '_' + place.id,
          memoryId: memId,
          targetType: 'place',
          targetId: place.id,
          relationship: 'occurred_at',
        });
      }
    }

    return state;
  }

  /**
   * Derive MapMarkers projected for Mapbox based on exploration mode & subfilter
   */
  public static deriveMapMarkers(
    state: NormalizedAtlasState,
    mode: MapExplorationMode,
    filterKey: string = 'all'
  ): MapMarker[] {
    const markers: MapMarker[] = [];

    if (mode === 'places') {
      for (const place of state.places) {
        if (!place.latitude || !place.longitude) continue;

        let category: MapMarker['category'] = 'general';
        if (['restaurant', 'cafe', 'bar'].includes(place.kind)) category = 'food';
        else if (['home', 'family_home'].includes(place.kind)) category = 'home';
        else if (['hotel', 'accommodation'].includes(place.kind)) category = 'travel';
        else if (['nature', 'landmark'].includes(place.kind)) category = 'nature';
        else if (place.kind === 'future_destination') category = 'future';

        // Subfilter matching
        if (filterKey !== 'all') {
          if (filterKey === 'food' && category !== 'food') continue;
          if (filterKey === 'stay' && category !== 'travel') continue;
          if (filterKey === 'home' && category !== 'home') continue;
          if (filterKey === 'nature' && category !== 'nature') continue;
        }

        markers.push({
          id: 'marker_p_' + place.id,
          entityType: 'place',
          entityId: place.id,
          latitude: place.latitude,
          longitude: place.longitude,
          title: place.name,
          subtitle: place.subtitle,
          imageUrl: place.coverImageUrl,
          photos: place.photos,
          category,
          kind: place.kind,
          badgeText: place.city,
          visibility: 'shared',
          itemCount: place.photos?.length || 0,
          rawEntity: place,
        });
      }
    } else if (mode === 'moments') {
      // Show experiences & memories linked to places
      for (const memory of state.memories) {
        const link = state.memoryLinks.find((ml) => ml.memoryId === memory.id && ml.targetType === 'place');
        if (!link) continue;
        const place = state.places.find((p) => p.id === link.targetId);
        if (!place || !place.latitude || !place.longitude) continue;

        if (filterKey !== 'all' && filterKey !== 'memories') continue;

        markers.push({
          id: 'marker_m_' + memory.id,
          entityType: 'memory',
          entityId: memory.id,
          latitude: place.latitude,
          longitude: place.longitude,
          title: memory.title,
          subtitle: memory.narrative || place.name,
          imageUrl: memory.coverImageUrl || place.coverImageUrl,
          photos: memory.photos || place.photos,
          category: 'memory',
          kind: 'memory',
          badgeText: memory.occurredAt || 'Recuerdo',
          visibility: 'shared',
          itemCount: memory.photos?.length || 0,
          rawEntity: memory,
        });
      }

      for (const exp of state.experiences) {
        const item = state.experienceItems.find((ei) => ei.parentExperienceId === exp.id && ei.placeId);
        if (!item || !item.placeId) continue;
        const place = state.places.find((p) => p.id === item.placeId);
        if (!place || !place.latitude || !place.longitude) continue;

        if (filterKey !== 'all') {
          if (filterKey === 'dates' && exp.kind !== 'date') continue;
          if (filterKey === 'trips' && exp.kind !== 'trip' && exp.kind !== 'getaway') continue;
          if (filterKey === 'surprises' && exp.kind !== 'surprise') continue;
        }

        markers.push({
          id: 'marker_e_' + exp.id,
          entityType: 'experience',
          entityId: exp.id,
          latitude: place.latitude,
          longitude: place.longitude,
          title: exp.title,
          subtitle: exp.summary || place.name,
          imageUrl: exp.coverImageUrl || place.coverImageUrl,
          photos: exp.photos || place.photos,
          category: exp.kind === 'date' ? 'date' : 'travel',
          kind: exp.kind,
          badgeText: exp.startsAt || 'Cita / Plan',
          visibility: exp.visibility === 'recipient_limited' ? 'limited' : 'shared',
          itemCount: exp.photos?.length || 0,
          rawEntity: exp,
        });
      }
    } else if (mode === 'chapters') {
      for (const chapter of state.chapters) {
        let place: AtlasPlace | undefined;
        if (chapter.anchorPlaceId) {
          place = state.places.find((p) => p.id === chapter.anchorPlaceId);
        }
        if (!place) {
          const ci = state.chapterItems.find((c) => c.chapterId === chapter.id && c.placeId);
          if (ci && ci.placeId) place = state.places.find((p) => p.id === ci.placeId);
        }

        if (!place || !place.latitude || !place.longitude) continue;

        markers.push({
          id: 'marker_c_' + chapter.id,
          entityType: 'chapter',
          entityId: chapter.id,
          latitude: place.latitude,
          longitude: place.longitude,
          title: chapter.title,
          subtitle: chapter.summary || place.name,
          imageUrl: chapter.coverImageUrl || place.coverImageUrl,
          photos: place.photos,
          category: 'home',
          kind: chapter.kind,
          badgeText: chapter.isOngoing ? 'Hogar actual' : (chapter.startsAt ? chapter.startsAt.substring(0, 4) : 'Etapa'),
          visibility: 'shared',
          itemCount: 1,
          rawEntity: chapter,
        });
      }
    }

    return markers;
  }
}
