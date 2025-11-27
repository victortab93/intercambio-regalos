// src/middleware.ts
import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/api/auth",
  "/invite"
];

// Rutas que requieren sesión
const PROTECTED_PREFIXES = [
  "/exchanges",
  "/wishlist",
  "/dashboard"
];

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // 1. Permitir rutas públicas
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // 2. Verificar si es una ruta protegida
  const isProtected = PROTECTED_PREFIXES.some(prefix =>
    pathname.startsWith(prefix)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // 3. Obtener token
  const token = req.cookies.get("session_token")?.value;

  if (!token) {
    // Si hay ?invite, lo preservamos
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("redirect", pathname + req.nextUrl.search);

    return NextResponse.redirect(redirectUrl);
  }

  // 4. Verificar JWT
  const verified = await verifyJwt(token);

  if (!verified) {
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("redirect", pathname + req.nextUrl.search);
    return NextResponse.redirect(redirectUrl);
  }

  // Usuario autenticado → permitir acceso
  return NextResponse.next();
}

// -------------------------------------------
// Helpers
// -------------------------------------------
function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(p => pathname.startsWith(p));
}

async function verifyJwt(token: string): Promise<boolean> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    await jwtVerify(token, secret);

    return true;
  } catch (err) {
    console.error("Invalid JWT:", err);
    return false;
  }
}

// -------------------------------------------
// Matcher
// -------------------------------------------
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)"
  ]
};
