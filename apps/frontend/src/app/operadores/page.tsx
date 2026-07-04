'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { apiFetch } from '@/lib/api';

interface Operator {
  id: string;
  name: string;
  role?: string;
  active: boolean;
}

const emptyForm = { name: '', role: '' };

export default function OperadoresPage() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    apiFetch<Operator[]>('/operadores')
      .then(setOperators)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar operadores'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function startEdit(operator: Operator) {
    setEditingId(operator.id);
    setForm({ name: operator.name, role: operator.role ?? '' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      if (editingId) {
        await apiFetch(`/operadores/${editingId}`, { method: 'PATCH', body: JSON.stringify(form) });
      } else {
        await apiFetch('/operadores', { method: 'POST', body: JSON.stringify(form) });
      }
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao salvar operador');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este operador?')) return;
    setRowError(null);
    try {
      await apiFetch(`/operadores/${id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      setRowError(err instanceof Error ? err.message : 'Erro ao excluir operador');
    }
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl p-8">
        <h1 className="mb-6 text-2xl font-semibold">Operadores</h1>

        <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-1 gap-3 rounded-lg border bg-white p-4 sm:grid-cols-4">
          <input
            required
            placeholder="Nome"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded border px-3 py-2 text-sm sm:col-span-2"
          />
          <input
            placeholder="Cargo"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="rounded border px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {submitting ? 'Salvando...' : editingId ? 'Salvar' : 'Adicionar Operador'}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="rounded border px-3 py-2 text-sm">
                Cancelar
              </button>
            )}
          </div>
          {formError && <p className="text-sm text-red-600 sm:col-span-4">{formError}</p>}
        </form>

        {loading && <p>Carregando...</p>}
        {error && <p className="text-sm text-red-600">{error} — faca login em /login.</p>}
        {rowError && <p className="mb-4 text-sm text-red-600">{rowError}</p>}

        {!loading && !error && (
          <table className="w-full border-collapse overflow-hidden rounded-lg border bg-white text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Nome</th>
                <th className="p-3">Cargo</th>
                <th className="p-3">Status</th>
                <th className="p-3">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {operators.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="p-3">{o.name}</td>
                  <td className="p-3">{o.role ?? '-'}</td>
                  <td className="p-3">{o.active ? 'Ativo' : 'Inativo'}</td>
                  <td className="p-3 space-x-2">
                    <button onClick={() => startEdit(o)} className="text-blue-600 hover:underline">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(o.id)} className="text-red-600 hover:underline">
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {operators.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-3 text-center text-gray-500">
                    Nenhum operador cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </main>
    </AppShell>
  );
}
