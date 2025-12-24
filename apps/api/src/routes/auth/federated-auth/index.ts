import { Elysia } from "elysia";
import { FederatedAuthCallbackRoute } from "./callback.route";
import { FederatedAuthRequestRoute } from "./request.route";

export const FederatedAuthRoutes = new Elysia({
	prefix: "/federated",
})
	.use(FederatedAuthRequestRoute)
	.use(FederatedAuthCallbackRoute);
