export {
	clientPlatformSchema,
	isMobilePlatform,
	isWebPlatform,
	mobilePlatformSchema,
	newClientPlatform,
	newMobilePlatform,
	newWebPlatform,
	webPlatformSchema,
} from "./client-platform";
export {
	femaleGenderSchema,
	genderSchema,
	maleGenderSchema,
	newFemaleGender,
	newGender,
	newMaleGender,
} from "./gender";
export { newUserId } from "./ids";

export type {
	ClientPlatform,
	MobilePlatform,
	WebPlatform,
} from "./client-platform";
export type {
	FemaleGender,
	Gender,
	MaleGender,
} from "./gender";
export type { UserId } from "./ids";
