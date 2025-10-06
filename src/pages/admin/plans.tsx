import React from "react";
import { Card } from "@/components/ui/card";

export const AdminPlans = () => {
  const [plans, setPlans] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({ name: '', price: '', description: '' });
  const [editingId, setEditingId] = React.useState(null);
  const load = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const api = await import('@/lib/adminApi');
      setPlans(await api.getAdminPlans());
    } catch (e: any) {
      setError(e?.message || 'Erro ao carregar planos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    const api = await import('@/lib/adminApi');
    if (editingId) {
      await api.updatePlan(editingId, form);
    } else {
      await api.createPlan(form.name, form.price, form.description);
    }
    setForm({ name: '', price: '', description: '' });
    setEditingId(null);
    await load();
    setIsLoading(false);
  };
  const handleEdit = plan => {
    setForm(plan);
    setEditingId(plan.id);
  };
  const handleDelete = async id => {
    setIsLoading(true);
    const api = await import('@/lib/adminApi');
    await api.deletePlan(id);
    await load();
    setIsLoading(false);
  };
  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Gerenciar Planos</h1>
        <div className="flex items-center gap-2 mb-4">
          <button onClick={load} className="bg-secondary text-secondary-foreground px-3 py-1 rounded">Atualizar</button>
          {error && <div className="text-destructive ml-4">{error}</div>}
        </div>
        <form className="mb-6 grid grid-cols-2 gap-4" onSubmit={handleSubmit}>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Nome" className="border p-2" required />
          <input name="price" value={form.price} onChange={handleChange} placeholder="Preço" className="border p-2" required />
          <input name="description" value={form.description} onChange={handleChange} placeholder="Descrição" className="border p-2" />
          <button type="submit" className="bg-primary text-white p-2 rounded">{editingId ? 'Salvar' : 'Criar'}</button>
        </form>
        {isLoading ? <div>Carregando...</div> : (
          <table className="w-full border">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Preço</th>
                <th>Descrição</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {plans.map(plan => (
                <tr key={plan.id}>
                  <td>{plan.name}</td>
                  <td>{plan.price}</td>
                  <td>{plan.description}</td>
                  <td>
                    <button className="text-blue-500 mr-2" onClick={() => handleEdit(plan)}>Editar</button>
                    <button className="text-red-500" onClick={() => handleDelete(plan.id)}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};

export default AdminPlans;
