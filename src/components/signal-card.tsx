import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Signal, Game, BettingHouse } from "@/types";
import { cn } from "@/lib/utils";
import { Clock, TrendingUp, ExternalLink, Crown } from "lucide-react";

interface SignalCardProps {
  signal: Signal;
  game: Game;
  house: BettingHouse;
  onClick?: () => void;
  className?: string;
  currentTime?: number;
}

const formatTimeSince = (timestamp: Date) => {
  const minutes = Math.floor((Date.now() - timestamp.getTime()) / 60000);
  if (minutes < 1) return "Agora";
  if (minutes === 1) return "1 min atrás";
  return `${minutes} min atrás`;
};

const formatRemaining = (seconds: number) => {
  if (seconds <= 0) return "Expirando";
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (minutes === 0) return `${secs}s`;
  return `${minutes}m ${secs.toString().padStart(2, "0")}s`;
};

export const SignalCard = ({ signal, game, house, onClick, className, currentTime }: SignalCardProps) => {
  const now = currentTime ?? Date.now();
  const expiresAt = signal.expiresAt instanceof Date ? signal.expiresAt : new Date(signal.expiresAt);
  const totalSeconds = Math.max(signal.durationSeconds || 1, 1);
  const rawRemaining = Math.round((expiresAt.getTime() - now) / 1000);
  const remainingSeconds = Math.max(0, rawRemaining);
  const remainingLabel = formatRemaining(remainingSeconds);
  const progressPercent = Math.min(100, Math.max(0, (remainingSeconds / totalSeconds) * 100));

  const handleRedirect = () => {
    const confirmed = window.confirm(
      [
        "AVISO IMPORTANTE",
        "",
        `Você será redirecionado para ${house.name}.`,
        "",
        "- Este aplicativo é apenas informativo",
        "- Aposte com responsabilidade",
        "- É necessário ser maior de 18 anos",
        "- Jogos podem causar dependência",
        "",
        "Deseja continuar?",
      ].join("\n")
    );

    if (confirmed) {
      window.open(house.url, "_blank");
    }
  };

  const signalTypeStyles = (type: Signal["type"]) => {
    switch (type) {
      case "golden_moment":
        return "text-amber-400 border-amber-300/50 bg-amber-300/10";
      case "bonus_sequence":
        return "text-emerald-400 border-emerald-300/50 bg-emerald-300/10";
      case "victory_pattern":
        return "text-rose-400 border-rose-300/50 bg-rose-300/10";
      default:
        return "text-muted-foreground border-border bg-muted/10";
    }
  };

  const probabilityTone =
    signal.probability >= 90 ? "text-emerald-400" :
    signal.probability >= 80 ? "text-amber-300" :
    "text-rose-400";

  const progressTone =
    signal.probability >= 90 ? "from-emerald-400 to-emerald-500" :
    signal.probability >= 80 ? "from-amber-400 to-orange-500" :
    "from-rose-500 to-rose-600";

  const timeTone =
    remainingSeconds <= 30 ? "text-rose-400" :
    remainingSeconds <= 90 ? "text-amber-300" :
    "text-muted-foreground";

  return (
    <Card
      className={cn(
        "p-4 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-elevated",
        "bg-gradient-card border-border/60 shadow-card",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{game.icon}</div>
          <div>
            <h3 className="font-semibold text-card-foreground">{game.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{house.name}</span>
              <Badge variant="outline" className="rounded-full border-white/10 bg-white/10 text-white/80">
                {formatTimeSince(signal.timestamp)}
              </Badge>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "px-2 py-1 rounded-lg border text-xs font-medium uppercase tracking-wide",
            signalTypeStyles(signal.type)
          )}
        >
          {signal.type === "golden_moment" && "Momento Ouro"}
          {signal.type === "bonus_sequence" && "Sequência Bônus"}
          {signal.type === "victory_pattern" && "Padrão Vitória"}
        </div>
      </div>

      <div className="flex items-center justify-between mb-2">
        <Badge variant="outline" className="rounded-full border-white/10 bg-white/5 text-white/80">
          {house.name}
        </Badge>
        {signal.vipOnly && (
          <Badge className="rounded-full bg-rose-500/90 text-white border-none shadow-sm">
            <Crown className="w-3 h-3 mr-1" />
            VIP
          </Badge>
        )}
      </div>

      <p className="text-sm text-card-foreground/90 mb-3 leading-relaxed">
        {signal.message}
      </p>

      <div className="mb-3">
        <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-500 bg-gradient-to-r", progressTone)}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs mt-1">
          <span className="text-muted-foreground">Tempo restante</span>
          <span className={timeTone}>{remainingLabel}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">
              <span className={cn("font-semibold", probabilityTone)}>{signal.probability.toFixed(0)}%</span>
              <span className="text-xs ml-1">confiança</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{formatTimeSince(signal.timestamp)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right mr-3">
            <div className="text-xs text-muted-foreground">Multiplicador</div>
            <div className="text-lg font-bold text-primary">{game.multiplier}x</div>
          </div>
          <Button
            size="sm"
            onClick={handleRedirect}
            className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-md"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Apostar
          </Button>
        </div>
      </div>
    </Card>
  );
};
