import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Plan {
  id: number;
  name: string;
  price: number;
  description?: string | null;
}

const initialFormState = { name: "", price: "", description: "" };

const normalizePrice = (value: string) => {
  const sanitized = value.replace(/[^\d.,]/g, "");
  if (!sanitized) return 0;
  const hasComma = sanitized.includes(",");
  const hasDot = sanitized.includes(".");

  let normalized = sanitized;
  if (hasComma && hasDot) {
    normalized = sanitized.replace(/\./g, "").replace(",", ".");
  } else if (hasComma) {
    normalized = sanitized.replace(",", ".");
  }
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Ocorreu um erro inesperado.";
};

export const AdminPlans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(initialFormState);
  const [editingId, setEditingId] = useState<number | null>(null);

  const loadPlans = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const api = await import("@/lib/adminApi");
      const response: Plan[] = await api.getAdminPlans();
      setPlans(response);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        name: form.name.trim(),
        price: normalizePrice(form.price),
        description: form.description.trim(),
      };

      if (!payload.name) {
        throw new Error("Informe um nome para o plano.");
      }
      if (!payload.price || Number.isNaN(payload.price)) {
        throw new Error("Informe um valor válido para o plano.");
      }

      const api = await import("@/lib/adminApi");
      if (editingId) {
        await api.updatePlan(editingId, payload);
      } else {
        await api.createPlan(payload.name, payload.price, payload.description);
      }

      setForm(initialFormState);
      setEditingId(null);
      await loadPlans();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (plan: Plan) => {
    setForm({
      name: plan.name ?? "",
      price: plan.price != null ? String(plan.price).replace(".", ",") : "",
      description: plan.description ?? "",
    });
    setEditingId(plan.id);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja remover este plano?")) return;
    setIsLoading(true);
    setError(null);
    try {
      const api = await import("@/lib/adminApi");
      await api.deletePlan(id);
      await loadPlans();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const sortedPlans = useMemo(
    () => plans.slice().sort((a, b) => a.price - b.price),
    [plans]
  );

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <Card className="p-6 shadow-elevated border-border/60 bg-card/80">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gerenciar planos</h1>
            <p className="text-sm text-muted-foreground">
              Atualize os valores e descrições exibidos para os usuários na área de planos.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={loadPlans} disabled={isLoading}>
              Atualizar
            </Button>
            {editingId && (
              <Badge variant="outline" className="border-primary text-primary">
                Editando plano #{editingId}
              </Badge>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form className="grid gap-4 md:grid-cols-4 mb-8" onSubmit={handleSubmit}>
          <Input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Nome do plano"
            required
          />
          <Input
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Valor (ex: 79,90)"
            required
          />
          <Input
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Descrição curta"
            className="md:col-span-1"
          />
          <Button type="submit" className="md:col-span-1">
            {editingId ? "Salvar alterações" : "Criar plano"}
          </Button>
        </form>

        {isLoading ? (
          <div className="text-sm text-muted-foreground">Carregando planos...</div>
        ) : sortedPlans.length === 0 ? (
          <div className="text-sm text-muted-foreground">Nenhum plano cadastrado.</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border/60">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Nome</th>
                  <th className="px-4 py-3 text-left font-medium">Preço</th>
                  <th className="px-4 py-3 text-left font-medium">Descrição</th>
                  <th className="px-4 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {sortedPlans.map(plan => (
                  <tr key={plan.id} className="border-t border-border/40">
                    <td className="px-4 py-3 text-foreground">{plan.name}</td>
                    <td className="px-4 py-3 text-foreground">
                      R$ {Number(plan.price).toFixed(2).replace(".", ",")}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {plan.description || "—"}
                    </td>
                    <td className="px-4 py-3 text-right space-x-3">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(plan)}>
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(plan.id)}
                      >
                        Excluir
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminPlans;
