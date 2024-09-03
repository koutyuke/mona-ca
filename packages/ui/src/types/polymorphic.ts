import type { ComponentProps, ElementType } from "react";

export type PolymorphicProps<E extends ElementType, P = unknown> = P & {
	as?: E;
} & Omit<ComponentProps<E>, keyof P>;
