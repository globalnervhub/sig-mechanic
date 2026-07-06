'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { clearSession, getUser, isAuthenticated, StoredUser } from '@/lib/auth';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const ICONS = {
  dashboard: 'M3 13h4v8H3zM10 3h4v18h-4zM17 8h4v13h-4z',
  clientes: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM4 21a8 8 0 0116 0',
  veiculos: 'M5 17h14M5 17a2 2 0 100 4 2 2 0 000-4zm14 0a2 2 0 100 4 2 2 0 000-4zM5 17l1.5-6h11L19 17M6.5 11l1-3.5A2 2 0 019.4 6h5.2a2 2 0 011.9 1.5l1 3.5',
  marcas: 'M20.6 12.3l-8.4-8.4c-.4-.4-.9-.6-1.4-.6H4a1 1 0 00-1 1v6.8c0 .5.2 1 .6 1.4l8.4 8.4c.8.8 2 .8 2.8 0l5.8-5.8c.8-.8.8-2 0-2.8zM7 8a1 1 0 110-2 1 1 0 010 2z',
  servicos: 'M14.7 6.3a4 4 0 10-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 005.4-5.4l-2.8 2.8-2.2-2.2z',
  mecanicos: 'M11 4a2 2 0 100 4 2 2 0 000-4zM3 20c0-3.3 3.6-6 8-6s8 2.7 8 6',
  operadores: 'M8 7a3 3 0 106 0 3 3 0 00-6 0zM2 20c0-2.8 2.7-5 6-5M22 20c0-2.8-2.7-5-6-5M14 20c0-2.8-2.7-5-6-5s-6 2.2-6 5',
  orcamentos: 'M9 12h6M9 16h6M9 8h6M6 4h12a1 1 0 011 1v15l-3-2-2 2-2-2-2 2-2-2-3 2V5a1 1 0 011-1z',
  os: 'M9 3h6l1 3h3a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h3zM9 12l2 2 4-4',
  trocasOleo: 'M12 2c-3 4-6 7.5-6 11a6 6 0 0012 0c0-3.5-3-7-6-11z',
  financeiro: 'M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
  comissoes: 'M12 8v8M8 12h8M12 22a10 10 0 100-20 10 10 0 000 20z',
  usuarios: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0',
  papeis: 'M9 12l2 2 4-4m5.6-1.4a9 9 0 11-12.7 0M12 3v4',
};

const NAV_GROUPS: NavGroup[] = [
  { title: '', items: [{ href: '/', label: 'Dashboard', icon: <Icon d={ICONS.dashboard} /> }] },
  {
    title: 'Cadastros',
    items: [
      { href: '/clientes', label: 'Clientes', icon: <Icon d={ICONS.clientes} /> },
      { href: '/veiculos', label: 'Veiculos', icon: <Icon d={ICONS.veiculos} /> },
      { href: '/marcas', label: 'Marcas e Modelos', icon: <Icon d={ICONS.marcas} /> },
      { href: '/servicos', label: 'Servicos', icon: <Icon d={ICONS.servicos} /> },
      { href: '/mecanicos', label: 'Mecanicos', icon: <Icon d={ICONS.mecanicos} /> },
      { href: '/operadores', label: 'Operadores', icon: <Icon d={ICONS.operadores} /> },
    ],
  },
  {
    title: 'Operacao',
    items: [
      { href: '/orcamentos', label: 'Orcamentos', icon: <Icon d={ICONS.orcamentos} /> },
      { href: '/os', label: 'Ordens de Servico', icon: <Icon d={ICONS.os} /> },
      { href: '/trocas-oleo', label: 'Trocas de Oleo', icon: <Icon d={ICONS.trocasOleo} /> },
    ],
  },
  {
    title: 'Financeiro',
    items: [
      { href: '/financeiro', label: 'Financeiro', icon: <Icon d={ICONS.financeiro} /> },
      { href: '/comissoes', label: 'Comissoes', icon: <Icon d={ICONS.comissoes} /> },
    ],
  },
  {
    title: 'Administracao',
    items: [
      { href: '/usuarios', label: 'Usuarios', icon: <Icon d={ICONS.usuarios} /> },
      { href: '/papeis', label: 'Papeis e Permissoes', icon: <Icon d={ICONS.papeis} /> },
    ],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

/**
 * Envolve paginas protegidas: redireciona para /login se nao houver sessao,
 * e renderiza um layout com sidebar de navegacao + cabecalho com logout.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [checked, setChecked] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const currentLabel = ALL_ITEMS.find((i) => i.href === pathname)?.label ?? 'SIG-Mechanic';

  const sidebarContent = (
    <>
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-sm font-bold text-white">
          SM
        </div>
        <span className="text-lg font-semibold">SIG-Mechanic</span>
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {NAV_GROUPS.map((group, idx) => (
          <div key={idx}>
            {group.title && (
              <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {group.title}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      active
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-white md:flex">{sidebarContent}</aside>

      {/* Sidebar mobile (overlay) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">{sidebarContent}</aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-white px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded border px-2 py-1 text-sm md:hidden"
              aria-label="Abrir menu"
            >
              ☰
            </button>
            <h1 className="text-base font-semibold text-gray-800">{currentLabel}</h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-gray-600 sm:inline">{user?.name ?? user?.email}</span>
            <button onClick={handleLogout} className="rounded border px-3 py-1.5 hover:bg-gray-50">
              Sair
            </button>
          </div>
        </header>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
