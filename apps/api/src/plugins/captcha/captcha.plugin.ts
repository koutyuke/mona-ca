import Elysia, { t } from "elysia";
import { containerPlugin } from "../container";
import { ipAddressPlugin } from "../ip-address";

/**
 * Initializes a new instance of the ElysiaWithEnv class with the captcha plugin.
 * The plugin is scoped and provides a captcha verification method.
 *
 * @throws {BadRequestException} If the IP address is not found or verification fails.
 */
export const captchaPlugin = () =>
	new Elysia({
		name: "@mona-ca/captcha",
	})
		.use(ipAddressPlugin())
		.use(containerPlugin())
		.guard({
			schema: "standalone",
			body: t.Object({
				cfTurnstileResponse: t.String(),
			}),
		})
		.onBeforeHandle(async ({ body: { cfTurnstileResponse }, containers, status, ipAddress }) => {
			const { success } = await containers.core.turnstileGateway.verify(cfTurnstileResponse, ipAddress);
			if (!success) {
				return status("Bad Request", {
					code: "CAPTCHA_VERIFICATION_FAILED" as const,
					message: "Verification failed.",
				});
			}
			return;
		})
		.as("scoped");
