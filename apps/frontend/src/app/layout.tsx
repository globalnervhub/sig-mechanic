import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SIG-Mechanic',
  description: 'Sistema de Gestao para Oficinas Mecanicas',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
