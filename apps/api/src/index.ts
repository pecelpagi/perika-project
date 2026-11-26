import { serve } from "@hono/node-server";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { HELLO_MESSAGE, type HelloResponse } from "@perika/shared";
import { Scalar } from "@scalar/hono-api-reference";

const app = new OpenAPIHono();

const helloRoute = createRoute({
  method: "get",
  path: "/api/hello",
  summary: "Say hello",
  responses: {
    200: {
      description: "Greeting message",
      content: {
        "application/json": {
          schema: z.object({ message: z.string().openapi({ example: HELLO_MESSAGE }) }),
        },
      },
    },
  },
});

app.openapi(helloRoute, (c) => c.json({ message: HELLO_MESSAGE } satisfies HelloResponse, 200));

app.doc("/api/openapi.json", {
  openapi: "3.0.0",
  info: { title: "Perika API", version: "0.0.0" },
});

app.get("/api/docs", Scalar({ url: "/api/openapi.json", pageTitle: "Perika API" }));

serve({ fetch: app.fetch, port: 3000 }, ({ port }) => {
  console.log(`API listening on http://localhost:${port}`);
  console.log(`API docs at http://localhost:${port}/api/docs`);
});
