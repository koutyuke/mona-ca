import { t } from "elysia";
import { oAuthProviderSchema } from "./provider";

const OAuthAccountSchema = t.Object({
	provider: oAuthProviderSchema,
	providerId: t.String(),
	userId: t.String(),
	createdAt: t.Date(),
	updatedAt: t.Date(),
});

export { OAuthAccountSchema };
