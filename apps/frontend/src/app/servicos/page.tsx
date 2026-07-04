'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

interface ServiceItem {
  id: string;
  name: string;
  category?: string;
  price: string;
  avgTimeMin?: number;
  active: boolean;
}

export default function ServicosPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<ServiceItem[]>('/servicos')
      .then(setServices)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar servicos'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">Servicos</h1>

      {loading && <p>Carregando...</p>}
      {error && <p className="text-sm text-red-600">{error} — faca login em /login.</p>}

      {!loading && !error && (
        <table className="w-full border-collapse overflow-hidden rounded-lg border bg-white text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">Categoria</th>
              <th className="p-3">Preco</th>
              <th className="p-3">Tempo Medio (min)</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-3">{s.name}</td>
                <td className="p-3">{s.category ?? '-'}</td>
                <td className="p-3">R$ {s.price}</td>
                <td className="p-3">{s.avgTimeMin ?? '-'}</td>
                <td className="p-3">{s.active ? 'Ativo' : 'Inativo'}</td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr>
                <td colSpan={5} className="p-3 text-center text-gray-500">
                  Nenhum servico cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </main>
  );
}
