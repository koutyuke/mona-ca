export type StatusCode =
	| 200
	| 201
	| 202
	| 204
	| 301
	| 302
	| 303
	| 304
	| 307
	| 308
	| 400
	| 401
	| 403
	| 404
	| 405
	| 409
	| 410
	| 412
	| 413
	| 414
	| 415
	| 416
	| 417
	| 418
	| 422
	| 429
	| 500
	| 502
	| 503
	| 504;

// Return Response
export const NoContentResponse = () => new Response(null, { status: 204 }) as unknown as null;

export const RedirectResponse = (url: string, status: 302 | 301 | 303 | 307 | 308 = 302) =>
	new Response(null, { status, headers: { location: url } }) as unknown as null;
