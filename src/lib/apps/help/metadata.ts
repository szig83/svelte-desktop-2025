import type { AppMetadata } from '../registry/index.js';

export const metadata: AppMetadata = {
	id: 'help',
	name: 'Súgó',
	description: 'Rendszer dokumentáció és felhasználói útmutatók',
	version: '1.0.0',
	icon: 'MessageCircleQuestionMark',
	category: 'utilities',
	permissions: [{ resource: 'documentation', action: 'read' }],
	multiInstance: true,
	defaultSize: { width: 800, height: 600 },
	minSize: { width: 500, height: 400 },
	author: 'System',
	keywords: ['súgó', 'dokumentáció', 'útmutató', 'help']
};
