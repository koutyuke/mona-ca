import Elysia from "elysia";
import {
	BadGatewayException,
	BadRequestException,
	ConflictException,
	ForbiddenException,
	ImATeapotException,
	InternalServerErrorException,
	MethodNotAllowedException,
	ResponseException,
	ServiceUnavailableException,
	TooManyRequestsException,
	UnauthorizedException,
} from "./exceptions";

/**
 * Initializes an Elysia error handling plugin with the specified error handling configuration.
 *
 * 400 - Bad Request: BadRequestException
 *
 * 401 - Unauthorized: UnauthorizedException
 *
 * 403 - Forbidden: ForbiddenException
 *
 * 404 - Not Found: Elysia handles this by default
 *
 * 405 - Method Not Allowed: MethodNotAllowedException
 *
 * 409 - Conflict: ConflictException
 *
 * 418 - I'm a teapot: ImATeapotException
 *
 * 429 - Too Many Requests: TooManyRequestsException
 *
 * 500 - Internal Server Error: InternalServerErrorException
 *
 * 502 - Bad Gateway: BadGatewayException
 *
 * 503 - Service Unavailable: ServiceUnavailableException
 *
 * @example
 * const error = new Elysia({
 *   name: "@mona-ca/error",
 * })
 * .error({
 *   BadGatewayException,
 *   BadRequestException,
 *   ConflictException,
 *   ForbiddenException,
 *   ImATeapotException,
 *   InternalServerErrorException,
 *   MethodNotAllowedException,
 *   ServiceUnavailableException,
 *   UnauthorizedException,
 * })
 * .onError({ as: "global" }, ctx => {
 *   const { code, error, set } = ctx;
 *
 *   console.log(ctx);
 *
 *   if (error instanceof ResponseException) {
 *     set.status = error.status;
 *     return {
 *       error: error.code,
 *       message: error.message,
 *     };
 *   }
 *
 *   return error;
 * });
 */
const error = new Elysia({
	name: "@mona-ca/error",
})
	.error({
		ResponseException,
		BadRequestException,
		UnauthorizedException,
		ForbiddenException,
		MethodNotAllowedException,
		ConflictException,
		ImATeapotException,
		TooManyRequestsException,
		InternalServerErrorException,
		BadGatewayException,
		ServiceUnavailableException,
	})
	.onError({ as: "global" }, ({ code, error, set }) => {
		if (error instanceof TooManyRequestsException) {
			set.status = error.status;
			set.headers = {
				"x-ratelimit-reset": error.reset,
			};
			return {
				code: error.code,
				message: error.message,
			};
		}

		if (error instanceof ResponseException) {
			set.status = error.status;
			return {
				error: error.code,
				message: error.message,
			};
		}

		switch (code) {
			case "NOT_FOUND":
				set.status = 404;
				return {
					error: "NOT_FOUND",
					message: "The requested resource was not found.",
				};
			case "VALIDATION":
				set.status = 400;
				console.error(error.message);

				return {
					error: "VALIDATION",
					message: JSON.parse(error.message).summary.replace("  ", " "),
				};
		}

		console.error(error);

		set.status = 500;
		return {
			error: "INTERNAL_SERVER_ERROR",
			name: error.toString(),
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			cause: (error as any).cause ?? null,
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			stack: (error as any).stack ?? null,
		};
	});

export { error };
