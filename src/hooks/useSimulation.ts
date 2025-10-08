import { useState, useEffect, useCallback } from "react";
import { BettingHouse, Game, Signal, SimulationState } from "@/types";

const HOUSES: Omit<BettingHouse, "status" | "payoutRate" | "lastUpdate">[] = [
  { id: "1", name: "Bet365", logo: "🎯", color: "#FF6B6B", url: "https://www.bet365.com" },
  { id: "2", name: "Betano", logo: "🔥", color: "#4ECDC4", url: "https://www.betano.com" },
  { id: "3", name: "Sportingbet", logo: "💥", color: "#45B7D1", url: "https://www.sportingbet.com" },
  { id: "4", name: "1xBet", logo: "🚀", color: "#F7B731", url: "https://1xbet.com" },
  { id: "5", name: "Betfair", logo: "⭐", color: "#5F27CD", url: "https://www.betfair.com" },
];

const GAMES: Game[] = [
  { id: "1", name: "Tigrinho", icon: "🐅", description: "O clássico jogo do tigre", animal: "tiger", multiplier: 2.5 },
  { id: "2", name: "Coelhinho da Sorte", icon: "🐰", description: "Pulos de sorte e fortuna", animal: "rabbit", multiplier: 3.0 },
  { id: "3", name: "Macaco Milionário", icon: "🐵", description: "Travessuras que pagam", animal: "monkey", multiplier: 2.8 },
  { id: "4", name: "Leão Dourado", icon: "🦁", description: "O rei dos ganhos", animal: "lion", multiplier: 4.0 },
  { id: "5", name: "Elefante da Sorte", icon: "🐘", description: "Memória de vitórias", animal: "elephant", multiplier: 3.5 },
  { id: "6", name: "Papagaio Premiado", icon: "🦜", description: "Repete os ganhos", animal: "parrot", multiplier: 2.2 },
];

const SIGNAL_MESSAGES = [
  "Momento de Ouro ativado!",
  "Sequência de Bônus detectada!",
  "Padrão de Vitórias identificado!",
  "Alta probabilidade de ganho!",
  "Multiplicador em alta!",
  "Rodada especial liberada!",
];

const randomBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

interface DatabaseSignal {
  id: number;
  title?: string;
  description?: string;
  message?: string;
  created_at?: string;
  vip_only?: boolean | number;
}

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

  const generateRandomStatus = (): "hot" | "cold" | "normal" => {
    const rand = Math.random();
    if (rand < 0.2) return "hot";
    if (rand < 0.4) return "cold";
    return "normal";
  };

  const generatePayoutRate = (status: string): number => {
    switch (status) {
      case "hot":
        return Math.random() * 15 + 85;
      case "cold":
        return Math.random() * 20 + 60;
      default:
        return Math.random() * 10 + 75;
    }
  };

  const generateSignal = (gameId: string, houseId: string): Signal => {
    const types: Signal["type"][] = ["golden_moment", "bonus_sequence", "victory_pattern"];
    const type = types[Math.floor(Math.random() * types.length)];
    const game = GAMES.find(g => g.id === gameId)!;
    const house = HOUSES.find(h => h.id === houseId)!;
    const timestamp = new Date();
    const durationSeconds = randomBetween(60, 15 * 60);
    const probability = Math.random() * 25 + 70;
    const vipOnly = probability >= 88 || type === "golden_moment";

    return {
      id: `${Date.now()}-${Math.random()}`,
      gameId,
      houseId,
      message: `${game.name}: ${SIGNAL_MESSAGES[Math.floor(Math.random() * SIGNAL_MESSAGES.length)]} - ${house.name}`,
      probability,
      durationSeconds,
      expiresAt: new Date(timestamp.getTime() + durationSeconds * 1000),
      vipOnly,
      timestamp,
      status: "active",
      type,
    };
  };

  const refreshData = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: true }));

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

      const signalCount = Math.floor(Math.random() * 4) + 3;
      const generatedSignals: Signal[] = [];
      for (let i = 0; i < signalCount; i += 1) {
        const randomGame = GAMES[Math.floor(Math.random() * GAMES.length)];
        const randomHouse = houses[Math.floor(Math.random() * houses.length)];
        generatedSignals.push(generateSignal(randomGame.id, randomHouse.id));
      }

      (async () => {
        try {
          const API_BASE = import.meta.env.VITE_API_URL ?? "";
          const response = await fetch(`${API_BASE}/api/signals`);
          if (response.ok) {
            const dbSignals: DatabaseSignal[] = await response.json();
            const mapped = dbSignals.map((signal): Signal => {
              const randomGame = GAMES[Math.floor(Math.random() * GAMES.length)];
              const randomHouse = houses[Math.floor(Math.random() * houses.length)];
              const probability = signal.vip_only ? Math.random() * 7 + 88 : Math.random() * 15 + 70;
              const durationSeconds = randomBetween(60, 15 * 60);
              const createdAt = signal.created_at ? new Date(signal.created_at) : new Date();
              const startTime = Math.max(createdAt.getTime(), Date.now());
              return {
                id: `db-${signal.id}`,
                gameId: randomGame.id,
                houseId: randomHouse.id,
                message: signal.title || signal.description || signal.message || "Sinal",
                probability,
                durationSeconds,
                expiresAt: new Date(startTime + durationSeconds * 1000),
                vipOnly: Boolean(signal.vip_only),
                timestamp: createdAt,
                status: "active",
                type: "bonus_sequence" as const,
              };
            });

            setState(prev => ({
              ...prev,
              houses,
              signals: [...mapped, ...generatedSignals],
              isLoading: false,
            }));
            return;
          }
        } catch (error) {
          console.log("Could not fetch DB signals:", error);
        }

        setState(prev => ({
          ...prev,
          houses,
          signals: generatedSignals,
          isLoading: false,
        }));
      })();
    }, 1000);
  }, []);

  const getHotHouses = useCallback((): BettingHouse[] => {
    return state.houses
      .filter(house => house.status === "hot")
      .sort((a, b) => b.payoutRate - a.payoutRate);
  }, [state.houses]);

  const getActiveSignals = useCallback((): Signal[] => {
    const now = Date.now();
    return state.signals
      .filter(signal => signal.status === "active" && signal.expiresAt.getTime() > now)
      .sort((a, b) => a.expiresAt.getTime() - b.expiresAt.getTime());
  }, [state.signals]);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [refreshData]);

  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const now = Date.now();
        const activeSignals = prev.signals.filter(signal => signal.expiresAt.getTime() > now);
        if (activeSignals.length === prev.signals.length) {
          return prev;
        }
        return { ...prev, signals: activeSignals };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    ...state,
    refreshData,
    getHotHouses,
    getActiveSignals,
  };
};
