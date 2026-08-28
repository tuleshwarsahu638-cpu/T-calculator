import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import React from "react";
import { CalculatorProvider } from "./context/CalculatorContext";
import { SettingsProvider } from "./context/SettingsContext";
import { ThumbLayerSettingsProvider } from "./context/ThumbLayerSettingsContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { MaintenanceScreen } from "./components/MaintenanceScreen";
import { UpdateBanner } from "./components/UpdateBanner";
import { useFeatureFlags } from "./hooks/useFeatureFlags";
import CalculatorPage from "./pages/CalculatorPage";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: CalculatorPage,
});

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app",
  component: CalculatorPage,
});

const routeTree = rootRoute.addChildren([indexRoute, appRoute]);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  const { flags } = useFeatureFlags();
  const adminUnlocked =
    typeof window !== "undefined" &&
    sessionStorage.getItem("adminSessionBypass") === "1";

  if (flags.maintenanceMode && !adminUnlocked) {
    return <MaintenanceScreen message={flags.maintenanceMessage} />;
  }

  return (
    <ErrorBoundary>
      <SettingsProvider>
        <ThumbLayerSettingsProvider>
          <CalculatorProvider>
            <UpdateBanner />
            <RouterProvider router={router} />
          </CalculatorProvider>
        </ThumbLayerSettingsProvider>
      </SettingsProvider>
    </ErrorBoundary>
  );
}
