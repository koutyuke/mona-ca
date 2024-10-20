const capitalizeProvider = (provider: string) => {
	switch (provider) {
		case "discord":
			return "Discord";
		case "google":
			return "Google";
		default:
			return "Unknown";
	}
};

export { capitalizeProvider };
