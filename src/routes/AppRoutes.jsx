import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import VehiclesPage from "../pages/vehicles/VehiclesPage";
import PartiesPage from "../pages/parties/PartiesPage";
import PartnersPage from "../pages/partners/PartnersPage";
import RidesPage from "../pages/rides/RidesPage";
import RideDetailPage from "../pages/rides/RideDetailPage";
import InvoicesPage from "../pages/invoices/InvoicesPage";
import CompanyExpensesPage from "../pages/company-expenses/CompanyExpensesPage";
import ExpenseCategoriesPage from "../pages/expense-categories/ExpenseCategoriesPage";
import MainLayout from "../components/layout/MainLayout";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/rides" element={<RidesPage />} />
        <Route path="/rides/:id" element={<RideDetailPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/vehicles" element={<VehiclesPage />} />
        <Route path="/parties" element={<PartiesPage />} />
        <Route path="/partners" element={<PartnersPage />} />
        <Route path="/company-expenses" element={<CompanyExpensesPage />} />
        <Route path="/expense-categories" element={<ExpenseCategoriesPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}