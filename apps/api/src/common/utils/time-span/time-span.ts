// ref: https://github.com/pilcrowonpaper/oslo/blob/ef7b14b387c0dcf9c8c50e01e82137d6ba5def6d/src/index.ts

export type TimeSpanUnit = "ms" | "s" | "m" | "h" | "d" | "w";

export class TimeSpan {
	constructor(value: number, unit: TimeSpanUnit) {
		this.value = value;
		this.unit = unit;
	}

	public value: number;
	public unit: TimeSpanUnit;

	public milliseconds(): number {
		if (this.unit === "ms") {
			return this.value;
		}
		if (this.unit === "s") {
			return this.value * 1000;
		}
		if (this.unit === "m") {
			return this.value * 1000 * 60;
		}
		if (this.unit === "h") {
			return this.value * 1000 * 60 * 60;
		}
		if (this.unit === "d") {
			return this.value * 1000 * 60 * 60 * 24;
		}
		return this.value * 1000 * 60 * 60 * 24 * 7;
	}

	public seconds(): number {
		return this.milliseconds() / 1000;
	}
}
