import type { Session } from "@/domain/session";

export type SessionConstructor = ConstructorParameters<typeof Session>[0];

export interface ISessionRepository {
	find(sessionId: string): Promise<Session | null>;
	findManyByUserId: (userId: string) => Promise<Session[]>;
	create: (session: Omit<SessionConstructor, "fresh">) => Promise<Session>;
	updateExpiration: (sessionId: string, expiresAt: Date) => Promise<Session>;
	delete: (sessionId: string) => Promise<void>;
	deleteManyByUserId: (userId: string) => Promise<void>;
	deleteManyByExpired: () => Promise<void>;
}
