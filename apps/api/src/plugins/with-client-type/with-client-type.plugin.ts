import { Value } from "@sinclair/typebox/value";
import { Elysia, t } from "elysia";
import { type ClientType, clientTypeSchema, newClientType } from "../../shared/domain/value-objects";
import { BadRequestException, ErrorResponseSchema } from "../../shared/infra/elysia";
import { CLIENT_TYPE_HEADER_NAME } from "../../shared/lib/http";

export const withClientType = new Elysia({
	name: "@mona-ca/with-client-type",
}).derive({ as: "scoped" }, ({ headers }): { clientType: ClientType } => {
	const clientType = headers[CLIENT_TYPE_HEADER_NAME];

	if (!clientType || !Value.Check(clientTypeSchema, clientType)) {
		throw new BadRequestException({
			name: "INVALID_CLIENT_TYPE",
			message: "Invalid client type.",
		});
	}

	return {
		clientType: newClientType(clientType),
	};
});

export const WithClientTypeSchema = {
	headers: t.Object(
		{
			[CLIENT_TYPE_HEADER_NAME]: clientTypeSchema,
		},
		{
			additionalProperties: true,
		},
	),
	response: {
		400: ErrorResponseSchema("INVALID_CLIENT_TYPE"),
	},
};
