import { useEffect, useState } from "react";
import { SignalCard } from "@/components/signal-card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useSimulation } from "@/hooks/useSimulation";

export const Signals = () => {
  const { houses, games, signals, isLoading, refreshData } = useSimulation();
  const [filter, setFilter] = useState<string>('all');
  const { profile } = useAuth();

  // Filtra sinais conforme plano do usuário
  let filteredSignals = signals;
  if (profile?.plan === 'premium') {
    // premium users see non-VIP signals (we consider VIP = prob >= 85)
    filteredSignals = signals.filter(signal => signal.probability < 85);
  } else if (profile?.plan === 'vip') {
    filteredSignals = signals;
  } else {
    filteredSignals = [];
  }

  const filterOptions = [
    { value: 'all', label: 'Todos', icon: '🔄' },
    { value: 'golden_moment', label: 'Momento Ouro', icon: '⭐' },
    { value: 'bonus_sequence', label: 'Sequência Bônus', icon: '🎁' },
    { value: 'victory_pattern', label: 'Padrão Vitória', icon: '🏆' },
  ];
  if (filter !== 'all') {
    filteredSignals = filteredSignals.filter(signal => signal.type === filter);
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-primary p-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Sinais</h1>
            <p className="text-white/80 text-sm">Acompanhe todos os sinais</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refreshData()}
            disabled={isLoading}
            className="bg-white/20 text-white border-none hover:bg-white/30"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm text-center">
            <div className="text-lg font-bold text-white">{filteredSignals.length}</div>
            <div className="text-white/80 text-xs">Ativos</div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm text-center">
            <div className="text-lg font-bold text-white">{signals.length}</div>
            <div className="text-white/80 text-xs">Total</div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm text-center">
            <div className="text-lg font-bold text-white">0%</div>
            <div className="text-white/80 text-xs">Média</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Filters */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-foreground" />
            <h2 className="text-lg font-semibold text-foreground">Filtros</h2>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            {filterOptions.map((option) => (
              <Button
                key={option.value}
                variant={filter === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(option.value)}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap",
                  filter === option.value && "bg-primary text-primary-foreground"
                )}
              >
                <span>{option.icon}</span>
                <span>{option.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Signals List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-lg p-4 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-muted rounded-full"></div>
                  <div className="space-y-2">
                    <div className="w-24 h-4 bg-muted rounded"></div>
                    <div className="w-32 h-3 bg-muted rounded"></div>
                  </div>
                </div>
                <div className="w-full h-4 bg-muted rounded mb-3"></div>
                <div className="flex justify-between">
                  <div className="w-16 h-4 bg-muted rounded"></div>
                  <div className="w-12 h-4 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredSignals.length > 0 ? (
          <div className="space-y-4">
            {filteredSignals.map((signal) => {
              const game = (signal.gameId && signal.gameId !== undefined) ? (/**/ null) : null; // placeholder to keep TS happy
              // find matching game and house from the signals data structures
              const g = (signal.gameId ? undefined : undefined) as any; // noop for types
              // actual lookup using arrays available in this component
              // (we rely on the `games` and `houses` arrays from the simulation hook)
              const gameMatch = games.find((g) => g.id === signal.gameId);
              const houseMatch = houses.find((h) => h.id === signal.houseId);
              if (!gameMatch || !houseMatch) return null;
              return (
                <SignalCard
                  key={signal.id}
                  signal={signal}
                  game={gameMatch}
                  house={houseMatch}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-12">
            Nenhum sinal encontrado.
          </div>
        )}
      </div>
    </div>
  );
};