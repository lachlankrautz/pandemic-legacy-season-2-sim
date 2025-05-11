import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

const root = document.getElementById("root");
if (root === null) {
  throw new Error("failed to get root element");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
