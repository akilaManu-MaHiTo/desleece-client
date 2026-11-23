import AppRoutes from "./routes";
import { useSmoothScroll } from "./hooks/useSmoothScroll";
import "./App.css";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "./state/queryClient.ts";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Main Functional Component for the App
function App() {
  useSmoothScroll();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 2800,
            style: {
              background: "var(--purple-deep)",
              color: "white",
              borderRadius: "999px",
              boxShadow: "0 18px 40px rgba(50, 17, 63, 0.25)",
              fontSize: "13px",
              padding: "12px 18px",
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
