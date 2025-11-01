import { Elysia } from "elysia";
import { ConnectionsRoutes } from "./connections";
import { GetProfile } from "./get-profile";
import { UpdateEmailRoutes } from "./update-email";
import { UpdatePassword } from "./update-password";
import { UpdateProfile } from "./update-profile";

export const MeRoutes = new Elysia({
	prefix: "/users/@me",
})
	.use(GetProfile)
	.use(UpdateProfile)
	.use(UpdatePassword)
	.use(ConnectionsRoutes)
	.use(UpdateEmailRoutes);
