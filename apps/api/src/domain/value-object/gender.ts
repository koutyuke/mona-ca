import { StringEnum } from "../../common/schema";
import type { NewType } from "../../common/utils";

export type Gender = NewType<"gender", "man" | "woman">;

export const newGender = (rawGender: "man" | "woman") => {
	return rawGender as Gender;
};

export const genderSchema = StringEnum(["man", "woman"]);
