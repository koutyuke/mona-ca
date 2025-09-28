import { useState } from "react";

export const useLoginPage = () => {
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	return {
		errorMessage,
		setErrorMessage,
	};
};
