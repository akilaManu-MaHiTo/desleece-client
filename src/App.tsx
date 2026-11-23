import AppRoutes from "./routes";
import { useSmoothScroll } from "./hooks/useSmoothScroll";
import "./App.css";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "./state/queryClient.ts";
import { BrowserRouter } from "react-router-dom";

// Main Functional Component for the App
function App() {
  useSmoothScroll();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
