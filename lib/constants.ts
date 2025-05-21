export const NAV_THEME = {
	light: {
		background: "hsl(0 0% 100%)", // background
		border: "hsl(240 5.9% 90%)", // border
		card: "hsl(0 0% 100%)", // card
		notification: "hsl(0 84.2% 60.2%)", // destructive
		primary: "hsl(240 5.9% 10%)", // primary
		text: "hsl(240 10% 3.9%)", // foreground
	},
	dark: {
		background: "hsl(240 10% 3.9%)", // background
		border: "hsl(240 3.7% 15.9%)", // border
		card: "hsl(240 10% 3.9%)", // card
		notification: "hsl(0 72% 51%)", // destructive
		primary: "hsl(0 0% 98%)", // primary
		text: "hsl(0 0% 98%)", // foreground
	},
};

export const COLOR = {
	zinc: {
		50: "#fafafa",
		100: "#f4f4f5",
		200: "#e4e4e7",
		300: "#d4d4d8",
		400: "#a1a1aa",
		500: "#71717a",
		600: "#52525b",
		700: "#3f3f46",
		800: "#27272a",
		900: "#18181b",
		950: "#09090b",
	},
} as const;
