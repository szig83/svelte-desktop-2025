import type { AppMetadata } from '../registry/index.js';

export const metadata: AppMetadata = {
	id: 'settings',
	name: 'Beállítások',
	description: 'Rendszer beállítások és testreszabási lehetőségek',
	version: '1.0.0',
	icon: 'Settings',
	category: 'system',
	permissions: [
		{ resource: 'system', action: 'read' },
		{ resource: 'system', action: 'write' }
	],
	multiInstance: false,
	defaultSize: { width: 900, height: 700 },
	minSize: { width: 600, height: 500 },
	author: 'System',
	keywords: ['beállítások', 'konfiguráció', 'testreszabás', 'rendszer'],
	helpId: 1
};
