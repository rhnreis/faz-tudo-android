import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, Crown, Sparkles, Shield } from "lucide-react";
import { getPlans } from "@/lib/localDbApi";
import { cn } from "@/lib/utils";

interface Plan {
  id: number;
  name: string;
  description?: string | null;
  price: number | string;
}

const formatPrice = (value: number | string) => {
  const numeric = typeof value === "number" ? value : Number(String(value).replace(",", "."));
  if (Number.isNaN(numeric)) return "Sob consulta";
  return numeric.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

const defaultPerks: Record<string, string[]> = {
  básico: [
    "Sinais essenciais atualizados em tempo real",
    "Acesso às casas com melhor desempenho diário",
    "Alertas de oportunidade com confiança mínima de 70%",
  ],
  premium: [
    "Todos os sinais do plano Básico",
    "Filtro avançado por casa e jogo",
    "Precisão média acima de 82% com alerta prioritário",
  ],
  vip: [
    "Todos os sinais Premium e VIP exclusivos",
    "Monitoramento por especialista com atualização a cada minuto",
    "Confiança média acima de 90% e prioridade máxima",
  ],
};

export const Plans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await getPlans();
        setPlans(data);
      } catch (error) {
        toast({
          title: "Erro ao carregar planos",
          description: "Não foi possível carregar os planos disponíveis. Tente novamente.",
          variant: "destructive",
        });
      }
    };
    fetchPlans();
  }, [toast]);

  const orderedPlans = useMemo(
    () => plans.slice().sort((a, b) => {
      const priceA = typeof a.price === "number" ? a.price : Number(String(a.price).replace(",", "."));
      const priceB = typeof b.price === "number" ? b.price : Number(String(b.price).replace(",", "."));
      return (priceA || 0) - (priceB || 0);
    }),
    [plans]
  );

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan.id);
    setIsLoading(true);
    toast({
      title: "Iniciando checkout",
      description: "Vamos direcionar você para finalizar o pagamento com segurança.",
    });
    setTimeout(() => {
      navigate(`/checkout/${plan.id}`);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
      <div className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Badge variant="outline" className="border-primary/40 text-primary mb-2">
              Assinaturas inteligentes
            </Badge>
            <h1 className="text-2xl font-bold text-foreground">Escolha o plano ideal</h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              Todos os planos contam com acesso ao dashboard e notificações em tempo real. O plano VIP adiciona integrações exclusivas e prioridade máxima.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Voltar
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-6 lg:grid-cols-3">
          {orderedPlans.map(plan => {
            const perks =
              defaultPerks[plan.name.toLowerCase()] ??
              [
                plan.description || "Acesso completo aos recursos do plano.",
                "Relatórios atualizados diariamente.",
                "Suporte dedicado via WhatsApp.",
              ];

            const isVip = plan.name.toLowerCase().includes("vip");

            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative border-border shadow-elevated transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
                  isVip && "border-primary/60"
                )}
              >
                <CardHeader className="space-y-4 text-center">
                  <div className={cn(
                    "mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-inner",
                    isVip ? "bg-gradient-to-br from-primary to-rose-500" : "bg-gradient-to-br from-primary to-secondary"
                  )}>
                    {isVip ? <Crown className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-foreground">{plan.name}</CardTitle>
                    <CardDescription className="mt-2 text-muted-foreground">
                      {plan.description || "Plano personalizado para seu perfil de investimento."}
                    </CardDescription>
                  </div>
                  <div className="space-y-2">
                    <p className="text-4xl font-bold text-foreground">{formatPrice(plan.price)}</p>
                    <p className="text-xs text-muted-foreground">Pagamento único • acesso imediato</p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {perks.map((perk, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="mt-0.5 h-4 w-4 text-primary" />
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg border border-border/60 bg-card/70 p-3 flex items-center gap-3 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4 text-primary" />
                    Pagamentos via PIX com confirmação instantânea.
                  </div>

                  <Button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isLoading && selectedPlan === plan.id}
                    className={cn(
                      "w-full font-semibold text-primary-foreground transition-transform",
                      "bg-gradient-primary hover:opacity-90",
                      isLoading && selectedPlan === plan.id && "opacity-70 cursor-wait"
                    )}
                  >
                    {isLoading && selectedPlan === plan.id ? "Direcionando..." : "Escolher plano"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
