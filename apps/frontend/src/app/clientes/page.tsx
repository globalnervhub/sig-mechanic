'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  city?: string;
  active: boolean;
}

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Client[]>('/clientes')
      .then(setClients)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar clientes'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">Clientes</h1>

      {loading && <p>Carregando...</p>}
      {error && (
        <p className="text-sm text-red-600">
          {error} — verifique se voce esta autenticado (faca login em /login).
        </p>
      )}

      {!loading && !error && (
        <table className="w-full border-collapse overflow-hidden rounded-lg border bg-white text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">Telefone</th>
              <th className="p-3">Email</th>
              <th className="p-3">Cidade</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-t">
                <td className="p-3">{client.name}</td>
                <td className="p-3">{client.phone ?? '-'}</td>
                <td className="p-3">{client.email ?? '-'}</td>
                <td className="p-3">{client.city ?? '-'}</td>
                <td className="p-3">{client.active ? 'Ativo' : 'Inativo'}</td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={5} className="p-3 text-center text-gray-500">
                  Nenhum cliente cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </main>
  );
}
