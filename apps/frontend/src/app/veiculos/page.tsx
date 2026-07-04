'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  plate: string;
  year?: string;
  color?: string;
  client: { name: string };
}

export default function VeiculosPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Vehicle[]>('/veiculos')
      .then(setVehicles)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar veiculos'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">Veiculos</h1>

      {loading && <p>Carregando...</p>}
      {error && <p className="text-sm text-red-600">{error} — faca login em /login.</p>}

      {!loading && !error && (
        <table className="w-full border-collapse overflow-hidden rounded-lg border bg-white text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Placa</th>
              <th className="p-3">Marca</th>
              <th className="p-3">Modelo</th>
              <th className="p-3">Ano</th>
              <th className="p-3">Cliente</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id} className="border-t">
                <td className="p-3">{v.plate}</td>
                <td className="p-3">{v.brand}</td>
                <td className="p-3">{v.model}</td>
                <td className="p-3">{v.year ?? '-'}</td>
                <td className="p-3">{v.client?.name}</td>
              </tr>
            ))}
            {vehicles.length === 0 && (
              <tr>
                <td colSpan={5} className="p-3 text-center text-gray-500">
                  Nenhum veiculo cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </main>
  );
}
