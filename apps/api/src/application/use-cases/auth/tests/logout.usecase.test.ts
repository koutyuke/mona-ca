import { beforeEach, describe, expect, it } from "vitest";
import { ulid } from "../../../../common/utils";
import { createSession } from "../../../../domain/entities";
import { newSessionId, newUserId } from "../../../../domain/value-object";
import { SessionSecretServiceMock } from "../../../../tests/mocks";
import { SessionRepositoryMock } from "../../../../tests/mocks/repositories/session.repository.mock";
import { createSessionsMap } from "../../../../tests/mocks/repositories/table-maps";
import type { ILogoutUseCase } from "../interfaces/logout.usecase.interface";
import { LogoutUseCase } from "../logout.usecase";

describe("LogoutUseCase", () => {
	let logoutUseCase: ILogoutUseCase;
	let sessionRepositoryMock: SessionRepositoryMock;
	let sessionSecretServiceMock: SessionSecretServiceMock;

	beforeEach(() => {
		const sessionMap = createSessionsMap();

		sessionRepositoryMock = new SessionRepositoryMock({
			sessionMap,
		});

		logoutUseCase = new LogoutUseCase(sessionRepositoryMock);
		sessionSecretServiceMock = new SessionSecretServiceMock();
	});

	it("should delete the session on logout", async () => {
		const sessionId = newSessionId(ulid());
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const sessionSecretHash = sessionSecretServiceMock.hashSessionSecret(sessionSecret);

		const session = createSession({
			id: sessionId,
			userId: newUserId(ulid()),
			secretHash: sessionSecretHash,
		});

		sessionRepositoryMock.sessionMap.set(sessionId, session);

		expect(sessionRepositoryMock.sessionMap.has(sessionId)).toBe(true);

		await logoutUseCase.execute(sessionId);

		expect(sessionRepositoryMock.sessionMap.has(sessionId)).toBe(false);
	});

	it("should not throw error when trying to delete non-existent session", async () => {
		const sessionId = newSessionId(ulid());

		expect(sessionRepositoryMock.sessionMap.has(sessionId)).toBe(false);

		await expect(logoutUseCase.execute(sessionId)).resolves.not.toThrow();
	});
});
