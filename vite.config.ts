import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import devtoolsJson from 'vite-plugin-devtools-json';
import { enhancedImages } from '@sveltejs/enhanced-img';

export default defineConfig({
	plugins: [devtoolsJson(), tailwindcss(), enhancedImages(), sveltekit()]
});
