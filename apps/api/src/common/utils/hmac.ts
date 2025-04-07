import { createHmac } from "node:crypto";
import { constantTimeCompare } from "./constant-time-compare";

export const generateHMAC = (data: string, secret: string): string => {
	const mac = createHmac("sha256", secret);
	mac.update(data);
	return mac.digest("base64");
};

export const verifyHMAC = (data: string, secret: string, mac: string): boolean => {
	const generatedHmac = generateHMAC(data, secret);
	return constantTimeCompare(generatedHmac, mac);
};
