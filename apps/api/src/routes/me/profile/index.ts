import { Elysia } from "elysia";
import { ProfileGetRoute } from "./get.route";
import { ProfileUpdateRoute } from "./update.route";

export const ProfileRoutes = new Elysia({
	prefix: "/",
})
	.use(ProfileGetRoute)
	.use(ProfileUpdateRoute);
