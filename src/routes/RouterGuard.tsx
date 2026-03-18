import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { routesConfig } from "./routesConfig";
import { RequireAdmin } from "./ProtectedRoute";
import { ROUTES } from "./routeConstants";
import { isAdminAuthenticated } from "../lib/adminAuth";

const RouterGuard = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>

        <Route path="/" element={<Navigate to={ROUTES.ADMIN_LOGIN} replace />} />

        {routesConfig.public.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}

        <Route element={<RequireAdmin />}>
          {routesConfig.admin.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>

        {routesConfig.candidate.agreed.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}

        {routesConfig.candidate.submitted.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}

      </Routes>
    </Suspense>
  );
};

export default RouterGuard;