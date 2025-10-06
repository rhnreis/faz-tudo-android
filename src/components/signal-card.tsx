import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Signal, Game, BettingHouse } from "@/types";
import { cn } from "@/lib/utils";
import { Clock, TrendingUp, ExternalLink } from "lucide-react";

interface SignalCardProps {
  signal: Signal;
  game: Game;
  house: BettingHouse;
  onClick?: () => void;
  className?: string;
}

export const SignalCard = ({ signal, game, house, onClick, className }: SignalCardProps) => {
  const getTimeAgo = (timestamp: Date) => {
    const minutes = Math.floor((Date.now() - timestamp.getTime()) / 60000);
    if (minutes < 1) return 'Agora';
    if (minutes === 1) return '1 min atrás';
    return `${minutes} min atrás`;
  };

  const handleRedirect = () => {
    const confirmed = window.confirm(
      `⚠️ AVISO IMPORTANTE:\n\n` +
      `Você será redirecionado para ${house.name}.\n\n` +
      `• Este aplicativo é apenas informativo\n` +
      `• Aposte com responsabilidade\n` +
      `• Você deve ter +18 anos\n` +
      `• Jogos podem causar dependência\n\n` +
      `Deseja continuar?`
    );
    
    if (confirmed) {
      window.open(house.url, '_blank');
    }
  };

  const getSignalTypeColor = (type: Signal['type']) => {
    switch (type) {
      case 'golden_moment':
        return 'text-warning border-warning/30 bg-warning/10';
      case 'bonus_sequence':
        return 'text-success border-success/30 bg-success/10';
      case 'victory_pattern':
        return 'text-hot border-hot/30 bg-hot/10';
      default:
        return 'text-muted-foreground border-border bg-muted/10';
    }
  };

  const getSignalTypeLabel = (type: Signal['type']) => {
    switch (type) {
      case 'golden_moment':
        return 'Momento Ouro';
      case 'bonus_sequence':
        return 'Sequência Bônus';
      case 'victory_pattern':
        return 'Padrão Vitória';
      default:
        return 'Sinal';
    }
  };

  return (
    <Card 
      className={cn(
        "p-4 cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:shadow-elevated",
        "bg-gradient-card border-border shadow-card",
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
              <span>{house.logo}</span>
              <span>{house.name}</span>
            </div>
          </div>
        </div>
        
        <div className={cn(
          "px-2 py-1 rounded-lg border text-xs font-medium",
          getSignalTypeColor(signal.type)
        )}>
          {getSignalTypeLabel(signal.type)}
        </div>
      </div>

      <p className="text-sm text-card-foreground mb-3 leading-relaxed">
        {signal.message}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">
              <span className="text-success font-semibold">{signal.probability.toFixed(0)}%</span>
              <span className="text-xs ml-1">chance</span>
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{getTimeAgo(signal.timestamp)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right mr-3">
            <div className="text-xs text-muted-foreground">Multiplicador</div>
            <div className="text-lg font-bold text-hot">{game.multiplier}x</div>
          </div>
          <Button
            size="sm"
            onClick={handleRedirect}
            className="bg-success hover:bg-success/90 text-white"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Apostar
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Adaptação para uso simples: se não houver game/house, renderiza apenas dados do signal
export const SimpleSignalCard = ({ signal }: { signal: any }) => (
  <Card className="p-4 mb-2">
    <div className="flex items-center justify-between mb-2">
      <span className="font-bold">{signal.title || signal.message}</span>
      <span className="text-xs text-muted-foreground">{signal.created_at || signal.timestamp}</span>
    </div>
    <div className="text-sm text-muted-foreground mb-2">{signal.description || signal.message}</div>
    <div className="flex gap-2">
      <Button size="sm" variant="outline" disabled>
        {signal.vip_only ? 'VIP' : 'Normal'}
      </Button>
    </div>
  </Card>
);