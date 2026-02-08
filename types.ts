
export enum PokerSpot {
  VS_FISHES = 'vs Fishes',
  BB_VS_BTN = 'BB vs BTN',
  BTN_VS_BB = 'BTN vs BB',
  CO_VS_BTN = 'CO vs BTN',
  THREE_BET_IP = '3Bet IP',
  THREE_BET_OOP = '3Bet OOP',
  CALL_THREE_BET = 'Call 3Bet',
  MWP = 'MWP',
  SB_VS_BB = 'SB vs BB'
}

export interface TimestampHand {
  id: string;
  time: number;
  label: string;
  description: string;
}

export interface PokerVideo {
  id: string;
  title: string;
  spot: PokerSpot;
  fileUrl?: string; // Local blob URL
  fileName: string;
  notes: string;
  timestamps: TimestampHand[];
  createdAt: number;
}

export interface AppState {
  videos: PokerVideo[];
  selectedSpot: PokerSpot | 'All';
  activeVideoId: string | null;
}
