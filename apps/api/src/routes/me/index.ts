import { Elysia } from "elysia";
import { GetAccountConnections } from "./get-account-connections";
import { GetProfile } from "./get-profile";
import { UnlinkAccountConnection } from "./unlink-account-connection";
import { UpdateEmail } from "./update-email";
import { UpdatePassword } from "./update-password";
import { UpdateProfile } from "./update-profile";

export const Me = new Elysia({
	prefix: "/users/@me",
})
	.use(GetProfile)
	.use(UpdateEmail)
	.use(UpdateProfile)
	.use(UpdatePassword)
	.use(UnlinkAccountConnection)
	.use(GetAccountConnections);
