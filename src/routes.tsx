import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import HomePage from "./pages/Home";
import ShopCakes from "./pages/ShopCakes";
import useCurrentUser from "./hooks/useCurrentUser";
import PageLoader from "./components/PageLoader";

// ProtectedRoute component to guard routes that require authentication
const ProtectedRoute = () => {
  const { user, status } = useCurrentUser();

  if (status === "loading" || status === "idle" || status === "pending") {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/admin/login" />;
  }

  return <Outlet />;
};

// Main AppRoutes component that defines the routing structure
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/shop" element={<ShopCakes />} />

      {/* <Route path="/admin/login" element={<AdminLogin />} /> */}
      <Route element={<ProtectedRoute />}>
        {/* <Route path="/admin/dashboard" element={<AdminPage />} /> */}
      </Route>
    </Routes>
  );
};

export default AppRoutes;
