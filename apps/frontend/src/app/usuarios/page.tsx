'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { apiFetch } from '@/lib/api';
import DevNotice from '@/components/DevNotice';

interface UserRow {
  id: string;
  name: string;
  email: string;
  active: boolean;
  role: { name: string };
}

interface RoleOption {
  id: string;
  name: string;
}

const emptyForm = { name: '', email: '', password: '', roleId: '' };

export default function UsuariosPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    Promise.all([apiFetch<UserRow[]>('/usuarios'), apiFetch<RoleOption[]>('/usuarios/roles')])
      .then(([u, r]) => {
        setUsers(u);
        setRoles(r);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar usuarios'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await apiFetch('/usuarios', { method: 'POST', body: JSON.stringify(form) });
      setForm(emptyForm);
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao criar usuario');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(user: UserRow) {
    await apiFetch(`/usuarios/${user.id}`, { method: 'PATCH', body: JSON.stringify({ active: !user.active }) });
    load();
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl p-8">
        <h1 className="mb-6 text-2xl font-semibold">Usuarios</h1>

        <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-1 gap-3 rounded-lg border bg-white p-4 sm:grid-cols-5">
          <input
            required
            placeholder="Nome"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded border px-3 py-2 text-sm"
          />
          <input
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded border px-3 py-2 text-sm"
          />
          <input
            required
            type="password"
            minLength={6}
            placeholder="Senha (min. 6 caracteres)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="rounded border px-3 py-2 text-sm"
          />
          <select
            required
            value={form.roleId}
            onChange={(e) => setForm({ ...form, roleId: e.target.value })}
            className="rounded border px-3 py-2 text-sm"
          >
            <option value="">Papel (role)</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {submitting ? 'Salvando...' : 'Adicionar Usuario'}
          </button>
          {formError && <p className="text-sm text-red-600 sm:col-span-5">{formError}</p>}
          <div className="sm:col-span-5">
            <DevNotice>
              A senha digitada aqui e definida em texto puro apenas nesta sessao do navegador antes
              de ser enviada ao servidor (que a criptografa). Minimo de 6 caracteres. Nao existe
              ainda fluxo de "esqueci minha senha" ou troca de senha pelo proprio usuario — para
              redefinir, recrie o usuario ou peca a um administrador para faze-lo diretamente no
              banco. Usuario admin padrao: <strong>admin@sig-mechanic.local</strong> / senha{' '}
              <strong>ChangeMe123!</strong>.
            </DevNotice>
          </div>
        </form>

        {loading && <p>Carregando...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <table className="w-full border-collapse overflow-hidden rounded-lg border bg-white text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Nome</th>
                <th className="p-3">Email</th>
                <th className="p-3">Papel</th>
                <th className="p-3">Status</th>
                <th className="p-3">Acao</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.role?.name}</td>
                  <td className="p-3">{u.active ? 'Ativo' : 'Inativo'}</td>
                  <td className="p-3">
                    <button onClick={() => toggleActive(u)} className="text-blue-600 hover:underline">
                      {u.active ? 'Desativar' : 'Ativar'}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-3 text-center text-gray-500">
                    Nenhum usuario cadastrado.
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
