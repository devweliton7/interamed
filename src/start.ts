// src/start.ts
import { createStart, createMiddleware } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";

const cameraPermissionMiddleware = createMiddleware().server(async ({ next }) => {
  // Define o header individualmente (mais seguro e evita erro de iteração)
  setResponseHeader("Permissions-Policy", "camera=(self), microphone=()");
  
  return next();
});

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [cameraPermissionMiddleware],
  };
});