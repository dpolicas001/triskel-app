import { Clase, Reserva, PR } from '../types';

const API_BASE = '/api';

export async function getStatus() {
  const res = await fetch(`${API_BASE}/status`);
  if (!res.ok) throw new Error('Error al consultar estado del servidor');
  return res.json();
}

export async function getClases(): Promise<Clase[]> {
  const res = await fetch(`${API_BASE}/clases`);
  if (!res.ok) throw new Error('Error al obtener clases');
  return res.json();
}

export async function createReserva(data: {
  clase_id: string;
  nombre_atleta: string;
  telefono?: string;
  email?: string;
}): Promise<Reserva> {
  const res = await fetch(`${API_BASE}/reservas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'No se pudo completar la reserva');
  }
  return json;
}

export async function deleteReserva(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/reservas/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.error || 'Error al cancelar la reserva');
  }
}

export async function getPRs(filters?: { categoria?: string; ejercicio?: string }): Promise<PR[]> {
  const params = new URLSearchParams();
  if (filters?.categoria) params.append('categoria', filters.categoria);
  if (filters?.ejercicio) params.append('ejercicio', filters.ejercicio);

  const res = await fetch(`${API_BASE}/prs?${params.toString()}`);
  if (!res.ok) throw new Error('Error al obtener PRs');
  return res.json();
}

export async function getPRsByAtleta(atleta: string): Promise<PR[]> {
  const res = await fetch(`${API_BASE}/prs/${encodeURIComponent(atleta)}`);
  if (!res.ok) throw new Error(`Error al obtener PRs de ${atleta}`);
  return res.json();
}

export async function createPR(data: Omit<PR, 'id' | 'created_at'>): Promise<PR> {
  const res = await fetch(`${API_BASE}/prs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Error al registrar el PR');
  }
  return json;
}

export async function deletePR(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/prs/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.error || 'Error al eliminar el PR');
  }
}

export async function getSqlSchema(): Promise<string> {
  const res = await fetch(`${API_BASE}/sql-schema`);
  if (!res.ok) throw new Error('Error al obtener el script SQL');
  return res.text();
}
