'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { clearSession, getUser, isAuthenticated, StoredUser } from '@/lib/auth';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard' },
  { href: '/clientes', label: 'Clientes' },
  { href: '/veiculos', label: 'Veiculos' },
  { href: '/servicos', label: 'Servicos' },
  { href: '/mecanicos', label: 'Mecanicos' },
  { href: '/operadores', label: 'Operadores' },
  { href: '/orcamentos', label: 'Orcamentos' },
  { href: '/os', label: 'Ordens de Servico' },
  { href: '/financeiro', label: 'Financeiro' },
  { href: '/comissoes', label: 'Comissoes' },
  { href: '/usuarios', label: 'Usuarios' },
];

/**
 * Envolve paginas protegidas: redireciona para /login se nao houver sessao,
 * e renderiza uma navbar comum com logout.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }
    setUser(getUser());
    setChecked(true);
  }, [router]);

  function handleLogout() {
    clearSession();
    router.replace('/login');
  }

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        Verificando sessao...
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <span className="font-semibold">SIG-Mechanic</span>
            <nav className="hidden gap-4 text-sm md:flex">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={pathname === item.href ? 'font-semibold text-gray-900' : 'text-gray-500 hover:text-gray-900'}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-600">{user?.name ?? user?.email}</span>
            <button onClick={handleLogout} className="rounded border px-3 py-1 hover:bg-gray-50">
              Sair
            </button>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
