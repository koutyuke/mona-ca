import { Elysia } from "elysia";
import { env } from "../../core/infra/config/env";
import { DEVELOPMENT_IP_ADDRESS, getIP } from "../../core/lib/http";

export const ipAddressPlugin = () =>
	new Elysia({
		name: "@mona-ca/ip-address",
	}).derive({ as: "global" }, ({ request, status }) => {
		const ipAddress = getIP(request.headers) ?? (env.APP_ENV === "production" ? null : DEVELOPMENT_IP_ADDRESS);
		if (!ipAddress) {
			return status("Bad Request", {
				code: "IP_ADDRESS_NOT_FOUND" as const,
				message: "IP address not found",
			});
		}
		return { ipAddress };
	});
