import type { Brand } from "@mona-ca/core/types";
import { t } from "elysia";

export type MaleGender = Brand<"Gender", "male">;
export type FemaleGender = Brand<"Gender", "female">;
export type Gender = MaleGender | FemaleGender;

export const newMaleGender = (rawGender: "male") => {
	return rawGender as MaleGender;
};
export const newFemaleGender = (rawGender: "female") => {
	return rawGender as FemaleGender;
};
export const newGender = (rawGender: "male" | "female") => {
	return rawGender as Gender;
};

export const isMaleGender = (gender: Gender): gender is MaleGender => {
	return gender === "male";
};
export const isFemaleGender = (gender: Gender): gender is FemaleGender => {
	return gender === "female";
};

export const maleGenderSchema = t.Literal("male");
export const femaleGenderSchema = t.Literal("female");
export const genderSchema = t.Union([maleGenderSchema, femaleGenderSchema]);
