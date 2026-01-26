import type { AppMetadata } from '../registry/index.js';

export const metadata: AppMetadata = {
	id: 'users',
	name: 'Felhasználók',
	description: 'Felhasználói fiókok kezelése és adminisztráció',
	version: '1.0.0',
	icon: 'UsersRound',
	category: 'system',
	permissions: [
		{ resource: 'users', action: 'read' },
		{ resource: 'users', action: 'write' },
		{ resource: 'users', action: 'delete' }
	],
	multiInstance: false,
	defaultSize: { width: 1000, height: 800 },
	minSize: { width: 700, height: 600 },
	author: 'System',
	keywords: ['felhasználók', 'admin', 'fiókok', 'kezelés']
};
