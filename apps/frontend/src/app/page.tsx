import Link from 'next/link';

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">Dashboard — SIG-Mechanic</h1>
      <p className="mb-8 text-gray-600">
        MVP inicial. Modulos disponiveis ate o momento:
      </p>
      <nav className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Link href="/clientes" className="rounded-lg border bg-white p-4 shadow-sm hover:shadow">
          Clientes
        </Link>
        <Link href="/login" className="rounded-lg border bg-white p-4 shadow-sm hover:shadow">
          Login
        </Link>
      </nav>
    </main>
  );
}
