import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				// Desktop theme colors
				desktop: {
					bg: '#1a1a2e',
					surface: '#16213e',
					primary: '#0f3460',
					accent: '#e94560',
					text: '#ffffff',
					'text-secondary': '#a0a0a0',
					border: '#2a2a3e'
				}
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif']
			},
			boxShadow: {
				window: '0 8px 32px rgba(0, 0, 0, 0.3)',
				'window-active': '0 12px 48px rgba(0, 0, 0, 0.4)',
				taskbar: '0 -2px 8px rgba(0, 0, 0, 0.2)'
			},
			borderRadius: {
				window: '8px'
			},
			spacing: {
				taskbar: '48px'
			},
			zIndex: {
				taskbar: '1000',
				window: '100',
				'window-active': '200',
				modal: '500'
			}
		}
	},
	plugins: [forms, typography]
} satisfies Config;
