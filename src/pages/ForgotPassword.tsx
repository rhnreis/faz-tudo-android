import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simula envio de e-mail e salva email para reset
    window.localStorage.setItem("resetEmail", email);
    setLoading(false);
    toast({
      title: "E-mail enviado",
      description: "Verifique sua caixa de entrada para redefinir sua senha.",
      variant: "default"
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Recuperar Senha</h2>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="Digite seu e-mail"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Enviando..." : "Enviar link de recuperação"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ForgotPassword;
