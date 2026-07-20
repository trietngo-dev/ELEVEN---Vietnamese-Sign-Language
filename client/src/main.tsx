import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false, // disable window focus refetch
      retry: 1,
    },
  },
});

const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const response = await originalFetch(...args);
  if (response.status === 401) {
    const publicPaths = ["/dang-nhap", "/dang-ky", "/", "/khoa-hoc", "/tu-dien", "/danh-gia"];
    if (!publicPaths.includes(window.location.pathname)) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("authUser");
      window.location.href = "/dang-nhap";
    }
  }
  return response;
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
