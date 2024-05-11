import { Elysia } from "elysia";

const app = new Elysia({ aot: false }).get("/", () => "Hello Elysia");

export default app;
