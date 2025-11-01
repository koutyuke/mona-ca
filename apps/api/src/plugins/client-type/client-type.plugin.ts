import { Elysia, t } from "elysia";
import { clientTypeSchema, newClientType } from "../../core/domain/value-objects";
import { CLIENT_TYPE_HEADER_NAME } from "../../core/lib/http";

export const clientTypePlugin = () =>
	new Elysia({
		name: "@mona-ca/client-type",
	})
		.guard({
			schema: "standalone",
			headers: t.Object({
				[CLIENT_TYPE_HEADER_NAME]: clientTypeSchema,
			}),
		})
		.resolve(({ headers: { [CLIENT_TYPE_HEADER_NAME]: rawClientType } }) => {
			return {
				clientType: newClientType(rawClientType),
			};
		})
		.as("scoped");
