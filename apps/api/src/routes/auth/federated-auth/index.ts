import { Elysia } from "elysia";
import { FederatedAuthCallback } from "./callback";
import { FederatedAuthRequest } from "./request";

export const FederatedAuthRoutes = new Elysia({
	prefix: "/federated",
})
	.use(FederatedAuthRequest)
	.use(FederatedAuthCallback);
