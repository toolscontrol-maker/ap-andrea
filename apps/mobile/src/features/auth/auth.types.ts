export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  partnerRole: 'tonet' | 'andrea';
}

export interface PairingState {
  isGenerating: boolean;
  code: string | null;
  countdownSeconds: number;
}
