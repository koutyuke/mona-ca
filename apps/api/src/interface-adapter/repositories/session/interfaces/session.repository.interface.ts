import type { Session } from "@/domain/session";
import type { User } from "@/domain/user";

export type SessionConstructor = ConstructorParameters<typeof Session>[0];

export interface ISessionRepository {
	findSessionAndUser: (sessionId: string) => Promise<{ session: Session | null; user: User | null }>;
	findUserSessions: (userId: string) => Promise<Session[]>;
	createSession: (session: Omit<SessionConstructor, "fresh">) => Promise<void>;
	updateSessionExpiration: (sessionId: string, expiresAt: Date) => Promise<void>;
	deleteSession: (sessionId: string) => Promise<void>;
	deleteUserSessions: (userId: string) => Promise<void>;
	deleteExpiredSessions: () => Promise<void>;
}
