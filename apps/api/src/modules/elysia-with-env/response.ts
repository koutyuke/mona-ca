import { t } from "elysia";

export const NoContentResponse = new Response(null, { status: 204 }) as unknown as null;

export const NoContentResponseSchema = t.Null();
