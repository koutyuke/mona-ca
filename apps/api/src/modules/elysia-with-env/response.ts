import { t } from "elysia";

export const NoContentResponse = () => new Response(null, { status: 204 }) as unknown as null;

export const NoContentResponseSchema = t.Null();

export const RedirectResponse = (url: string, status: 302 | 301 | 303 | 307 | 308 = 302) =>
	new Response(null, { status, headers: { location: url } }) as unknown as null;

export const RedirectResponseSchema = t.Null();
