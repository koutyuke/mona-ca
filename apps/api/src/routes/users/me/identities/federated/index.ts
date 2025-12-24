import Elysia from "elysia";
import { ProviderLinkCallback } from "./callback.route";
import { ProviderLinkPrepareRoute } from "./prepare.route";
import { ProviderLinkRequestRoute } from "./request.route";
import { UnlinkFederatedIdentity } from "./unlink.route";

export const IdentitiesFederatedRoutes = new Elysia({
	prefix: "/federated",
})
	.use(ProviderLinkPrepareRoute)
	.use(ProviderLinkRequestRoute)
	.use(ProviderLinkCallback)
	.use(UnlinkFederatedIdentity);
