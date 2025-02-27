import { getIP } from "../../common/utils";
import { TurnstileGateway } from "../../interface-adapter/gateway/turnstile";
import { ElysiaWithEnv } from "../elysia-with-env";
import { BadRequestException } from "../error";

/**
 * Initializes a new instance of the ElysiaWithEnv class with the captcha plugin.
 * The plugin is scoped and provides a captcha verification method.
 *
 * @throws {BadRequestException} If the IP address is not found or verification fails.
 */
const captcha = new ElysiaWithEnv({
	name: "@mona-ca/captcha",
}).derive({ as: "scoped" }, async ({ request, env: { CF_TURNSTILE_SECRET } }) => {
	const ip = getIP(request.headers);

	if (!ip) {
		throw new BadRequestException({
			message: "IP address not found",
		});
	}

	const turnstileGateway = new TurnstileGateway(CF_TURNSTILE_SECRET);

	const verify = async (token: string) => {
		const { success } = await turnstileGateway.verify(token, ip);

		if (!success) {
			throw new BadRequestException({
				message: "Verification failed.",
			});
		}
	};

	return {
		captcha: {
			verify,
		},
	};
});

export { captcha };
