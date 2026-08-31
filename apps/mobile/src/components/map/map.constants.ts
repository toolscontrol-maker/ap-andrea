import { AndreaMapPlace, MapCameraState } from '../../types/map';

export const DEFAULT_MAP_CAMERA: MapCameraState = {
  latitude: 39.4699,
  longitude: -0.3763,
  zoom: 12.5,
};

export const MAP_CLUSTER_CONFIG = {
  radius: 58,
  maxZoom: 16,
  showIndividualPinsAtZoom: 13,
  showShortLabelAtZoom: 16,
} as const;

export const DEMO_MAP_PLACES: AndreaMapPlace[] = [];
