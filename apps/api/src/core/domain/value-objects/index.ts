export {
	newClientPlatform,
	clientPlatformSchema,
	newMobilePlatform,
	newWebPlatform,
	mobilePlatformSchema,
	webPlatformSchema,
} from "./client-platform";
export {
	newMaleGender,
	newFemaleGender,
	newGender,
	maleGenderSchema,
	femaleGenderSchema,
	genderSchema,
} from "./gender";
export { newUserId } from "./ids";

export type {
	ClientPlatform,
	MobilePlatform,
	WebPlatform,
} from "./client-platform";
export type {
	MaleGender,
	FemaleGender,
	Gender,
} from "./gender";
export type { UserId } from "./ids";
