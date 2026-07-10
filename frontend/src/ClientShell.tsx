"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import App from "./App";
import { RouterProvider } from "./routing";

const queryClient = new QueryClient();

export function ClientShell() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    void import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  if (!mounted) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider>
        <App />
      </RouterProvider>
    </QueryClientProvider>
  );
}
