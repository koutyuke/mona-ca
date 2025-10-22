import Elysia, { t } from "elysia";
import { getIP } from "../../shared/lib/http";
import { di } from "../di";
import { ErrorResponseSchema } from "../elysia-with-env";
import { BadRequestException } from "../error";

/**
 * Initializes a new instance of the ElysiaWithEnv class with the captcha plugin.
 * The plugin is scoped and provides a captcha verification method.
 *
 * @throws {BadRequestException} If the IP address is not found or verification fails.
 */
export const captcha = new Elysia({
	name: "@mona-ca/captcha",
})
	.use(di())
	.derive({ as: "scoped" }, async ({ request, containers }) => {
		const ip = getIP(request.headers);

		if (!ip) {
			throw new BadRequestException({
				name: "IP_ADDRESS_NOT_FOUND",
				message: "IP address not found",
			});
		}

		const verify = async (token: string) => {
			const { success } = await containers.core.turnstileGateway.verify(token, ip);

			if (!success) {
				throw new BadRequestException({
					name: "CAPTCHA_VERIFICATION_FAILED",
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

export const CaptchaSchema = {
	response: {
		400: t.Union([ErrorResponseSchema("IP_ADDRESS_NOT_FOUND"), ErrorResponseSchema("CAPTCHA_VERIFICATION_FAILED")]),
	},
};
