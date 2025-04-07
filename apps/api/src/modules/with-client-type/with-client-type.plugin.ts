import { Value } from "@sinclair/typebox/value";
import { Elysia, t } from "elysia";
import { CLIENT_TYPE_HEADER_NAME } from "../../common/constants";
import { type ClientType, clientTypeSchema, newClientType } from "../../domain/value-object";
import { BadRequestException, ErrorResponseSchema } from "../error";

export const withClientType = new Elysia({
	name: "@mona-ca/with-client-type",
}).derive({ as: "scoped" }, ({ headers }): { clientType: ClientType } => {
	const clientType = headers[CLIENT_TYPE_HEADER_NAME];

	if (!clientType) {
		throw new BadRequestException({
			name: "CLIENT_TYPE_HEADER_NOT_FOUND",
			message: "Client type header not found.",
		});
	}

	if (!Value.Check(clientTypeSchema, clientType)) {
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
	header: t.Object({
		[CLIENT_TYPE_HEADER_NAME]: clientTypeSchema,
	}),
	response: {
		400: t.Union([ErrorResponseSchema("CLIENT_TYPE_HEADER_NOT_FOUND"), ErrorResponseSchema("INVALID_CLIENT_TYPE")]),
	},
};
