'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import StatusBadge from '@/components/StatusBadge';
import { useToast } from '@/components/Toast';
import { apiFetch } from '@/lib/api';

interface Operator {
  id: string;
  name: string;
  role?: string;
  active: boolean;
}

const emptyForm = { name: '', role: '' };

export default function OperadoresPage() {
  const { showToast } = useToast();
  const [operators, setOperators] = useState<Operator[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function load(term?: string) {
    setLoading(true);
    const query = term ? `?search=${encodeURIComponent(term)}` : '';
    apiFetch<Operator[]>(`/operadores${query}`)
      .then(setOperators)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar operadores'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const timeout = setTimeout(() => load(search), 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

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
        showToast('Operador atualizado com sucesso.');
      } else {
        await apiFetch('/operadores', { method: 'POST', body: JSON.stringify(form) });
        showToast('Operador cadastrado com sucesso.');
      }
      setForm(emptyForm);
      setEditingId(null);
      load(search);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar operador';
      setFormError(message);
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este operador?')) return;
    try {
      await apiFetch(`/operadores/${id}`, { method: 'DELETE' });
      showToast('Operador excluido.');
      load(search);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao excluir operador', 'error');
    }
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl p-6 md:p-8">
        <div className="mb-6 flex justify-end">
          <input
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm sm:w-72"
          />
        </div>

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

        {loading && <p className="text-gray-500">Carregando...</p>}
        {error && <p className="text-sm text-red-600">{error} — faca login em /login.</p>}

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
                <tr key={o.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{o.name}</td>
                  <td className="p-3">{o.role ?? '-'}</td>
                  <td className="p-3">
                    <StatusBadge status={o.active ? 'ATIVO' : 'INATIVO'} />
                  </td>
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
