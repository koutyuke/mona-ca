import { Elysia } from "elysia";
import { UpdateEmailRequestRoute } from "./request.route";
import { UpdateEmailVerifyRoute } from "./verify.route";

export const EmailRoutes = new Elysia({
	prefix: "/email",
})
	.use(UpdateEmailRequestRoute)
	.use(UpdateEmailVerifyRoute);
