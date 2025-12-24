import { Elysia } from "elysia";
import { IdentitiesFederatedRoutes } from "./federated";
import { IdentitiesUpdatePasswordRoute } from "./update.route";
import { UserIdentitiesRoute } from "./user-identities.route";

export const IdentitiesRoutes = new Elysia({
	prefix: "/identities",
})
	.use(UserIdentitiesRoute)
	.use(IdentitiesUpdatePasswordRoute)
	.use(IdentitiesFederatedRoutes);
