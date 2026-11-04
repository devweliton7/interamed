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

// Tela de Erro - AGORA COM DEBUG DETALHADO
function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error("ERRO CAPTURADO PELO ROOT:", error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9F9F9] px-6 py-12">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-xl font-bold tracking-tight text-black">
          Ops, algo deu errado
        </h1>
        <p className="mt-2 text-sm font-medium text-gray-500">
          Ocorreu um erro inesperado no sistema.
        </p>
        
        {/* Bloco de debug com o erro real */}
        <div className="mt-6 text-left bg-white border border-red-200 rounded-xl p-4 shadow-sm overflow-auto">
          <p className="text-xs font-bold text-red-600 mb-1 uppercase tracking-wider">Mensagem do Erro:</p>
          <pre className="text-xs text-gray-800 font-mono bg-gray-50 p-3 rounded-lg whitespace-pre-wrap break-words">
            {error instanceof Error ? error.message : String(error)}
          </pre>
          
          {error instanceof Error && error.stack && (
            <>
              <p className="text-xs font-bold text-red-600 mt-3 mb-1 uppercase tracking-wider">Stack Trace:</p>
              <pre className="text-[10px] text-gray-500 font-mono bg-gray-50 p-3 rounded-lg whitespace-pre-wrap break-words">
                {error.stack}
              </pre>
            </>
          )}
        </div>

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
      { rel: "icon", href: "data:," },
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