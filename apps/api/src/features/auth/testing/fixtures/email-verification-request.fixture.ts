import { newUserId } from "../../../../core/domain/value-objects";
import { ulid } from "../../../../core/lib/id";
import { TokenSecretServiceMock } from "../../../../core/testing/mocks/system";
import { emailVerificationRequestExpiresSpan } from "../../domain/entities/email-verification-request";
import { newEmailVerificationRequestId } from "../../domain/value-objects/ids";
import { encodeToken } from "../../domain/value-objects/tokens";

import type { EmailVerificationRequest } from "../../domain/entities/email-verification-request";
import type { EmailVerificationRequestToken } from "../../domain/value-objects/tokens";

const tokenSecretService = new TokenSecretServiceMock();

export const createEmailVerificationRequestFixture = (override?: {
	secretHasher?: (secret: string) => Uint8Array;
	emailVerificationRequest?: Partial<EmailVerificationRequest>;
	emailVerificationSecret?: string;
}): {
	emailVerificationRequest: EmailVerificationRequest;
	emailVerificationRequestSecret: string;
	emailVerificationRequestToken: EmailVerificationRequestToken;
} => {
	const secretHasher = override?.secretHasher ?? tokenSecretService.hash;

	const emailVerificationRequestSecret = override?.emailVerificationSecret ?? "emailVerificationRequestSecret";
	const secretHash = secretHasher(emailVerificationRequestSecret);

	const expiresAt = new Date(
		override?.emailVerificationRequest?.expiresAt?.getTime() ??
			Date.now() + emailVerificationRequestExpiresSpan.milliseconds(),
	);
	expiresAt.setMilliseconds(0);

	const request: EmailVerificationRequest = {
		id: newEmailVerificationRequestId(ulid()),
		email: "test.email@example.com",
		userId: newUserId(ulid()),
		code: "testCode",
		secretHash: secretHash,
		expiresAt,
		...override?.emailVerificationRequest,
	} satisfies EmailVerificationRequest;

	return {
		emailVerificationRequest: request,
		emailVerificationRequestSecret: emailVerificationRequestSecret,
		emailVerificationRequestToken: encodeToken(request.id, emailVerificationRequestSecret),
	};
};
