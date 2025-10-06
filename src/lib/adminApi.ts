// API para admin: usuários, planos, Mercado Pago
const API_BASE = (import.meta as any).env.VITE_API_URL || '';

export async function getUsers() {
  const res = await fetch(`${API_BASE}/api/admin/users`);
  return res.json();
}

export async function createUser(email, password, full_name, phone, plan) {
  const res = await fetch(`${API_BASE}/api/admin/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, full_name, phone, plan })
  });
  return res.json();
}

export async function updateUser(id, data) {
  const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteUser(id) {
  const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
    method: 'DELETE' });
  return res.json();
}

export async function getAdminPlans() {
  const res = await fetch(`${API_BASE}/api/admin/plans`);
  return res.json();
}

export async function createPlan(name, price, description) {
  const res = await fetch(`${API_BASE}/api/admin/plans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, price, description })
  });
  return res.json();
}

export async function updatePlan(id, data) {
  const res = await fetch(`${API_BASE}/api/admin/plans/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deletePlan(id) {
  const res = await fetch(`${API_BASE}/api/admin/plans/${id}`, {
    method: 'DELETE' });
  return res.json();
}

export async function getMercadoPagoConfig() {
  const res = await fetch(`${API_BASE}/api/admin/mercadopago`);
  return res.json();
}

export async function updateMercadoPagoConfig(data) {
  const res = await fetch(`${API_BASE}/api/admin/mercadopago`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}
