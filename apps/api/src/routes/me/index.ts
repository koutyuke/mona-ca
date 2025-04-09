import { ElysiaWithEnv } from "../../modules/elysia-with-env";
import { GetProfile } from "./get-profile";
import { UpdateEmail } from "./update-email";
import { UpdatePassword } from "./update-password";
import { UpdateProfile } from "./update-profile";

export const Me = new ElysiaWithEnv({
	prefix: "/users/@me",
})
	.use(GetProfile)
	.use(UpdateEmail)
	.use(UpdateProfile)
	.use(UpdatePassword);
