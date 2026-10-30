import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { type ReactNode } from "react";

import appCss from "../styles.css?url";

// Tela de "Não Encontrado" (404)
function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9F9F9] px-6">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-extrabold tracking-tighter text-black">404</h1>
        <h2 className="mt-4 text-xl font-bold text-black">Página não encontrada</h2>
        <p className="mt-2 text-sm font-medium text-gray-500">
          O endereço que você tentou acessar não existe ou foi movido.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-gray-800"
          >
            Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  );
}

// Tela de Erro Genérico
function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9F9F9] px-6">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-bold tracking-tight text-black">
          Ops, algo deu errado
        </h1>
        <p className="mt-2 text-sm font-medium text-gray-500">
          Ocorreu um erro inesperado no sistema. Tente novamente ou volte para o início.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-gray-800"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-gray-100"
          >
            Voltar ao início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "InteraMed" },
      { name: "description", content: "Verificação de interações medicamentosas" },
      { property: "og:title", content: "InteraMed" },
      { property: "og:description", content: "Verificação de interações medicamentosas" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" },
      { rel: "icon", href: "data:," }, // Remove o favicon padrão e deixa a aba limpa
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body className="antialiased selection:bg-black selection:text-white">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}