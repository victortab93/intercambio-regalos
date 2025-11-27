// src/app/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center mt-16 text-center">
      <h1 className="text-3xl font-semibold text-fuchsia-300 mb-3">
        Organiza tu intercambio de regalos
      </h1>

      <p className="text-slate-400 max-w-md mb-6 text-sm">
        Crea intercambios, invita a tus amigos con un link, genera emparejamientos
        automáticos y comparte tu lista de deseos.
      </p>

      <div className="flex gap-3">
        <Link href="/signup">
          <Button>Crear cuenta</Button>
        </Link>
        <Link href="/login">
          <Button variant="secondary">Ya tengo cuenta</Button>
        </Link>
      </div>
    </div>
  );
}
