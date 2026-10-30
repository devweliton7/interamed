import { createStart, createCsrfMiddleware } from "@tanstack/react-start";

// Protege as funções do servidor contra requisições maliciosas (Cross-Site)
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  requestMiddleware: [csrfMiddleware],
}));