import { useState, useEffect } from "react";
import { localChangePassword } from "@/lib/localApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // O Supabase injeta a sessão especial ao acessar pelo link do e-mail
    // Não é necessário buscar nada aqui, apenas garantir que o usuário está na página correta
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "Digite a mesma senha nos dois campos.",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    // O email pode ser recuperado via contexto, ou pedir ao usuário
    const email = window.localStorage.getItem('resetEmail') || '';
    const result = await localChangePassword(email, password);
    setLoading(false);
    if (result.error) {
      toast({
        title: "Erro ao redefinir senha",
        description: result.error,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Senha redefinida com sucesso!",
        description: "Você já pode acessar sua conta com a nova senha.",
        variant: "default"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Redefinir Senha</h2>
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <Label htmlFor="password">Nova Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Digite a nova senha"
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirme a nova senha"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Redefinindo..." : "Redefinir Senha"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ResetPassword;
