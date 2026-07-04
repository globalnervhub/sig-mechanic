'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

interface Operator {
  id: string;
  name: string;
  role?: string;
  active: boolean;
}

export default function OperadoresPage() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Operator[]>('/operadores')
      .then(setOperators)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar operadores'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">Operadores</h1>

      {loading && <p>Carregando...</p>}
      {error && <p className="text-sm text-red-600">{error} — faca login em /login.</p>}

      {!loading && !error && (
        <table className="w-full border-collapse overflow-hidden rounded-lg border bg-white text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">Cargo</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {operators.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="p-3">{o.name}</td>
                <td className="p-3">{o.role ?? '-'}</td>
                <td className="p-3">{o.active ? 'Ativo' : 'Inativo'}</td>
              </tr>
            ))}
            {operators.length === 0 && (
              <tr>
                <td colSpan={3} className="p-3 text-center text-gray-500">
                  Nenhum operador cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </main>
  );
}
