import type { AppMetadata } from '../registry/index.js';

export const metadata: AppMetadata = {
	id: 'app2',
	name: 'Lista kezelő',
	description: 'Egyszerű lista kezelő alkalmazás elemek hozzáadásával és törlésével',
	version: '1.0.0',
	icon: '/icons/icon_2.svg',
	category: 'utilities',
	permissions: [{ resource: 'app', action: 'read' }],
	multiInstance: true,
	defaultSize: { width: 500, height: 600 },
	minSize: { width: 350, height: 400 },
	author: 'System',
	keywords: ['lista', 'list', 'kezelő', 'manager', 'demo']
};
