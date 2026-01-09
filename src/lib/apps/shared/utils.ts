/**
 * Alkalmazások közötti megosztott segédprogramok
 */

import type { AppMetadata } from '../registry/index.js';

/**
 * Alkalmazás azonosító validálása
 */
export function validateAppId(id: string): boolean {
	// Alkalmazás azonosító csak betűket, számokat, kötőjelet és aláhúzást tartalmazhat
	const validIdPattern = /^[a-zA-Z0-9_-]+$/;
	return validIdPattern.test(id) && id.length > 0 && id.length <= 50;
}

/**
 * Alkalmazás név validálása
 */
export function validateAppName(name: string): boolean {
	return name.length > 0 && name.length <= 100;
}

/**
 * Alkalmazás metaadatok validálása
 */
export function validateAppMetadata(metadata: AppMetadata): string[] {
	const errors: string[] = [];

	if (!validateAppId(metadata.id)) {
		errors.push('Érvénytelen alkalmazás azonosító');
	}

	if (!validateAppName(metadata.name)) {
		errors.push('Érvénytelen alkalmazás név');
	}

	if (!metadata.version || metadata.version.length === 0) {
		errors.push('Verzió megadása kötelező');
	}

	if (metadata.defaultSize.width < 100 || metadata.defaultSize.height < 100) {
		errors.push('Alapértelmezett ablak méret túl kicsi');
	}

	if (metadata.minSize.width < 100 || metadata.minSize.height < 100) {
		errors.push('Minimális ablak méret túl kicsi');
	}

	if (
		metadata.maxSize &&
		(metadata.maxSize.width < metadata.minSize.width ||
			metadata.maxSize.height < metadata.minSize.height)
	) {
		errors.push('Maximális ablak méret kisebb mint a minimális');
	}

	return errors;
}

/**
 * Alkalmazás ikon útvonal generálása
 */
export function generateIconPath(appId: string): string {
	return `/icons/${appId}.svg`;
}

/**
 * Alkalmazás kategória színének lekérése
 */
export function getCategoryColor(category: AppMetadata['category']): string {
	const categoryColors: Record<AppMetadata['category'], string> = {
		productivity: '#3b82f6',
		system: '#ef4444',
		utilities: '#10b981',
		entertainment: '#f59e0b',
		development: '#8b5cf6',
		other: '#6b7280'
	};

	return categoryColors[category] || categoryColors.other;
}

/**
 * Alkalmazás kategória ikon lekérése
 */
export function getCategoryIcon(category: AppMetadata['category']): string {
	const categoryIcons: Record<AppMetadata['category'], string> = {
		productivity: 'briefcase',
		system: 'settings',
		utilities: 'tool',
		entertainment: 'play',
		development: 'code',
		other: 'folder'
	};

	return categoryIcons[category] || categoryIcons.other;
}
