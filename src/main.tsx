import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { StyledEngineProvider } from "@mui/material/styles";
import GlobalStyles from "@mui/material/GlobalStyles";
import "./index.css";
import "./api/index";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* Wrap MUI styles in @layer mui so Tailwind utilities can override them.
        Keep this layer order identical to the one at the top of index.css. */}
    <StyledEngineProvider enableCssLayer>
      <GlobalStyles styles="@layer properties, theme, base, mui, components, utilities;" />
      <App />
    </StyledEngineProvider>
  </StrictMode>,
);
