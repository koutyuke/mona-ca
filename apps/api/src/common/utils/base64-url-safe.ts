import { decodeBase64urlIgnorePadding, encodeBase64urlNoPadding } from "@oslojs/encoding";

export const encodeBase64URLSafe = (data: string): string => {
	const byte = new TextEncoder().encode(data);
	return encodeBase64urlNoPadding(byte);
};

export const decodeBase64URLSafe = (data: string): string => {
	const byte = decodeBase64urlIgnorePadding(data);
	return new TextDecoder().decode(byte);
};
