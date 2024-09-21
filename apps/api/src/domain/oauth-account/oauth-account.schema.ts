import { oAuthProviderSchema } from "@/infrastructure/oauth-provider";
import { t } from "elysia";

const OAuthAccountSchema = t.Object({
	provider: oAuthProviderSchema,
	providerId: t.String(),
	userId: t.String(),
	createdAt: t.Date(),
	updatedAt: t.Date(),
});

export { OAuthAccountSchema };
