import { Elysia } from "elysia";
import { MeRoutes } from "./me";

export const UsersRoutes = new Elysia({
	prefix: "/users",
}).use(MeRoutes);
