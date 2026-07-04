'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

interface Budget {
  id: string;
  legacyNumber?: string;
  status: string;
  discount: string;
  validUntil?: string;
  client: { name: string };
  vehicle?: { plate: string };
  items: { id: string; description: string; quantity: number; unitPrice: string }[];
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Rascunho',
  SENT: 'Enviado',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
  CONVERTED: 'Convertido em OS',
  EXPIRED: 'Expirado',
};

export default function OrcamentosPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Budget[]>('/orcamentos')
      .then(setBudgets)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar orcamentos'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">Orcamentos</h1>

      {loading && <p>Carregando...</p>}
      {error && <p className="text-sm text-red-600">{error} — faca login em /login.</p>}

      {!loading && !error && (
        <table className="w-full border-collapse overflow-hidden rounded-lg border bg-white text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Cliente</th>
              <th className="p-3">Veiculo</th>
              <th className="p-3">Itens</th>
              <th className="p-3">Desconto</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {budgets.map((b) => (
              <tr key={b.id} className="border-t">
                <td className="p-3">{b.client?.name}</td>
                <td className="p-3">{b.vehicle?.plate ?? '-'}</td>
                <td className="p-3">{b.items?.length ?? 0}</td>
                <td className="p-3">R$ {b.discount}</td>
                <td className="p-3">{STATUS_LABELS[b.status] ?? b.status}</td>
              </tr>
            ))}
            {budgets.length === 0 && (
              <tr>
                <td colSpan={5} className="p-3 text-center text-gray-500">
                  Nenhum orcamento cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </main>
  );
}
