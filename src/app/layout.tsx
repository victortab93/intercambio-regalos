// src/app/layout.tsx
import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Intercambio de Regalos',
  description: 'Organiza intercambios de regalos con tus amigos y familia'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-slate-800 bg-gradient-to-r from-fuchsia-600 to-pink-600">
            <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <span className="h-8 w-8 rounded-full bg-black/20 flex items-center justify-center text-xl">
                  🎁
                </span>
                <span className="font-semibold text-lg">Intercambio</span>
              </Link>
              <nav className="flex items-center gap-3 text-sm">
                <Link href="/exchanges" className="hover:underline">
                  Mis intercambios
                </Link>
                <Link href="/login" className="hover:underline">
                  Login
                </Link>
              </nav>
            </div>
          </header>
          <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-6">
            {children}
          </main>
          <footer className="border-t border-slate-800 py-4 text-center text-xs text-slate-400">
            Intercambio de Regalos · {new Date().getFullYear()}
          </footer>
        </div>
      </body>
    </html>
  );
}
