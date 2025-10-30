/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#FF6B35', // Vibrant orange-sunset
					foreground: '#FFFFFF',
					light: '#FF8F65',
					dark: '#E5551F',
				},
				secondary: {
					DEFAULT: '#4ECDC4', // Electric teal/turquoise
					foreground: '#FFFFFF',
					light: '#6EE7DE',
					dark: '#38B2A8',
				},
				accent: {
					DEFAULT: '#F5A623', // Sunny yellow-orange (keep current)
					foreground: '#111111',
					light: '#FFC947',
					dark: '#D4941A',
				},
				destructive: {
					DEFAULT: '#E63946', // Strong red
					foreground: '#FFFFFF',
					light: '#FF6B6B',
					dark: '#C9184A',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				// Custom joke-specific colors
				content: {
					DEFAULT: '#111111', // Deep black for max readability
					muted: '#666666',   // Medium gray for secondary text
					light: '#999999',   // Light gray for meta info
				},
				brand: {
					yellow: '#F5A623', // Brand yellow for admin elements
					orange: '#FF6B35', // Brand orange for CTAs
				}
			},
			fontFamily: {
				ui: ['Inter', 'system-ui', 'sans-serif'], // Clean UI font
				content: ['Lora', 'Georgia', 'serif'], // Elegant serif for jokes
				mono: ['JetBrains Mono', 'monospace'], // Developer-friendly mono
			},
			typography: {
				content: {
					css: {
						lineHeight: '1.7', // Increased readability
						color: '#111111',
					},
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: 0 },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: 0 },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
}