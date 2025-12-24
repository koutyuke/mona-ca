import { Elysia } from "elysia";
import { IdentitiesUpdatePasswordRoute } from "./update.route";
import { UserIdentitiesRoute } from "./user-identities.route";

export const IdentitiesRoutes = new Elysia({
	prefix: "/identities",
})
	.use(UserIdentitiesRoute)
	.use(IdentitiesUpdatePasswordRoute);
