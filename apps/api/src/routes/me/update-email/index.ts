import { Elysia } from "elysia";
import { UpdateEmailConfirm } from "./update-email-confirm";
import { UpdateEmailRequest } from "./update-email-request";

export const UpdateEmailRoutes = new Elysia({
	prefix: "/email",
})
	.use(UpdateEmailConfirm)
	.use(UpdateEmailRequest);
