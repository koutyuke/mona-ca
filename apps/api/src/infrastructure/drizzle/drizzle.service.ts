import { drizzle } from "drizzle-orm/d1";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "./schema";

export class DrizzleService {
	public db: DrizzleD1Database<typeof schema>;
	public schema = schema;

	constructor(d1: D1Database) {
		this.db = drizzle(d1, { schema: this.schema });
	}
}
