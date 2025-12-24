import { Elysia } from "elysia";
import { EmailRoutes } from "./email";
import { IdentitiesRoutes } from "./identities";
import { ProfileRoutes } from "./profile";

export const MeRoutes = new Elysia({
	prefix: "/me",
})
	.use(ProfileRoutes)
	.use(IdentitiesRoutes)
	.use(EmailRoutes);
