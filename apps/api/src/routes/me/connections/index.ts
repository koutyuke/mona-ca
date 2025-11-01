import Elysia from "elysia";
import { GetAccountConnections } from "./get-account-connections";
import { UnlinkAccountConnection } from "./unlink-account-connection";

export const ConnectionsRoutes = new Elysia({
	prefix: "/connections",
})
	.use(GetAccountConnections)
	.use(UnlinkAccountConnection);
