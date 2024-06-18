import Elysia from "elysia";
import {
	BadGatewayException,
	BadRequestException,
	ConflictException,
	ForbiddenException,
	ImATeapotException,
	InternalServerErrorException,
	MethodNotAllowedException,
	NotImplementedException,
	ServiceUnavailableException,
	UnauthorizedException,
} from "./exceptions";

/**
 * 400 - Bad Request
 * BadRequestException
 *
 * 401 - Unauthorized
 * UnauthorizedException
 *
 * 403 - Forbidden
 * ForbiddenException
 *
 * 404 - Not Found
 * Elysia handles this by default
 *
 * 405 - Method Not Allowed
 * MethodNotAllowedException
 *
 * 409 - Conflict
 * ConflictException
 *
 * 418 - I'm a teapot
 * ImATeapotException
 *
 * 500 - Internal Server Error
 * InternalServerErrorException
 *
 * 501 - Not Implemented
 * NotImplementedException
 *
 * 502 - Bad Gateway
 * BadGatewayException
 *
 * 503 - Service Unavailable
 * ServiceUnavailableException
 */

const error = new Elysia({
	name: "@mona-ca/elysia-error",
})
	.error({
		BadGatewayException,
		BadRequestException,
		ConflictException,
		ForbiddenException,
		ImATeapotException,
		InternalServerErrorException,
		MethodNotAllowedException,
		NotImplementedException,
		ServiceUnavailableException,
		UnauthorizedException,
	})
	.onError({ as: "global" }, ctx => {
		const { code, error } = ctx;

		if (code !== "NOT_FOUND") {
			console.error({
				name: error.name,
				message: error.message,
			});
		}

		return error;
	});

export { error };
