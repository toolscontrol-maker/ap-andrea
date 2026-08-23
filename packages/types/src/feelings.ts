export type EmotionCategory =
  | 'alegria'
  | 'tristeza'
  | 'miedo'
  | 'ira'
  | 'sorpresa'
  | 'amor'
  | 'vulnerabilidad'
  | 'paz';

export interface EmotionTagItem {
  id: string;
  name: string;
  category: EmotionCategory;
  color: string;
  icon?: string;
}

export interface NonViolentCommunicationForm {
  situation: string;      // Observación neutra: "Qué ocurrió exactamente"
  thought: string;        // Interpretación: "Qué pensamiento automático surgió"
  emotions: string[];     // Emociones identificadas
  bodySensation: string;  // Sensación somática: "Tensión en el pecho", etc.
  need: string;           // Necesidad universal no satisfecha o celebrada
  request?: string;       // Petición concreta, positiva y realizable
  visibility: 'private' | 'shared';
}
