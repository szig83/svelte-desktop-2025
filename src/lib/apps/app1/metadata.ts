import type { AppMetadata } from '../registry/index.js';

export const metadata: AppMetadata = {
	id: 'app1',
	name: 'Számláló',
	description: 'Egyszerű számláló alkalmazás állapot megőrzéssel',
	version: '1.0.0',
	icon: '/icons/icon_1.svg',
	category: 'utilities',
	permissions: [{ resource: 'app', action: 'read' }],
	multiInstance: true,
	defaultSize: { width: 600, height: 500 },
	minSize: { width: 400, height: 300 },
	author: 'System',
	keywords: ['számláló', 'counter', 'demo', 'teszt']
};
