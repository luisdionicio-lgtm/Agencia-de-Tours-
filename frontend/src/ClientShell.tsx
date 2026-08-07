"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import App from "./App";
import { RouterProvider } from "./core/routing";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false },
    mutations: { retry: 0 }
  }
});

function InitialExperience() {
  return <div className="initial-experience" role="status" aria-label="Preparando la experiencia JohnToursPerú"><img src="/john-tours-logo-cropped.png" alt="" /><span><i /><i /><i /></span><small>Preparando tu próxima experiencia</small></div>;
}

export function ClientShell() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    void import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  if (!mounted) return <InitialExperience />;

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider>
        <App />
      </RouterProvider>
    </QueryClientProvider>
  );
}
