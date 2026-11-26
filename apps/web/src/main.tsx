import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { MotionConfig, useReducedMotion } from "motion/react";
import { readSession } from "./auth/session";
import { routeTree } from "./routeTree.gen";
import "./styles.css";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// A page restored from the back/forward cache must not show data after logout.
addEventListener("pageshow", (event) => {
  if (event.persisted && !readSession()) location.reload();
});

// Shared timing for every Motion animation; none for users who ask for reduced motion.
function App() {
  const reduced = useReducedMotion();
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: reduced ? 0 : 0.18, ease: "easeOut" }}>
      <RouterProvider router={router} />
    </MotionConfig>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
