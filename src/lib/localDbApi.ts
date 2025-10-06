const API_BASE = (import.meta as any).env.VITE_API_URL || '';

export async function getProfile(email: string) {
  const res = await fetch(`${API_BASE}/api/profile/${email}`);
  return res.json();
}

export async function createProfile(email: string, full_name: string, phone: string) {
  const res = await fetch(`${API_BASE}/api/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, full_name, phone })
  });
  return res.json();
}

export async function getPlans() {
  const res = await fetch(`${API_BASE}/api/plans`);
  return res.json();
}

export async function getSignals() {
  const res = await fetch(`${API_BASE}/api/signals`);
  return res.json();
}

export async function createSignal(title: string, description: string, vip_only: boolean) {
  const res = await fetch(`${API_BASE}/api/signals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, vip_only })
  });
  return res.json();
}
