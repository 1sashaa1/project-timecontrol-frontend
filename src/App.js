import React from "react";
import { AuthProvider } from "./contexts/AuthContext";
import AppRoutes from "./routes/Routes";
import { ToastProvider } from "./components/ToastContext";

function App() {
  return (
      <AuthProvider>
          <ToastProvider>
        <AppRoutes />
          </ToastProvider>
      </AuthProvider>
  );
}

export default App;
