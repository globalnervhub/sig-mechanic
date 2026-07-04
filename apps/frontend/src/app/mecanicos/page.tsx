'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { apiFetch } from '@/lib/api';

interface Mechanic {
  id: string;
  name: string;
  phone?: string;
  specialty?: string;
  active: boolean;
  commissionPercent?: string;
}

const emptyForm = { name: '', phone: '', specialty: '', commissionPercent: '' };

export default function MecanicosPage() {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    apiFetch<Mechanic[]>('/mecanicos')
      .then(setMechanics)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar mecanicos'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function startEdit(mechanic: Mechanic) {
    setEditingId(mechanic.id);
    setForm({
      name: mechanic.name,
      phone: mechanic.phone ?? '',
      specialty: mechanic.specialty ?? '',
      commissionPercent: mechanic.commissionPercent ?? '',
    });
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
      const payload = {
        ...form,
        commissionPercent: form.commissionPercent ? Number(form.commissionPercent) : undefined,
      };
      if (editingId) {
        await apiFetch(`/mecanicos/${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        await apiFetch('/mecanicos', { method: 'POST', body: JSON.stringify(payload) });
      }
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao salvar mecanico');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este mecanico?')) return;
    setRowError(null);
    try {
      await apiFetch(`/mecanicos/${id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      setRowError(err instanceof Error ? err.message : 'Erro ao excluir mecanico');
    }
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl p-8">
        <h1 className="mb-6 text-2xl font-semibold">Mecanicos</h1>

        <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-1 gap-3 rounded-lg border bg-white p-4 sm:grid-cols-5">
          <input
            required
            placeholder="Nome"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded border px-3 py-2 text-sm sm:col-span-2"
          />
          <input
            placeholder="Telefone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="rounded border px-3 py-2 text-sm"
          />
          <input
            placeholder="Especialidade"
            value={form.specialty}
            onChange={(e) => setForm({ ...form, specialty: e.target.value })}
            className="rounded border px-3 py-2 text-sm"
          />
          <input
            placeholder="Comissao %"
            type="number"
            step="0.01"
            value={form.commissionPercent}
            onChange={(e) => setForm({ ...form, commissionPercent: e.target.value })}
            className="rounded border px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {submitting ? 'Salvando...' : editingId ? 'Salvar' : 'Adicionar Mecanico'}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="rounded border px-3 py-2 text-sm">
                Cancelar
              </button>
            )}
          </div>
          {formError && <p className="text-sm text-red-600 sm:col-span-5">{formError}</p>}
        </form>

        {loading && <p>Carregando...</p>}
        {error && <p className="text-sm text-red-600">{error} — faca login em /login.</p>}
        {rowError && <p className="mb-4 text-sm text-red-600">{rowError}</p>}

        {!loading && !error && (
          <table className="w-full border-collapse overflow-hidden rounded-lg border bg-white text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Nome</th>
                <th className="p-3">Telefone</th>
                <th className="p-3">Especialidade</th>
                <th className="p-3">Comissao %</th>
                <th className="p-3">Status</th>
                <th className="p-3">Acoes</th>
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
                  <td className="p-3 space-x-2">
                    <button onClick={() => startEdit(m)} className="text-blue-600 hover:underline">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(m.id)} className="text-red-600 hover:underline">
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {mechanics.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-3 text-center text-gray-500">
                    Nenhum mecanico cadastrado.
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
