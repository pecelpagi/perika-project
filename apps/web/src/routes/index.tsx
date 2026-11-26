import type { HelloResponse } from "@perika/shared";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch("/api/hello")
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json() as Promise<HelloResponse>;
      })
      .then((data) => setMessage(data.message))
      .catch((error: Error) => setMessage(error.message));
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950">
      <h1 className="text-4xl font-bold text-white">{message}</h1>
    </main>
  );
}
