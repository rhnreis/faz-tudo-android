export interface BettingHouse {
  id: string;
  name: string;
  logo: string;
  status: 'hot' | 'cold' | 'normal';
  payoutRate: number;
  lastUpdate: Date;
  color: string;
  url: string;
}

export interface Game {
  id: string;
  name: string;
  icon: string;
  description: string;
  animal: 'tiger' | 'rabbit' | 'monkey' | 'lion' | 'elephant' | 'parrot';
  multiplier: number;
}

export interface Signal {
  id: string;
  gameId: string;
  houseId: string;
  message: string;
  probability: number;
  durationSeconds: number;
  expiresAt: Date;
  vipOnly: boolean;
  timestamp: Date;
  status: 'active' | 'expired' | 'upcoming';
  type: 'golden_moment' | 'bonus_sequence' | 'victory_pattern';
}

export interface SimulationState {
  houses: BettingHouse[];
  games: Game[];
  signals: Signal[];
  isLoading: boolean;
}
