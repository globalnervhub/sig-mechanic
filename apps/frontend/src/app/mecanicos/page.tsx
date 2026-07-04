'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

interface Mechanic {
  id: string;
  name: string;
  phone?: string;
  specialty?: string;
  active: boolean;
  commissionPercent?: string;
}

export default function MecanicosPage() {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Mechanic[]>('/mecanicos')
      .then(setMechanics)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar mecanicos'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">Mecanicos</h1>

      {loading && <p>Carregando...</p>}
      {error && <p className="text-sm text-red-600">{error} — faca login em /login.</p>}

      {!loading && !error && (
        <table className="w-full border-collapse overflow-hidden rounded-lg border bg-white text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">Telefone</th>
              <th className="p-3">Especialidade</th>
              <th className="p-3">Comissao %</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {mechanics.map((m) => (
              <tr key={m.id} className="border-t">
                <td className="p-3">{m.name}</td>
                <td className="p-3">{m.phone ?? '-'}</td>
                <td className="p-3">{m.specialty ?? '-'}</td>
                <td className="p-3">{m.commissionPercent ?? '-'}</td>
                <td className="p-3">{m.active ? 'Ativo' : 'Inativo'}</td>
              </tr>
            ))}
            {mechanics.length === 0 && (
              <tr>
                <td colSpan={5} className="p-3 text-center text-gray-500">
                  Nenhum mecanico cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </main>
  );
}
