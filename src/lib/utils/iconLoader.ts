// lib/utils/iconLoader.ts
import type { ComponentType } from 'svelte';

/**
 * Ikon típusok.
 */
export const ICON_TYPES = {
	LUCIDE: 'lucide',
	PRIVATE_IMAGE: 'private_image',
	PRIVATE_SVG: 'private_svg',
	PUBLIC_IMAGE: 'public_image',
	PUBLIC_SVG: 'public_svg',
	EXTERNAL: 'external'
} as const;

export type IconType = (typeof ICON_TYPES)[keyof typeof ICON_TYPES];

/**
 * Ikon adat típus.
 */
export interface IconData {
	type: IconType;
	content: ComponentType | string;
}

/**
 * Cache a betöltött ikonokhoz.
 */
const iconCache = new Map<string, IconData | null>();

/**
 * Ikon típus felismerése.
 */
export function detectIconType(iconName: string | null | undefined): IconType | null {
	if (!iconName) return null;

	// Külső URL (http/https)
	if (iconName.startsWith('http')) {
		if (iconName.endsWith('.svg')) return ICON_TYPES.EXTERNAL;
		return ICON_TYPES.EXTERNAL;
	}

	// Publikus fájlok (/) kezdetűek
	if (iconName.startsWith('/')) {
		if (iconName.endsWith('.svg')) return ICON_TYPES.PUBLIC_SVG;
		if (iconName.match(/\.(png|jpg|jpeg|gif|webp)$/i)) return ICON_TYPES.PUBLIC_IMAGE;
		return ICON_TYPES.PUBLIC_IMAGE;
	}

	// Privát fájlok (lib-ből) - előtag nélkül, de tartalmaz pont-ot
	if (iconName.includes('.')) {
		if (iconName.endsWith('.svg')) return ICON_TYPES.PRIVATE_SVG;
		if (iconName.match(/\.(png|jpg|jpeg|gif|webp)$/i)) return ICON_TYPES.PRIVATE_IMAGE;
		return ICON_TYPES.PRIVATE_IMAGE;
	}

	// Egyébként Lucide ikon
	return ICON_TYPES.LUCIDE;
}

/**
 * Lucide ikon betöltése.
 * Lucide ikonok neve PascalCase formátumban (pl. 'LayoutDashboard')
 */
async function loadLucideIcon(iconName: string): Promise<ComponentType | null> {
	try {
		// Lucide-svelte dinamikus import
		const module = await import('lucide-svelte');
		const IconComponent = module[iconName as keyof typeof module];

		if (!IconComponent) {
			console.warn(`Lucide ikon '${iconName}' nem található a lucide-svelte csomagban`);
			return null;
		}

		return IconComponent as ComponentType;
	} catch (error) {
		console.warn(`Lucide ikon '${iconName}' betöltési hiba:`, error);
		return null;
	}
}

/**
 * Privát SVG betöltése dinamikus importtal
 * @param {string} iconName - pl. 'facebook.svg'
 * @returns {Promise<string|null>}
 */
async function loadPrivateSvg(iconName: string, appName?: string) {
	console.log(iconName, appName);
	try {
		// Vite automatikusan kezeli a ?raw query-t
		let path = '../assets/icons/';
		if (appName !== '') {
			path = `../apps/${appName}/`;
		}
		const svgModule = await import(`${path}${iconName}?raw`);
		return svgModule.default;
	} catch (error) {
		console.warn(`Privát SVG '${iconName}' nem található:`, error);
		return null;
	}
}

/**
 * Privát kép betöltése dinamikus importtal
 * @param {string} iconName - pl. 'facebook.png'
 * @returns {Promise<string|null>}
 */
async function loadPrivateImage(iconName: string, appName?: string) {
	console.log('private image:', iconName, appName);
	try {
		// Vite automatikusan optimalizálja és hash-eli a képeket
		let path = '../assets/icons/';
		if (appName !== '') {
			path = `../apps/${appName}/`;
		}
		const imageModule = await import(`${path}${iconName}`);
		return imageModule.default; // Ez már egy optimalizált URL lesz
	} catch (error) {
		console.warn(`Privát kép '${iconName}' nem található:`, error);
		return null;
	}
}

/**
 * Publikus SVG betöltése fetch-el.
 */
async function loadPublicSvg(svgPath: string): Promise<string | null> {
	try {
		const response = await fetch(svgPath);
		if (!response.ok) throw new Error(`SVG not found: ${svgPath}`);
		return await response.text();
	} catch (error) {
		console.warn(`Publikus SVG '${svgPath}' nem található:`, error);
		return null;
	}
}

/**
 * Univerzális ikon betöltő.
 */
export async function loadIcon(
	iconIdentifier: string | null | undefined,
	appName?: string
): Promise<IconData | null> {
	if (!iconIdentifier) return null;

	//console.log(iconIdentifier, ' appname:', appName);

	// Cache kulcs generálása - appName-mel együtt a privát ikonokhoz
	const iconType = detectIconType(iconIdentifier);
	const cacheKey = iconType === ICON_TYPES.PRIVATE_SVG || iconType === ICON_TYPES.PRIVATE_IMAGE
		? `${appName || ''}:${iconIdentifier}`
		: iconIdentifier;

	// Cache ellenőrzése
	if (iconCache.has(cacheKey)) {
		return iconCache.get(cacheKey) ?? null;
	}

	if (!iconType) {
		iconCache.set(cacheKey, null);
		return null;
	}

	let result: IconData | null = null;

	switch (iconType) {
		case ICON_TYPES.LUCIDE: {
			const lucideComponent = await loadLucideIcon(iconIdentifier);
			if (lucideComponent) {
				result = {
					type: ICON_TYPES.LUCIDE,
					content: lucideComponent
				};
			}
			break;
		}

		case ICON_TYPES.PRIVATE_SVG: {
			const privateSvgContent = await loadPrivateSvg(iconIdentifier, appName);
			if (privateSvgContent) {
				result = {
					type: ICON_TYPES.PRIVATE_SVG,
					content: privateSvgContent
				};
			}
			break;
		}

		case ICON_TYPES.PRIVATE_IMAGE: {
			const privateImageUrl = await loadPrivateImage(iconIdentifier, appName);
			if (privateImageUrl) {
				result = {
					type: ICON_TYPES.PRIVATE_IMAGE,
					content: privateImageUrl
				};
			}
			break;
		}
		case ICON_TYPES.PUBLIC_SVG: {
			const publicSvgContent = await loadPublicSvg(iconIdentifier);
			if (publicSvgContent) {
				result = {
					type: ICON_TYPES.PUBLIC_SVG,
					content: publicSvgContent
				};
			}
			break;
		}

		case ICON_TYPES.PUBLIC_IMAGE:
		case ICON_TYPES.EXTERNAL:
			// Publikus képek és külső URL-ek esetén csak az URL-t tároljuk
			result = {
				type: iconType,
				content: iconIdentifier
			};
			break;
	}

	// Cache-elés
	iconCache.set(cacheKey, result);
	return result;
}

/**
 * Cache tisztítása.
 */
export function clearIconCache(): void {
	iconCache.clear();
}
