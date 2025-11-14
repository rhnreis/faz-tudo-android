import { useEffect, useMemo, useState } from "react";
import { useSimulation } from "@/hooks/useSimulation";
import { SignalCard } from "@/components/signal-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Signal } from "@/types";
import {
  RefreshCw,
  Crown,
  Star,
  Zap,
  TrendingUp,
  Lock,
  Sparkles,
  Sun,
  Repeat,
  Target,
} from "lucide-react";

type FilterValue = "all" | Signal["type"];

export const VipSignals = () => {
  const { houses, games, isLoading, refreshData, getActiveSignals } = useSimulation();
  const [filter, setFilter] = useState<FilterValue>("all");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeSignals = useMemo(() => getActiveSignals(), [getActiveSignals]);
  const vipSignals = useMemo(
    () => activeSignals.filter(signal => signal.probability >= 85),
    [activeSignals]
  );

  const filteredSignals = useMemo(() => {
    if (filter === "all") return vipSignals;
    return vipSignals.filter(signal => signal.type === filter);
  }, [filter, vipSignals]);

  const averageConfidence = vipSignals.length
    ? Math.round(vipSignals.reduce((acc, signal) => acc + signal.probability, 0) / vipSignals.length)
    : 0;
  const eliteCount = vipSignals.filter(signal => signal.probability >= 90).length;

  const filterOptions: { value: FilterValue; label: string; icon: JSX.Element }[] = [
    { value: "all", label: "Todos", icon: <Sparkles className="w-4 h-4" /> },
    { value: "golden_moment", label: "Momento Ouro", icon: <Sun className="w-4 h-4" /> },
    { value: "bonus_sequence", label: "Sequência VIP", icon: <Repeat className="w-4 h-4" /> },
    { value: "victory_pattern", label: "Padrão Elite", icon: <Target className="w-4 h-4" /> },
  ];

  const renderCard = (signal: Signal) => {
    const game = games.find(g => g.id === signal.gameId);
    const house = houses.find(h => h.id === signal.houseId);
    if (!game || !house) return null;
    return (
      <div key={signal.id} className="relative">
        <div className="absolute -top-2 -right-2 z-10">
          <Badge className="bg-rose-500 text-white border-none shadow-sm">
            <Crown className="w-3 h-3 mr-1" />
            VIP
          </Badge>
        </div>
        <SignalCard signal={signal} game={game} house={house} currentTime={now} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-gradient-to-br from-amber-300 via-amber-400 to-rose-400 p-6 pb-10 text-slate-900">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/40 backdrop-blur flex items-center justify-center shadow">
              <Crown className="w-7 h-7 text-amber-700" />
            </div>
            <div>
              <Badge variant="outline" className="border-amber-200 text-amber-800 bg-white/40 mb-2">
                Atualizado {new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(now)}
              </Badge>
              <h1 className="text-3xl font-bold">Sala VIP</h1>
              <p className="text-sm text-slate-800/80 max-w-xl">
                Sinais exclusivos com monitoramento avançado, pensados para quem busca precisão de elite.
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="self-end md:self-auto bg-white/50 text-amber-800 border-transparent hover:bg-white/70"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Atualizar
          </Button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white/45 p-4 shadow-sm">
            <div className="text-sm text-amber-800/80 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              VIP ativos
            </div>
            <div className="text-3xl font-semibold text-amber-900">{vipSignals.length}</div>
          </div>
          <div className="rounded-xl bg-white/45 p-4 shadow-sm">
            <div className="text-sm text-amber-800/80 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Confiança média
            </div>
            <div className="text-3xl font-semibold text-amber-900">{averageConfidence}%</div>
          </div>
          <div className="rounded-xl bg-white/45 p-4 shadow-sm">
            <div className="text-sm text-amber-800/80 flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Elite (90%+)
            </div>
            <div className="text-3xl font-semibold text-amber-900">{eliteCount}</div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <Card className="p-4 border-amber-100 bg-amber-50/60">
          <div className="flex items-center gap-3 mb-3">
            <Star className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-amber-800">Benefícios exclusivos</h3>
          </div>
          <div className="grid gap-3 text-sm md:grid-cols-2">
            <div className="flex items-center gap-2 text-amber-700">
              <Zap className="w-4 h-4" />
              Entrada antecipada em sinais quentes
            </div>
            <div className="flex items-center gap-2 text-amber-700">
              <TrendingUp className="w-4 h-4" />
              Precisão mínima de 85% garantida pelo algoritmo
            </div>
            <div className="flex items-center gap-2 text-amber-700">
              <Crown className="w-4 h-4" />
              Monitoramento dedicado das melhores casas
            </div>
            <div className="flex items-center gap-2 text-amber-700">
              <Star className="w-4 h-4" />
              Suporte prioritário com especialistas
            </div>
          </div>
        </Card>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {filterOptions.map(option => (
            <Button
              key={option.value}
              variant={filter === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(option.value)}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap border-amber-200 text-amber-700",
                filter === option.value
                  ? "bg-gradient-to-r from-amber-400 to-rose-400 text-white border-transparent"
                  : "hover:bg-amber-100/80"
              )}
            >
              {option.icon}
              <span>{option.label}</span>
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(item => (
              <div
                key={item}
                className="rounded-lg border border-amber-100 bg-card/70 p-4 animate-pulse"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100" />
                  <div className="space-y-2">
                    <div className="h-4 w-36 rounded bg-amber-100" />
                    <div className="h-3 w-48 rounded bg-amber-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredSignals.length > 0 ? (
          <div className="space-y-4">{filteredSignals.map(renderCard)}</div>
        ) : (
          <div className="rounded-xl border border-amber-100 bg-card/80 p-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <Lock className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {filter === "all" ? "Nenhum sinal VIP ativo" : "Nenhum sinal VIP neste filtro"}
            </h3>
            <p className="text-muted-foreground mb-6">
              Aguarde alguns minutos para que novos sinais sejam gerados ou ajuste o filtro selecionado.
            </p>
            <div className="flex flex-col items-center gap-3">
              <Button
                variant="outline"
                onClick={refreshData}
                disabled={isLoading}
                className="border-amber-200 text-amber-700 hover:bg-amber-100"
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
                Atualizar sinais
              </Button>
              {filter !== "all" && (
                <Button
                  variant="ghost"
                  onClick={() => setFilter("all")}
                  className="text-sm text-amber-700 hover:bg-amber-100/60"
                >
                  Ver todos os sinais VIP
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
