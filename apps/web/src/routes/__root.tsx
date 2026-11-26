import { createRootRoute, redirect } from "@tanstack/react-router";
import { AuthScreen } from "../auth/AuthScreen";
import { readSession } from "../auth/session";
import { AppShell } from "../shell/AppShell";
import { usePath } from "../shell/nav";
import { normalizePath } from "../shell/pages";

const isAuthPath = (path: string) => path === "/login" || path === "/signup";

export const Route = createRootRoute({
  beforeLoad: ({ location }) => {
    const path = normalizePath(location.pathname);
    if (!readSession() && !isAuthPath(path)) throw redirect({ to: "/login", search: { redirect: path }, replace: true });
    if (readSession() && isAuthPath(path)) throw redirect({ to: "/", replace: true });
  },
  component: Root,
  notFoundComponent: () => null,
});

// No <Outlet>: AppShell renders every open page itself, so hidden pages keep their state.
function Root() {
  const path = usePath();
  if (isAuthPath(path)) return <AuthScreen key={path} mode={path === "/signup" ? "signup" : "login"} />;
  return readSession() ? <AppShell /> : null;
}
