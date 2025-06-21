import type { Meta, StoryObj } from "@storybook/react";
import { CardIcon } from "./card-icon";

const meta: Meta<typeof CardIcon> = {
	title: "Pages/Onboarding/CardIcon",
	component: CardIcon,
	args: {
		variant: "customize",
	},
};

export default meta;

type Story = StoryObj<typeof CardIcon>;

export const Widget: Story = {
	args: {
		variant: "customize",
	},
};

export const Share: Story = {
	args: {
		variant: "share",
	},
};

export const MonaCa: Story = {
	args: {
		variant: "mona-ca",
	},
};
