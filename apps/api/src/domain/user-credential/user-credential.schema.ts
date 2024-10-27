import { t } from "elysia";

export const UserCredentialSchema = t.Object({
	userId: t.String(),
	passwordHash: t.Union([t.String(), t.Null()]),
	createdAt: t.Date(),
	updatedAt: t.Date(),
});
