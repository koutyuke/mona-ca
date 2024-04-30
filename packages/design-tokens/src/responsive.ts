export const breakpoints = {
	tablet: "640px",
	laptop: "1024px",
	desktop: "1280px",
} as const satisfies Record<string, `${number}px`>;

export const mediaQueries = {
	tablet: `(min-width: ${breakpoints.tablet})`,
	laptop: `(min-width: ${breakpoints.laptop})`,
	desktop: `(min-width: ${breakpoints.desktop})`,
} as const satisfies Record<string, `(min-width: ${number}px)`>;
