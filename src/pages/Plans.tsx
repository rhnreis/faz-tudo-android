import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, Crown, Zap, Star, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  duration: string;
  popular?: boolean;
  premium?: boolean;
  features: string[];
  color: string;
  icon: React.ReactNode;
}

const plans: Plan[] = [
  {
    id: "basico",
    name: "Básico",
    description: "Ideal para iniciantes",
    price: 9.99,
    duration: "30 dias",
    features: [
      "Acesso aos jogos",
      "Análise de 3 casas de apostas",
      "Suporte via WhatsApp",
      "Alertas em tempo real"
    ],
    color: "from-secondary to-secondary/80",
    icon: <Zap className="w-6 h-6" />
  },
  {
    id: "premium",
    name: "Premium",
    description: "Mais sinais e recursos",
    price: 19.99,
    duration: "30 dias",
    popular: true,
    features: [
      "Acesso aos jogos",
      "Sinais premium exclusivos",
      "Análise de todas as casas",
      "Suporte prioritário 24/7",
      "Alertas personalizados",
      "Histórico de performance"
    ],
    color: "from-primary to-secondary",
    icon: <Star className="w-6 h-6" />
  },
  {
    id: "vip",
    name: "VIP Diamond",
    description: "Para profissionais",
    price: 49.99,
    duration: "30 dias",
    premium: true,
    features: [
      "Todos os recursos Premium",
      "Sinais VIP exclusivos (85%+)",
      "Acesso total à plataforma",
      "Análise técnica avançada",
      "Calls ao vivo diárias",
      "Suporte 1 a 1",
      "Garantia de resultado"
    ],
    color: "from-warning to-warning/80",
    icon: <Crown className="w-6 h-6" />
  }
];

export const Plans = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlan(planId);
    setIsLoading(true);

    try {
      // TODO: Implementar integração com Mercado Pago
      toast({
        title: "Redirecionando para pagamento...",
        description: "Você será redirecionado para finalizar a compra.",
      });
      
      // Simular redirecionamento
      setTimeout(() => {
        window.location.href = `/checkout/${planId}`;
      }, 2000);
    } catch (error) {
      toast({
        title: "Erro no pagamento",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 text-foreground hover:text-highlight">
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </Link>
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Escolha seu Plano
            </h1>
            <div />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl font-bold text-foreground">
            Turbine seus <span className="bg-gradient-primary bg-clip-text text-transparent">Resultados</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano ideal e comece a receber sinais profissionais hoje mesmo
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span>Garantia de 7 dias</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span>Pagamento seguro</span> 
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span>Suporte 24/7</span>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative border-border shadow-elevated transition-all duration-300 hover:scale-105 ${
                plan.popular ? 'ring-2 ring-primary shadow-2xl' : ''
              } ${plan.premium ? 'ring-2 ring-warning shadow-2xl' : ''}`}
            >
              {/* Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    Mais Popular
                  </Badge>
                </div>
              )}
              {plan.premium && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-warning text-warning-foreground px-4 py-1">
                    💎 VIP Diamond
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center space-y-4">
                <div className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-2xl flex items-center justify-center mx-auto text-white`}>
                  {plan.icon}
                </div>
                
                <div>
                  <CardTitle className="text-2xl text-foreground">{plan.name}</CardTitle>
                  <CardDescription className="text-muted-foreground mt-2">
                    {plan.description}
                  </CardDescription>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    {plan.originalPrice && (
                      <span className="text-lg text-muted-foreground line-through">
                        R$ {plan.originalPrice.toFixed(2)}
                      </span>
                    )}
                    <span className="text-4xl font-bold text-foreground">
                      R$ {plan.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    por {plan.duration}
                  </p>
                  {plan.originalPrice && (
                    <Badge variant="secondary" className="bg-success/20 text-success">
                      Economize R$ {(plan.originalPrice - plan.price).toFixed(2)}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-success/20 rounded-full flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-success" />
                      </div>
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isLoading && selectedPlan === plan.id}
                  className={`w-full font-semibold ${
                    plan.popular || plan.premium 
                      ? 'bg-gradient-primary hover:opacity-90 text-primary-foreground' 
                      : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                  }`}
                >
                  {isLoading && selectedPlan === plan.id 
                    ? "Processando..." 
                    : "Escolher Plano"
                  }
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center space-y-6">
          <h3 className="text-2xl font-bold text-foreground">
            Perguntas Frequentes
          </h3>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
            <Card className="border-border bg-card/50">
              <CardContent className="p-6">
                <h4 className="font-semibold text-foreground mb-2">
                  Como funciona a garantia?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Oferecemos 7 dias de garantia. Se não ficar satisfeito, devolvemos 100% do valor.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-border bg-card/50">
              <CardContent className="p-6">
                <h4 className="font-semibold text-foreground mb-2">
                  Posso cancelar a qualquer momento?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Sim, você pode cancelar sua assinatura a qualquer momento pelo WhatsApp.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/50">
              <CardContent className="p-6">
                <h4 className="font-semibold text-foreground mb-2">
                  Como recebo os sinais?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Os sinais são enviados em tempo real via app, WhatsApp e Telegram.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/50">
              <CardContent className="p-6">
                <h4 className="font-semibold text-foreground mb-2">
                  Qual forma de pagamento aceita?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Aceitamos PIX, cartão de crédito e débito via Mercado Pago.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};