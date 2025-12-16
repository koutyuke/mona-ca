import { Elysia } from "elysia";
import { PasswordUpdateRoute } from "./update.route";

export const PasswordRoutes = new Elysia({
	prefix: "/password",
}).use(PasswordUpdateRoute);
