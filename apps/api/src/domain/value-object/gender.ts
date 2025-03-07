import { t } from "elysia";
import type { NewType } from "../../common/utils";

export type Gender = NewType<"gender", "man" | "woman">;

export const newGender = (rawGender: "man" | "woman") => {
	return rawGender as Gender;
};

export const genderSchema = t.Union([t.Literal("man"), t.Literal("woman")]);
