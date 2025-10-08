import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  QrCode,
  Sparkles,
  Crown,
} from "lucide-react";
import { getPlans } from "@/lib/localDbApi";

interface Plan {
  id: number;
  name: string;
  description?: string | null;
  price: number | string;
}

const formatPrice = (value: number | string) => {
  const normalized =
    typeof value === "number" ? value : Number(String(value).replace(",", "."));
  if (Number.isNaN(normalized)) return "R$ --";
  return normalized.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

const defaultPerks: Record<string, string[]> = {
  básico: [
    "Alertas calibrados com confiança mínima de 70%",
    "Painel com atualização a cada 30 segundos",
    "Suporte em horário comercial",
  ],
  premium: [
    "Tudo do Básico + filtros avançados",
    "Confiança média acima de 82%",
    "Suporte prioridade via WhatsApp",
  ],
  vip: [
    "Tudo do Premium + sinais exclusivos",
    "Precisão média superior a 90%",
    "Atendimento dedicado e acompanhamento diário",
  ],
};

const normalizePlanDuration = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("vip")) return "90 dias";
  if (lower.includes("premium")) return "30 dias";
  return "7 dias";
};

export default function Checkout() {
  const { planId } = useParams<{ planId?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);

  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix");
  const [isProcessing, setIsProcessing] = useState(false);
  const [pixCode, setPixCode] = useState("");
  const [showPixCode, setShowPixCode] = useState(false);

  const [customerData, setCustomerData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
  });

  useEffect(() => {
    const fetchPlans = async () => {
      setLoadingPlan(true);
      try {
        const response = await getPlans();
        setPlans(response);

        if (response.length === 0) {
          setPlan(null);
          toast({
            title: "Nenhum plano disponível",
            description: "Cadastre planos no painel administrativo para habilitar o checkout.",
            variant: "destructive",
          });
          return;
        }

        const byId = response.find(p => String(p.id) === planId);
        const fallbackByName = planId
          ? response.find(p => p.name?.toLowerCase().includes(planId.toLowerCase()))
          : undefined;

        setPlan(byId ?? fallbackByName ?? response[0]);
      } catch (error: unknown) {
        toast({
          title: "Erro ao carregar plano",
          description: "Não foi possível carregar as informações do plano selecionado.",
          variant: "destructive",
        });
      } finally {
        setLoadingPlan(false);
      }
    };

    fetchPlans();
  }, [planId, toast]);

  const planPrice = useMemo(() => (plan ? formatPrice(plan.price) : "R$ --"), [plan]);
  const planDuration = useMemo(
    () => (plan ? normalizePlanDuration(plan.name) : "30 dias"),
    [plan]
  );

  const planPerks = useMemo(() => {
    if (!plan) return [];
    const key = plan.name.toLowerCase();
    return defaultPerks[key] ?? [
      "Acesso integral ao painel de sinais",
      "Atualizações em tempo real durante a vigência do plano",
      "Suporte via WhatsApp durante todo o período ativo",
    ];
  }, [plan]);

  const handleInputChange = (field: keyof typeof customerData, value: string) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
  };

  const generatePixPayment = async () => {
    if (!plan) return;
    setIsProcessing(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL ?? "";
      const response = await fetch(`${API_BASE}/api/create-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, customer: customerData, method: "pix" }),
      });
      if (!response.ok) throw new Error("Falha ao gerar PIX");
      const data = await response.json();
      setPixCode(data.pix_code ?? "");
      setShowPixCode(true);
      toast({
        title: "PIX gerado com sucesso!",
        description: "Copie o código ou utilize o QR Code para finalizar o pagamento.",
      });
    } catch (error: unknown) {
      toast({
        title: "Erro ao gerar PIX",
        description: "Tente novamente em instantes ou verifique sua conexão.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyPixCode = () => {
    if (!pixCode) return;
    navigator.clipboard.writeText(pixCode).catch(() => undefined);
    toast({
      title: "Código copiado",
      description: "Cole no aplicativo do seu banco para concluir o pagamento.",
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!plan) return;
    if (paymentMethod === "pix") {
      await generatePixPayment();
    } else {
      toast({
        title: "Cartão em desenvolvimento",
        description: "No momento aceitamos apenas PIX.",
        variant: "destructive",
      });
    }
  };

  if (loadingPlan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Carregando informações do plano...</div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardTitle className="text-xl mb-2">Plano não encontrado</CardTitle>
          <CardDescription className="mb-6">
            Não foi possível localizar o plano solicitado. Escolha novamente na página de planos.
          </CardDescription>
          <Button asChild>
            <Link to="/plans">Voltar para os planos</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const isVip = plan.name.toLowerCase().includes("vip");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
      <div className="border-b border-border bg-card/60 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Badge variant="outline" className="border-primary/40 text-primary">
            Checkout seguro
          </Badge>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <Card className="border-border shadow-elevated">
            <CardHeader className="space-y-2 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white ${
                    isVip
                      ? "bg-gradient-to-br from-primary to-rose-500"
                      : "bg-gradient-to-br from-primary to-secondary"
                  }`}
                >
                  {isVip ? <Crown className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
                </div>
                <div>
                  <CardTitle className="text-2xl text-foreground">{plan.name}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {plan.description || "Plano personalizado com acesso completo às funcionalidades."}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-4xl font-bold text-foreground">{planPrice}</p>
                <span className="text-sm text-muted-foreground">por {planDuration}</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-8 pt-6">
              {!showPixCode ? (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome completo</Label>
                      <Input
                        id="name"
                        placeholder="Como está no documento"
                        value={customerData.name}
                        onChange={event => handleInputChange("name", event.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="exemplo@email.com"
                        value={customerData.email}
                        onChange={event => handleInputChange("email", event.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">WhatsApp</Label>
                      <Input
                        id="phone"
                        placeholder="(11) 99999-9999"
                        value={customerData.phone}
                        onChange={event => handleInputChange("phone", event.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF</Label>
                      <Input
                        id="cpf"
                        placeholder="000.000.000-00"
                        value={customerData.cpf}
                        onChange={event => handleInputChange("cpf", event.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-medium text-foreground">Forma de pagamento</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        type="button"
                        variant={paymentMethod === "pix" ? "default" : "outline"}
                        onClick={() => setPaymentMethod("pix")}
                        className="h-auto p-4 flex flex-col items-center gap-2"
                      >
                        <QrCode className="w-6 h-6" />
                        <span className="font-semibold">PIX</span>
                        <span className="text-xs">Confirmação imediata</span>
                      </Button>
                      <Button
                        type="button"
                        variant={paymentMethod === "card" ? "default" : "outline"}
                        onClick={() => setPaymentMethod("card")}
                        className="h-auto p-4 flex flex-col items-center gap-2"
                      >
                        <CreditCard className="w-6 h-6" />
                        <span className="font-semibold">Cartão</span>
                        <span className="text-xs">Em breve</span>
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-primary text-primary-foreground font-semibold hover:opacity-90"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Gerando pagamento...
                      </>
                    ) : (
                      `Pagar ${planPrice} via ${paymentMethod.toUpperCase()}`
                    )}
                  </Button>
                </form>
              ) : (
                <div className="space-y-6 text-center">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">PIX gerado!</h3>
                    <p className="text-muted-foreground">
                      Escaneie o QR Code ou copie o código Pix para concluir sua assinatura.
                    </p>
                  </div>
                  <div className="mx-auto flex h-60 w-60 items-center justify-center rounded-xl border border-border bg-card/60">
                    <div className="space-y-2 text-muted-foreground">
                      <QrCode className="mx-auto w-16 h-16" />
                      <p className="text-sm">QR Code gerado</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Código PIX (copia e cola)</Label>
                    <div className="flex gap-2">
                      <Input value={pixCode} readOnly className="text-xs" />
                      <Button type="button" variant="outline" onClick={copyPixCode}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-lg border border-warning/40 bg-warning/10 p-4 flex items-start gap-3 text-left">
                    <Clock className="w-5 h-5 text-warning" />
                    <div>
                      <p className="font-semibold text-warning">Pagamento aguardando confirmação</p>
                      <p className="text-sm text-warning/80">
                        O código PIX expira em 30 minutos. Assim que o pagamento for confirmado, o acesso ao plano será liberado automaticamente.
                      </p>
                    </div>
                  </div>
                  <Button type="button" variant="outline" onClick={() => setShowPixCode(false)}>
                    Gerar novamente
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-border shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">O que você recebe</CardTitle>
                <CardDescription>Resumo dos benefícios incluídos neste plano.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {planPerks.map((perk, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
                    <span>{perk}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Pagamento seguro</CardTitle>
                <CardDescription>Dados protegidos e confirmação instantânea.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-primary mt-0.5" />
                  <span>Conexão criptografada e monitorada em tempo real.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-primary mt-0.5" />
                  <span>Acesso liberado automaticamente após a confirmação do PIX.</span>
                </div>
                <div className="flex items-start gap-2">
                  <ArrowLeft className="w-4 h-4 text-primary mt-0.5" />
                  <span>Suporte dedicado caso precise ajustar seu cadastro.</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
