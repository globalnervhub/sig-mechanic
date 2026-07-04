'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

interface Order {
  id: string;
  legacyNumber?: string;
  status: string;
  openedAt: string;
  closedAt?: string;
  partsTotal: string;
  servicesTotal: string;
  client: { name: string };
  vehicle: { plate: string; brand: string; model: string };
}

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Aberta',
  WAITING_PARTS: 'Aguardando Pecas',
  IN_PROGRESS: 'Em Execucao',
  WAITING_CLIENT: 'Aguardando Cliente',
  DONE: 'Finalizada',
  CANCELLED: 'Cancelada',
};

export default function OrdensServicoPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Order[]>('/os')
      .then(setOrders)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar ordens de servico'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">Ordens de Servico</h1>

      {loading && <p>Carregando...</p>}
      {error && <p className="text-sm text-red-600">{error} — faca login em /login.</p>}

      {!loading && !error && (
        <table className="w-full border-collapse overflow-hidden rounded-lg border bg-white text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Cliente</th>
              <th className="p-3">Veiculo</th>
              <th className="p-3">Status</th>
              <th className="p-3">Total Pecas</th>
              <th className="p-3">Total Servicos</th>
              <th className="p-3">Abertura</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="p-3">{o.client?.name}</td>
                <td className="p-3">
                  {o.vehicle?.plate} ({o.vehicle?.brand} {o.vehicle?.model})
                </td>
                <td className="p-3">{STATUS_LABELS[o.status] ?? o.status}</td>
                <td className="p-3">R$ {o.partsTotal}</td>
                <td className="p-3">R$ {o.servicesTotal}</td>
                <td className="p-3">{new Date(o.openedAt).toLocaleDateString('pt-BR')}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="p-3 text-center text-gray-500">
                  Nenhuma ordem de servico cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </main>
  );
}
