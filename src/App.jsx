import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#1e293b",
              color: "#f1f5f9",
              border: "1px solid #334155",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#f59e0b", secondary: "#0f172a" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#0f172a" } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
