import { serve } from "@hono/node-server";
import { Hono } from "hono";
import parking from "./handlers/parking.handler.js";
import auth from "./handlers/auth.handler.js";
import profile from "./handlers/profile.handler.js";
import { handle } from "@hono/node-server/vercel";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

const v1 = new Hono();

app.route("/auth", auth);

//protected routes
v1.route("/parking", parking);
v1.route("/profile", profile);

app.route("/api/v1", v1);

serve(
  {
    fetch: app.fetch,
    port: 3001,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

export default handle(app);
