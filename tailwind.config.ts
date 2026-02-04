import type { Config } from 'tailwindcss';

const config: Config = {
	content: ['./src/app/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			screens: {
				xs: '480px',
			},
			fontFamily: {
				inter: ['var(--font-inter)'],
			},
		},
	},
	plugins: [],
};

export default config;
