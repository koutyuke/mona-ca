import { Value } from "@sinclair/typebox/value";
import { generateState } from "arctic";
import { t } from "elysia";
import {
	type Err,
	type Result,
	constantTimeCompare,
	decodeBase64URLSafe,
	encodeBase64URLSafe,
	err,
	generateHMAC,
} from "../../../../common/utils";
import { type ClientType, clientTypeSchema, newClientType } from "../../../../domain/value-object";

const OAuthStatePayloadSchema = t.Object({
	_state: t.String(),
	clientType: clientTypeSchema,
});

export const OAuthStateObjectSchema = t.Object({
	d: t.String(),
	s: t.String(),
});

export const generateSignedState = (payload: { clientType: ClientType }, hmacSecret: string): string => {
	const _state = generateState();

	const statePayload = {
		_state,
		...payload,
	};

	const base64StatePayload = btoa(JSON.stringify(statePayload));
	const signature = generateHMAC(base64StatePayload, hmacSecret);

	const stateObj = {
		d: base64StatePayload,
		s: signature,
	};

	return encodeBase64URLSafe(JSON.stringify(stateObj));
};

type SignedStatePayload = {
	clientType: ClientType;
};

type ValidatedSignedStateResult = Result<
	SignedStatePayload,
	Err<"INVALID_SIGNED_STATE"> | Err<"FAILED_TO_DECODE_SIGNED_STATE">
>;

export const validateSignedState = (mac: string, hmacSecret: string): ValidatedSignedStateResult => {
	try {
		const decoded = decodeBase64URLSafe(mac);
		const parsedStateObj = JSON.parse(decoded);

		if (!Value.Check(OAuthStateObjectSchema, parsedStateObj)) {
			return err("INVALID_SIGNED_STATE");
		}

		const { d: base64StatePayload, s: signature } = parsedStateObj;

		const expectedSignature = generateHMAC(base64StatePayload, hmacSecret);

		// 改竄検知
		if (!constantTimeCompare(signature, expectedSignature)) {
			return err("INVALID_SIGNED_STATE");
		}

		const statePayloadString = atob(base64StatePayload);
		const statePayload = JSON.parse(statePayloadString);

		if (!Value.Check(OAuthStatePayloadSchema, statePayload)) {
			return err("INVALID_SIGNED_STATE");
		}

		return {
			clientType: newClientType(statePayload.clientType),
		};
	} catch (e) {
		console.error(e);
		return err("FAILED_TO_DECODE_SIGNED_STATE");
	}
};
