import { createFileRoute } from "@tanstack/react-router";
import HomeComponents from "../pages/HomeComponent";

export const Route = createFileRoute("/")({
  component: HomeComponents,
});
