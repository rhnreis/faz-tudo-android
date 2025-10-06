import { useState, useEffect, useCallback } from 'react';
import { BettingHouse, Game, Signal, SimulationState } from '@/types';

const HOUSES: Omit<BettingHouse, 'status' | 'payoutRate' | 'lastUpdate'>[] = [
  { id: '1', name: 'Bet365', logo: '🎯', color: '#FF6B6B', url: 'https://www.bet365.com' },
  { id: '2', name: 'Betano', logo: '⚡', color: '#4ECDC4', url: 'https://www.betano.com' },
  { id: '3', name: 'Sportingbet', logo: '🍀', color: '#45B7D1', url: 'https://www.sportingbet.com' },
  { id: '4', name: '1xBet', logo: '💎', color: '#F7B731', url: 'https://1xbet.com' },
  { id: '5', name: 'Betfair', logo: '🏆', color: '#5F27CD', url: 'https://www.betfair.com' },
];

const GAMES: Game[] = [
  { id: '1', name: 'Tigrinho', icon: '🐅', description: 'O clássico jogo do tigre', animal: 'tiger', multiplier: 2.5 },
  { id: '2', name: 'Coelhinho da Sorte', icon: '🐰', description: 'Pulos de sorte e fortuna', animal: 'rabbit', multiplier: 3.0 },
  { id: '3', name: 'Macaco Milionário', icon: '🐵', description: 'Travessuras que pagam', animal: 'monkey', multiplier: 2.8 },
  { id: '4', name: 'Leão Dourado', icon: '🦁', description: 'O rei dos ganhos', animal: 'lion', multiplier: 4.0 },
  { id: '5', name: 'Elefante da Sorte', icon: '🐘', description: 'Memória de vitórias', animal: 'elephant', multiplier: 3.5 },
  { id: '6', name: 'Papagaio Premiado', icon: '🦜', description: 'Repete os ganhos', animal: 'parrot', multiplier: 2.2 },
];

const SIGNAL_MESSAGES = [
  'Momento de Ouro ativado!',
  'Sequência de Bônus detectada!',
  'Padrão de Vitórias identificado!',
  'Alta probabilidade de ganho!',
  'Multiplicador em alta!',
  'Rodada especial liberada!',
];

export const useSimulation = (): SimulationState & {
  refreshData: () => void;
  getHotHouses: () => BettingHouse[];
  getActiveSignals: () => Signal[];
} => {
  const [state, setState] = useState<SimulationState>({
    houses: [],
    games: GAMES,
    signals: [],
    isLoading: true,
  });

  const generateRandomStatus = (): 'hot' | 'cold' | 'normal' => {
    const rand = Math.random();
    if (rand < 0.2) return 'hot';
    if (rand < 0.4) return 'cold';
    return 'normal';
  };

  const generatePayoutRate = (status: string): number => {
    switch (status) {
      case 'hot': return Math.random() * 15 + 85; // 85-100%
      case 'cold': return Math.random() * 20 + 60; // 60-80%
      default: return Math.random() * 10 + 75; // 75-85%
    }
  };

  const generateSignal = (gameId: string, houseId: string): Signal => {
    const types: Signal['type'][] = ['golden_moment', 'bonus_sequence', 'victory_pattern'];
    const type = types[Math.floor(Math.random() * types.length)];
    const game = GAMES.find(g => g.id === gameId)!;
    const house = HOUSES.find(h => h.id === houseId)!;
    
    return {
      id: `${Date.now()}-${Math.random()}`,
      gameId,
      houseId,
      message: `${game.name}: ${SIGNAL_MESSAGES[Math.floor(Math.random() * SIGNAL_MESSAGES.length)]} - ${house.name}`,
      probability: Math.random() * 30 + 70, // 70-100%
      timestamp: new Date(),
      status: 'active',
      type,
    };
  };

  const refreshData = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    // Simulate API delay
    setTimeout(() => {
      const houses: BettingHouse[] = HOUSES.map(house => ({
        ...house,
        status: generateRandomStatus(),
        payoutRate: 0,
        lastUpdate: new Date(),
      })).map(house => ({
        ...house,
        payoutRate: generatePayoutRate(house.status),
      }));

      // Generate 3-6 random signals
      const signalCount = Math.floor(Math.random() * 4) + 3;
      const signals: Signal[] = [];
      
      for (let i = 0; i < signalCount; i++) {
        const randomGame = GAMES[Math.floor(Math.random() * GAMES.length)];
        const randomHouse = houses[Math.floor(Math.random() * houses.length)];
        signals.push(generateSignal(randomGame.id, randomHouse.id));
      }

      // Try to fetch signals from local DB and map them to the UI Signal shape
      (async () => {
        try {
          const API_BASE = (import.meta as any).env.VITE_API_URL || '';
          const res = await fetch(`${API_BASE}/api/signals`);
          if (res.ok) {
            const dbSignals: any[] = await res.json();
            // Map DB signals (which may have title/description/created_at/vip_only)
            const mapped = dbSignals.map(s => {
              // choose random game/house for DB signals so 'Apostar' button has a target
              const randomGame = GAMES[Math.floor(Math.random() * GAMES.length)];
              const randomHouse = houses[Math.floor(Math.random() * houses.length)];
              const probability = s.vip_only ? (Math.random() * 10 + 88) : (Math.random() * 15 + 70);
              return {
                id: `db-${s.id}`,
                gameId: randomGame.id,
                houseId: randomHouse.id,
                message: s.title || s.description || s.message || 'Sinal',
                probability,
                timestamp: s.created_at ? new Date(s.created_at) : new Date(),
                status: 'active',
                type: 'bonus_sequence' as const,
              } as Signal;
            });

            // merge DB signals with simulated ones (DB signals first)
            const merged = [...mapped, ...signals];

            setState(prev => ({
              ...prev,
              houses,
              signals: merged,
              isLoading: false,
            }));
            return;
          }
        } catch (e) {
          // ignore fetch errors and fall back to generated signals
          console.log('Could not fetch DB signals:', e);
        }

        // fallback if DB fetch failed
        setState(prev => ({
          ...prev,
          houses,
          signals,
          isLoading: false,
        }));
      })();
    }, 1000);
  }, []);

  const getHotHouses = useCallback((): BettingHouse[] => {
    return state.houses
      .filter(house => house.status === 'hot')
      .sort((a, b) => b.payoutRate - a.payoutRate);
  }, [state.houses]);

  const getActiveSignals = useCallback((): Signal[] => {
    return state.signals
      .filter(signal => signal.status === 'active')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [state.signals]);

  useEffect(() => {
    refreshData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [refreshData]);

  return {
    ...state,
    refreshData,
    getHotHouses,
    getActiveSignals,
  };
};