import { describe, expect, it } from "vitest";
import { createSessionFixture } from "../../../../testing/fixtures";
import { SessionRepositoryMock, createSessionsMap } from "../../../../testing/mocks/repositories";
import { LogoutUseCase } from "../logout.usecase";

const sessionMap = createSessionsMap();

const sessionRepository = new SessionRepositoryMock({
	sessionMap,
});

const logoutUseCase = new LogoutUseCase(sessionRepository);

describe("LogoutUseCase", () => {
	it("Success: should delete the session on logout", async () => {
		const { session } = createSessionFixture();

		sessionMap.set(session.id, session);
		expect(sessionMap.has(session.id)).toBe(true);

		await logoutUseCase.execute(session.id);

		// セッションが削除されていること
		expect(sessionMap.has(session.id)).toBe(false);
		expect(sessionMap.size).toBe(0);
	});

	it("Success: should complete without error when trying to delete non-existent session", async () => {
		const { session } = createSessionFixture();

		expect(sessionMap.has(session.id)).toBe(false);

		// 存在しないセッションの削除でもエラーが発生しないこと（べき等性）
		await logoutUseCase.execute(session.id);
		expect(sessionMap.has(session.id)).toBe(false);
		expect(sessionMap.size).toBe(0);
	});
});
