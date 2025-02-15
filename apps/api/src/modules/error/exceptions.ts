class ResponseException extends Error {
	constructor(
		name: string,
		message: string,
		public code: string,
		public status: number,
	) {
		super(message);
		this.name = name;
	}
}

class BadRequestException extends ResponseException {
	constructor(option?: { name?: string; message?: string; code?: string }) {
		const { name, message, code } = option ?? {};
		super(
			name ?? "BAD_REQUEST",
			message ?? "The request is invalid. Please check the data you've entered.",
			code ?? name ?? "BAD_REQUEST",
			400,
		);
	}
}

class UnauthorizedException extends ResponseException {
	constructor(option?: { name?: string; message?: string; code?: string }) {
		const { name, message, code } = option ?? {};
		super(
			name ?? "UNAUTHORIZED",
			message ?? "You are not authorized to access this resource.",
			code ?? name ?? "UNAUTHORIZED",
			401,
		);
	}
}

class ForbiddenException extends ResponseException {
	constructor(option?: { name?: string; message?: string; code?: string }) {
		const { name, message, code } = option ?? {};
		super(
			name ?? "FORBIDDEN",
			message ?? "You are not allowed to access this resource. Please check your permissions.",
			code ?? name ?? "FORBIDDEN",
			403,
		);
	}
}

class MethodNotAllowedException extends ResponseException {
	constructor(option?: { name?: string; message?: string; code?: string }) {
		const { name, message, code } = option ?? {};
		super(
			name ?? "METHOD_NOT_ALLOWED",
			message ?? "The HTTP method is not allowed. Please check the request method.",
			code ?? name ?? "METHOD_NOT_ALLOWED",
			405,
		);
	}
}

class ConflictException extends ResponseException {
	constructor(option?: { name?: string; message?: string; code?: string }) {
		const { name, message, code } = option ?? {};
		super(
			name ?? "CONFLICT",
			message ?? "The request could not be completed due to a conflict with the current state of the target resource.",
			code ?? name ?? "CONFLICT",
			409,
		);
	}
}

class ImATeapotException extends ResponseException {
	constructor(option?: { name?: string; message?: string; code?: string }) {
		const { name, message, code } = option ?? {};
		super(
			name ?? "IM_A_TEAPOT",
			message ?? "I'm a teapot. This request cannot be handled by a coffee pot.",
			code ?? name ?? "IM_A_TEAPOT",
			418,
		);
	}
}

class TooManyRequestsException extends ResponseException {
	constructor(
		public readonly reset: number,
		option?: { name?: string; message?: string; code?: string },
	) {
		const { name, message, code } = option ?? {};
		super(
			name ?? "TOO_MANY_REQUESTS",
			message ?? "You have sent too many requests in a given amount of time.",
			code ?? name ?? "TOO_MANY_REQUESTS",
			429,
		);
	}
}

class InternalServerErrorException extends ResponseException {
	constructor(option?: { name?: string; message?: string; code?: string }) {
		const { name, message, code } = option ?? {};
		super(
			name ?? "INTERNAL_SERVER_ERROR",
			message ?? "An unexpected error occurred. Please try again later.",
			code ?? name ?? "INTERNAL_SERVER_ERROR",
			500,
		);
	}
}

class BadGatewayException extends ResponseException {
	constructor(option?: { name?: string; message?: string; code?: string }) {
		const { name, message, code } = option ?? {};
		super(
			name ?? "BAD_GATEWAY",
			message ?? "The server received an invalid response from an upstream server.",
			code ?? name ?? "BAD_GATEWAY",
			502,
		);
	}
}

class ServiceUnavailableException extends ResponseException {
	constructor(option?: { name?: string; message?: string; code?: string }) {
		const { name, message, code } = option ?? {};
		super(
			name ?? "SERVICE_UNAVAILABLE",
			message ?? "The server is currently unavailable. Please try again later.",
			code ?? name ?? "SERVICE_UNAVAILABLE",
			503,
		);
	}
}

export {
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
};
