import type { NewType } from "@mona-ca/core/utils";
import { StringEnum } from "../../common/schemas";

export type Gender = NewType<"gender", "man" | "woman">;

export const newGender = (rawGender: "man" | "woman") => {
	return rawGender as Gender;
};

export const genderSchema = StringEnum(["man", "woman"]);
