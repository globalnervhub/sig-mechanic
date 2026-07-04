'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { apiFetch } from '@/lib/api';

interface Client {
  id: string;
  type: 'PF' | 'PJ';
  name: string;
  phone?: string;
  email?: string;
  city?: string;
  active: boolean;
}

const emptyForm: { type: 'PF' | 'PJ'; name: string; phone: string; email: string; city: string } = {
  type: 'PF',
  name: '',
  phone: '',
  email: '',
  city: '',
};

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    apiFetch<Client[]>('/clientes')
      .then(setClients)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar clientes'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function startEdit(client: Client) {
    setEditingId(client.id);
    setForm({
      type: client.type,
      name: client.name,
      phone: client.phone ?? '',
      email: client.email ?? '',
      city: client.city ?? '',
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
      if (editingId) {
        await apiFetch(`/clientes/${editingId}`, { method: 'PATCH', body: JSON.stringify(form) });
      } else {
        await apiFetch('/clientes', { method: 'POST', body: JSON.stringify(form) });
      }
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao salvar cliente');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este cliente?')) return;
    setRowError(null);
    try {
      await apiFetch(`/clientes/${id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      setRowError(err instanceof Error ? err.message : 'Erro ao excluir cliente');
    }
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl p-8">
        <h1 className="mb-6 text-2xl font-semibold">Clientes</h1>

        <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-1 gap-3 rounded-lg border bg-white p-4 sm:grid-cols-5">
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as 'PF' | 'PJ' })}
            className="rounded border px-3 py-2 text-sm"
          >
            <option value="PF">Pessoa Fisica</option>
            <option value="PJ">Pessoa Juridica</option>
          </select>
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
            placeholder="Cidade"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="rounded border px-3 py-2 text-sm"
          />
          <input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded border px-3 py-2 text-sm sm:col-span-2"
          />
          <div className="flex gap-2 sm:col-span-1">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {submitting ? 'Salvando...' : editingId ? 'Salvar' : 'Adicionar'}
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
        {error && (
          <p className="text-sm text-red-600">
            {error} — verifique se voce esta autenticado (faca login em /login).
          </p>
        )}
        {rowError && <p className="mb-4 text-sm text-red-600">{rowError}</p>}

        {!loading && !error && (
          <table className="w-full border-collapse overflow-hidden rounded-lg border bg-white text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Nome</th>
                <th className="p-3">Telefone</th>
                <th className="p-3">Email</th>
                <th className="p-3">Cidade</th>
                <th className="p-3">Status</th>
                <th className="p-3">Acoes</th>
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
                  <td className="p-3 space-x-2">
                    <button onClick={() => startEdit(client)} className="text-blue-600 hover:underline">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(client.id)} className="text-red-600 hover:underline">
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-3 text-center text-gray-500">
                    Nenhum cliente cadastrado.
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
