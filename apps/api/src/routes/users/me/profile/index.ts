import { Elysia } from "elysia";
import { ProfileGetRoute } from "./get.route";
import { ProfileUpdateRoute } from "./update.route";

export const ProfileRoutes = new Elysia().use(ProfileGetRoute).use(ProfileUpdateRoute);
