import React from "react";
import { Card } from "@/components/ui/card";

export const AdminUsers = () => {
  const [users, setUsers] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({ email: '', password: '', full_name: '', phone: '', plan: 'basico' });
  const [editingId, setEditingId] = React.useState(null);
  const load = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const api = await import('@/lib/adminApi');
      const rows = await api.getUsers();
      setUsers(rows || []);
    } catch (e: any) {
      setError(e?.message || 'Erro ao carregar usuários');
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
      await api.updateUser(editingId, form);
    } else {
      await api.createUser(form.email, form.password, form.full_name, form.phone, form.plan);
    }
    setForm({ email: '', password: '', full_name: '', phone: '', plan: 'basico' });
    setEditingId(null);
    await load();
    setIsLoading(false);
  };
  const handleEdit = user => {
    setForm(user);
    setEditingId(user.id);
  };
  const handleDelete = async id => {
    setIsLoading(true);
    const api = await import('@/lib/adminApi');
    await api.deleteUser(id);
    await load();
    setIsLoading(false);
  };
  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Gerenciar Usuários</h1>
        <div className="flex items-center gap-2 mb-4">
          <button onClick={load} className="bg-secondary text-secondary-foreground px-3 py-1 rounded">Atualizar</button>
          {error && <div className="text-destructive ml-4">{error}</div>}
        </div>
        <form className="mb-6 grid grid-cols-2 gap-4" onSubmit={handleSubmit}>
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="border p-2" required />
          <input name="password" value={form.password} onChange={handleChange} placeholder="Senha" className="border p-2" required={!editingId} />
          <input name="full_name" value={form.full_name} onChange={handleChange} placeholder="Nome completo" className="border p-2" />
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="Telefone" className="border p-2" />
          <select name="plan" value={form.plan} onChange={handleChange} className="border p-2">
            <option value="basico">Básico</option>
            <option value="premium">Premium</option>
            <option value="vip">VIP</option>
          </select>
          <button type="submit" className="bg-primary text-white p-2 rounded">{editingId ? 'Salvar' : 'Criar'}</button>
        </form>
        {isLoading ? <div>Carregando...</div> : (
          <table className="w-full border">
            <thead>
              <tr>
                <th>Email</th>
                <th>Nome</th>
                <th>Telefone</th>
                <th>Plano</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>{user.full_name}</td>
                  <td>{user.phone}</td>
                  <td>{user.plan}</td>
                  <td>
                    <button className="text-blue-500 mr-2" onClick={() => handleEdit(user)}>Editar</button>
                    <button className="text-red-500" onClick={() => handleDelete(user.id)}>Excluir</button>
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

export default AdminUsers;
