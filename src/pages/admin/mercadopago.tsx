import React from "react";
import { Card } from "@/components/ui/card";

export const AdminMercadoPago = () => {
  const [config, setConfig] = React.useState({ access_token: '', public_key: '' });
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const load = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const api = await import('@/lib/adminApi');
      const cfg = await api.getMercadoPagoConfig();
      setConfig(cfg || { access_token: '', public_key: '' });
    } catch (e: any) {
      setError(e?.message || 'Erro ao carregar config');
    } finally {
      setIsLoading(false);
    }
  }, []);
  React.useEffect(() => { load(); }, [load]);
  const handleChange = e => setConfig({ ...config, [e.target.name]: e.target.value });
  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    const api = await import('@/lib/adminApi');
    await api.updateMercadoPagoConfig(config);
    setIsLoading(false);
  };
  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Configurar Mercado Pago</h1>
        <div className="flex items-center gap-2 mb-4">
          <button onClick={load} className="bg-secondary text-secondary-foreground px-3 py-1 rounded">Atualizar</button>
          {error && <div className="text-destructive ml-4">{error}</div>}
        </div>
        <form className="mb-6 grid grid-cols-2 gap-4" onSubmit={handleSubmit}>
          <input name="access_token" value={config.access_token} onChange={handleChange} placeholder="Access Token" className="border p-2" required />
          <input name="public_key" value={config.public_key} onChange={handleChange} placeholder="Public Key" className="border p-2" required />
          <button type="submit" className="bg-primary text-white p-2 rounded">Salvar</button>
        </form>
        {isLoading && <div>Carregando...</div>}
      </Card>
    </div>
  );
};

export default AdminMercadoPago;
