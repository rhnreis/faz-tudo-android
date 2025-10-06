import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  CreditCard, 
  Shield, 
  Clock, 
  Copy, 
  CheckCircle,
  QrCode 
} from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
}

const plans: { [key: string]: Plan } = {
  basic: {
    id: "basic",
    name: "Plano Básico",
    price: 29.9,
    duration: "7 dias",
    features: ["Sinais básicos diários", "3 casas de apostas", "Suporte WhatsApp"]
  },
  premium: {
    id: "premium",
    name: "Plano Premium",
    price: 79.9,
    duration: "30 dias",
    features: ["Sinais premium", "Todas as casas", "Suporte 24/7", "Grupo VIP"]
  },
  vip: {
    id: "vip",
    name: "Plano VIP",
    price: 149.9,
    duration: "90 dias",
    features: ["Sinais VIP", "Acesso total", "Consultoria via WhatsApp"]
  }
}

export default function Checkout() {
  const { planId } = useParams<{ planId?: string }>();
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix");
  const [isProcessing, setIsProcessing] = useState(false);
  const [pixCode, setPixCode] = useState("");
  const [showPixCode, setShowPixCode] = useState(false);
  const [customerData, setCustomerData] = useState({ name: "", email: "", phone: "", cpf: "" });
  const { toast } = useToast();

  const plan = planId ? plans[planId] || plans['basic'] : plans['basic'];

  useEffect(() => {
    if (!plan) {
      toast({ title: "Plano não encontrado", description: "Redirecionando para seleção de planos...", variant: "destructive" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
  };

  const generatePixPayment = async () => {
    setIsProcessing(true);
    try {
      const API_BASE = (import.meta as any).env.VITE_API_URL || '';
      const resp = await fetch(`${API_BASE}/api/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id, customer: customerData, method: 'pix' })
      });
      if (!resp.ok) throw new Error('failed');
      const data = await resp.json();
      setPixCode(data.pix_code || '');
      setShowPixCode(true);
      toast({ title: 'PIX gerado com sucesso!', description: 'Copie o código ou escaneie o QR Code para pagar.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro ao gerar PIX', description: 'Tente novamente em alguns instantes.', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyPixCode = () => {
    try { navigator.clipboard.writeText(pixCode); }
    catch (e) { /* ignore */ }
    toast({ title: 'Código copiado!', description: 'Cole no seu banco para efetuar o pagamento.' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'pix') {
      await generatePixPayment();
    } else {
      toast({ title: 'Pagamento com cartão', description: 'Funcionalidade em desenvolvimento.', variant: 'destructive' });
    }
  };

  if (!plan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="border-border">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Plano não encontrado</p>
            <Link to="/plans">
              <Button>Voltar para Planos</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/plans" className="flex items-center space-x-2 text-foreground hover:text-highlight">
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Finalizar Compra</h1>
            <div />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Resumo do Pedido */}
          <Card className="border-border shadow-elevated h-fit">
            <CardHeader>
              <CardTitle className="text-foreground">Resumo do Pedido</CardTitle>
              <CardDescription className="text-muted-foreground">
                Confira os detalhes da sua compra
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-foreground">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">Duração: {plan.duration}</p>
                  </div>
                  <Badge className="bg-primary/20 text-primary">Premium</Badge>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Inclui:</p>
                  <ul className="space-y-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-success" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Separator className="bg-border" />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">R$ {plan.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Desconto</span>
                  <span className="text-success">-R$ 0,00</span>
                </div>
                <Separator className="bg-border" />
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">R$ {plan.price.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-success/10 p-4 rounded-lg border border-success/20">
                <div className="flex items-center space-x-2 text-success">
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">Garantia de 7 dias</span>
                </div>
                <p className="text-sm text-success/80 mt-1">
                  Não ficou satisfeito? Devolvemos 100% do valor.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Formulário de Pagamento */}
          <Card className="border-border shadow-elevated">
            <CardHeader>
              <CardTitle className="text-foreground">Dados para Pagamento</CardTitle>
              <CardDescription className="text-muted-foreground">
                Preencha seus dados para finalizar a compra
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showPixCode ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Dados do Cliente */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-foreground">Dados Pessoais</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-foreground">Nome Completo</Label>
                        <Input
                          id="name"
                          value={customerData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          required
                          className="bg-input border-border text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cpf" className="text-foreground">CPF</Label>
                        <Input
                          id="cpf"
                          placeholder="000.000.000-00"
                          value={customerData.cpf}
                          onChange={(e) => handleInputChange("cpf", e.target.value)}
                          required
                          className="bg-input border-border text-foreground"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={customerData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                        className="bg-input border-border text-foreground"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-foreground">WhatsApp</Label>
                      <Input
                        id="phone"
                        placeholder="(11) 99999-9999"
                        value={customerData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        required
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                  </div>

                  <Separator className="bg-border" />

                  {/* Forma de Pagamento */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-foreground">Forma de Pagamento</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        type="button"
                        variant={paymentMethod === "pix" ? "default" : "outline"}
                        onClick={() => setPaymentMethod("pix")}
                        className="h-auto p-4 flex flex-col items-center space-y-2"
                      >
                        <QrCode className="w-6 h-6" />
                        <div className="text-center">
                          <p className="font-semibold">PIX</p>
                          <p className="text-xs opacity-80">Aprovação imediata</p>
                        </div>
                      </Button>

                      <Button
                        type="button"
                        variant={paymentMethod === "card" ? "default" : "outline"}
                        onClick={() => setPaymentMethod("card")}
                        className="h-auto p-4 flex flex-col items-center space-y-2"
                      >
                        <CreditCard className="w-6 h-6" />
                        <div className="text-center">
                          <p className="font-semibold">Cartão</p>
                          <p className="text-xs opacity-80">Crédito/Débito</p>
                        </div>
                      </Button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Gerando pagamento...
                      </>
                    ) : (
                      `Pagar R$ ${plan.price.toFixed(2)} via ${paymentMethod.toUpperCase()}`
                    )}
                  </Button>
                </form>
              ) : (
                /* PIX Code Display */
                <div className="space-y-6 text-center">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">PIX Gerado!</h3>
                    <p className="text-muted-foreground">
                      Escaneie o QR Code ou copie o código para pagar
                    </p>
                  </div>

                  {/* QR Code Placeholder */}
                  <div className="w-64 h-64 mx-auto bg-card border border-border rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <QrCode className="w-16 h-16 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">QR Code PIX</p>
                    </div>
                  </div>

                  {/* PIX Code */}
                  <div className="space-y-2">
                    <Label className="text-foreground">Código PIX (Copia e Cola)</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={pixCode}
                        readOnly
                        className="bg-input border-border text-foreground text-xs"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={copyPixCode}
                        className="shrink-0"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="bg-warning/10 p-4 rounded-lg border border-warning/20">
                    <div className="flex items-center space-x-2 text-warning">
                      <Clock className="w-5 h-5" />
                      <span className="font-medium">Aguardando pagamento</span>
                    </div>
                    <p className="text-sm text-warning/80 mt-1">
                      O PIX tem validade de 30 minutos. Após o pagamento, o acesso será liberado automaticamente.
                    </p>
                  </div>

                  <Button 
                    onClick={() => setShowPixCode(false)}
                    variant="outline"
                    className="w-full"
                  >
                    Voltar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};