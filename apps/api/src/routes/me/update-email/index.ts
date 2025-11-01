import { Elysia } from "elysia";
import { UpdateEmail } from "./update-email";

export const UpdateEmailRoutes = new Elysia({
	prefix: "/email",
}).use(UpdateEmail);
