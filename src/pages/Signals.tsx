import { useEffect, useMemo, useState } from "react";
import { SignalCard } from "@/components/signal-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useSimulation } from "@/hooks/useSimulation";
import type { Signal } from "@/types";
import {
  RefreshCw,
  Sparkles,
  Sun,
  Repeat,
  Target,
  Crown,
  Flame,
  Activity,
} from "lucide-react";

type FilterOption = "all" | Signal["type"] | "vip";

const formatTime = (date: Date) => {
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};

export const Signals = () => {
  const { houses, games, isLoading, refreshData, getHotHouses, getActiveSignals } = useSimulation();
  const { profile } = useAuth();
  const [filter, setFilter] = useState<FilterOption>("all");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeSignals = useMemo(() => getActiveSignals(), [getActiveSignals]);

  const filteredSignals = useMemo(() => {
    let list = activeSignals;
    if (profile?.plan === "premium") {
      list = list.filter(signal => !signal.vipOnly);
    } else if (!profile || profile.plan === "basico") {
      list = [];
    }

    if (filter === "all") return list;
    if (filter === "vip") return list.filter(signal => signal.vipOnly);
    return list.filter(signal => signal.type === filter);
  }, [activeSignals, filter, profile]);

  const totalActive = filteredSignals.length;
  const averageConfidence = totalActive
    ? Math.round(filteredSignals.reduce((acc, signal) => acc + signal.probability, 0) / totalActive)
    : 0;
  const vipCount = filteredSignals.filter(signal => signal.vipOnly).length;
  const highlightedSignal = filteredSignals[0];
  const otherSignals = highlightedSignal ? filteredSignals.slice(1) : filteredSignals;
  const hotHouses = useMemo(() => getHotHouses().slice(0, 3), [getHotHouses]);

  const filterOptions: { value: FilterOption; label: string; icon: JSX.Element }[] = [
    { value: "all", label: "Todos", icon: <Sparkles className="w-4 h-4" /> },
    { value: "golden_moment", label: "Momento Ouro", icon: <Sun className="w-4 h-4" /> },
    { value: "bonus_sequence", label: "Sequência Bônus", icon: <Repeat className="w-4 h-4" /> },
    { value: "victory_pattern", label: "Padrão Vitória", icon: <Target className="w-4 h-4" /> },
    { value: "vip", label: "VIP", icon: <Crown className="w-4 h-4" /> },
  ];

  const renderSignalCard = (signal: Signal) => {
    const game = games.find(g => g.id === signal.gameId);
    const house = houses.find(h => h.id === signal.houseId);
    if (!game || !house) return null;
    return (
      <SignalCard
        key={signal.id}
        signal={signal}
        game={game}
        house={house}
        currentTime={now}
      />
    );
  };

  const planLocked = !profile || profile.plan === "basico";

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-gradient-primary p-6 pb-10 text-white">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <Badge variant="outline" className="border-white/20 bg-white/10 text-white/80 mb-2">
              Atualizado em {formatTime(new Date(now))}
            </Badge>
            <h1 className="text-3xl font-bold leading-tight">Sinais ao vivo</h1>
            <p className="text-white/80 text-sm max-w-lg">
              Acompanhe os sinais gerados em tempo real com probabilidades calibradas e monitoramento de tempo restante.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={refreshData}
            disabled={isLoading}
            className="bg-white/15 text-white border-white/20 hover:bg-white/25 self-end md:self-auto"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Atualizar
          </Button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Activity className="w-4 h-4" />
              Ativos
            </div>
            <div className="text-2xl font-semibold">{totalActive}</div>
          </div>
          <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Sparkles className="w-4 h-4" />
              Confiança média
            </div>
            <div className="text-2xl font-semibold">{averageConfidence}%</div>
          </div>
          <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Crown className="w-4 h-4" />
              VIP ativos
            </div>
            <div className="text-2xl font-semibold">{vipCount}</div>
          </div>
          <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Flame className="w-4 h-4" />
              Casas em alta
            </div>
            <div className="flex gap-2 mt-2 flex-wrap">
              {hotHouses.length === 0 ? (
                <span className="text-sm text-white/70">Carregando...</span>
              ) : (
                hotHouses.map((house) => (
                  <Badge key={house.id} className="bg-white/15 border-white/20 text-white/85">
                    {house.name}
                  </Badge>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <div className="rounded-xl border border-border bg-card/80 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Repeat className="w-5 h-5 text-muted-foreground" />
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
                  "flex items-center gap-2",
                  filter === option.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-card/40"
                )}
              >
                {option.icon}
                <span>{option.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {planLocked && (
          <div className="rounded-xl border border-primary/40 bg-primary/10 p-6 text-center text-foreground">
            <h3 className="text-xl font-semibold mb-2">Faça upgrade para liberar os sinais ao vivo</h3>
            <p className="text-muted-foreground mb-4">
              Atualize para o plano Premium ou VIP e acompanhe os sinais em tempo real com maior precisão.
            </p>
            <Button asChild className="bg-gradient-primary text-primary-foreground">
              <a href="/plans">Ver planos disponíveis</a>
            </Button>
          </div>
        )}

        {!planLocked && (
          <>
            {isLoading && (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="rounded-lg border border-border bg-card/70 p-4 animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-muted" />
                      <div className="space-y-2">
                        <div className="h-4 w-36 rounded bg-muted" />
                        <div className="h-3 w-48 rounded bg-muted" />
                      </div>
                    </div>
                    <div className="h-2 w-full rounded bg-muted mb-3" />
                    <div className="flex gap-3">
                      <div className="h-4 w-20 rounded bg-muted" />
                      <div className="h-4 w-16 rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && highlightedSignal && (
              <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-background p-1">
                {renderSignalCard(highlightedSignal)}
              </div>
            )}

            {!isLoading && otherSignals.length > 0 && (
              <div className="space-y-4">
                {otherSignals.map(renderSignalCard)}
              </div>
            )}

            {!isLoading && filteredSignals.length === 0 && (
              <div className="rounded-xl border border-border bg-card/80 p-8 text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum sinal disponível</h3>
                <p className="text-muted-foreground">
                  Aguarde alguns instantes enquanto geramos novos sinais com base nas tendências das casas.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
