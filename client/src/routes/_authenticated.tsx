import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "../store/authStore";
import AuthenticatedLayout from "../components/layout/AuthenticatedLayout";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const { isAuthenticated } = useAuthStore.getState();

    if (!isAuthenticated) {
      throw redirect({
        to: "/login",
      });
    }
  },
  component: AuthenticatedLayout,
});
