import { describe, expect, it } from "vitest";
import type { ILogoutUseCase } from "../../../../../../application/ports/in";
import { createSessionFixture } from "../../../../../../tests/fixtures";
import { SessionRepositoryMock } from "../../../../../../tests/mocks";
import { createSessionsMap } from "../../../../../../tests/mocks";
import { LogoutUseCase } from "../logout.usecase";

const sessionMap = createSessionsMap();

const sessionRepository = new SessionRepositoryMock({
	sessionMap,
});

const logoutUseCase: ILogoutUseCase = new LogoutUseCase(sessionRepository);

describe("LogoutUseCase", () => {
	it("should delete the session on logout", async () => {
		const { session } = createSessionFixture();

		sessionMap.set(session.id, session);

		expect(sessionMap.has(session.id)).toBe(true);

		await logoutUseCase.execute(session.id);

		expect(sessionMap.has(session.id)).toBe(false);
	});

	it("should not throw error when trying to delete non-existent session", async () => {
		const { session } = createSessionFixture();

		expect(sessionMap.has(session.id)).toBe(false);

		await expect(logoutUseCase.execute(session.id)).resolves.not.toThrow();
	});
});
