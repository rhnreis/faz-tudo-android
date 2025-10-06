import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, Crown, Zap, Star, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { getPlans } from "@/lib/localDbApi";

interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
}

export const Plans = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    getPlans().then((data) => setPlans(data));
  }, []);

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlan(planId);
    setIsLoading(true);
    try {
      toast({
        title: "Redirecionando para pagamento...",
        description: "Você será redirecionado para finalizar a compra.",
      });
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
            <Card key={plan.id} className="relative border-border shadow-elevated transition-all duration-300 hover:scale-105">
              <CardHeader className="text-center space-y-4">
                <div className={`w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto text-white`}>
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-foreground">{plan.name}</CardTitle>
                  <CardDescription className="text-muted-foreground mt-2">{plan.description}</CardDescription>
                </div>
                <div className="space-y-2">
                  <span className="text-4xl font-bold text-foreground">R$ {plan.price.toFixed(2)}</span>
                  <p className="text-sm text-muted-foreground">por 30 dias</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button 
                  onClick={() => handleSelectPlan(plan.id.toString())}
                  disabled={isLoading && selectedPlan === plan.id.toString()}
                  className="w-full font-semibold bg-gradient-primary hover:opacity-90 text-primary-foreground"
                >
                  {isLoading && selectedPlan === plan.id.toString() 
                    ? "Processando..." 
                    : "Escolher Plano"
                  }
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};