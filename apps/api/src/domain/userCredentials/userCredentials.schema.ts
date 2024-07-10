import { t } from "elysia";

export const UserCredentialsSchema = t.Object({
	userId: t.String(),
	hashedPassword: t.Union([t.String(), t.Null()]),
});
