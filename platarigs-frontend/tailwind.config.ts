
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(240 3.7% 15.9%)',
				input: 'hsl(240 3.7% 15.9%)',
				ring: 'hsl(142.1 76.2% 36.3%)',
				background: 'hsl(222.2 84% 4.9%)',
				foreground: 'hsl(210 40% 98%)',
				primary: {
					DEFAULT: 'hsl(142.1 76.2% 36.3%)',
					foreground: 'hsl(355.7 100% 97.3%)'
				},
				secondary: {
					DEFAULT: 'hsl(240 3.7% 15.9%)',
					foreground: 'hsl(210 40% 98%)'
				},
				destructive: {
					DEFAULT: 'hsl(0 84.2% 60.2%)',
					foreground: 'hsl(210 40% 98%)'
				},
				muted: {
					DEFAULT: 'hsl(240 3.7% 15.9%)',
					foreground: 'hsl(240 5% 64.9%)'
				},
				accent: {
					DEFAULT: 'hsl(240 3.7% 15.9%)',
					foreground: 'hsl(210 40% 98%)'
				},
				popover: {
					DEFAULT: 'hsl(222.2 84% 4.9%)',
					foreground: 'hsl(210 40% 98%)'
				},
				card: {
					DEFAULT: 'hsl(222.2 84% 4.9%)',
					foreground: 'hsl(210 40% 98%)'
				},
				sidebar: {
					DEFAULT: 'hsl(240 5.9% 10%)',
					foreground: 'hsl(240 4.8% 95.9%)',
					primary: 'hsl(142.1 76.2% 36.3%)',
					'primary-foreground': 'hsl(355.7 100% 97.3%)',
					accent: 'hsl(240 3.7% 15.9%)',
					'accent-foreground': 'hsl(240 4.8% 95.9%)',
					border: 'hsl(240 3.7% 15.9%)',
					ring: 'hsl(142.1 76.2% 36.3%)'
				},
				'plata': {
					50: '#f0fdf4',
					100: '#dcfce7',
					200: '#bbf7d0',
					300: '#86efac',
					400: '#4ade80',
					500: '#22c55e',
					600: '#16a34a',
					700: '#15803d',
					800: '#166534',
					900: '#14532d'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
