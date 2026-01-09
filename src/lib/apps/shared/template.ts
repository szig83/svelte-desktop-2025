/**
 * Alkalmazás sablon segédprogramok.
 * Új alkalmazások létrehozásához használható sablonok és segédprogramok.
 */

import type { AppMetadata } from '../registry/index.js';

/**
 * Alkalmazás sablon interfész.
 */
export interface AppTemplate {
	metadata: AppMetadata;
	componentTemplate: string;
	metadataTemplate: string;
	hasStores: boolean;
	hasTypes: boolean;
	hasUtils: boolean;
	hasComponents: boolean;
	storeTemplate?: string;
	typesTemplate?: string;
	utilsTemplate?: string;
}

/**
 * Alkalmazás struktúra konfiguráció
 */
export interface AppStructureConfig {
	includeStores: boolean;
	includeTypes: boolean;
	includeUtils: boolean;
	includeComponents: boolean;
	includeTests: boolean;
}

/**
 * Alapértelmezett alkalmazás komponens sablon.
 */
export const DEFAULT_APP_COMPONENT_TEMPLATE = `<script lang="ts">
  // Alkalmazás logika itt
  export let params: Record<string, any> = {};
</script>

<div class="app-container">
  <h1>{{APP_NAME}}</h1>
  <p>{{APP_DESCRIPTION}}</p>
</div>

<style>
  .app-container {
    padding: 1rem;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
</style>`;

/**
 * Alkalmazás metaadatok sablon.
 */
export const DEFAULT_METADATA_TEMPLATE = `import type { AppMetadata } from '../registry/index.js';

export const metadata: AppMetadata = {
  id: '{{APP_ID}}',
  name: '{{APP_NAME}}',
  description: '{{APP_DESCRIPTION}}',
  version: '1.0.0',
  icon: '/icons/{{APP_ID}}.svg',
  category: '{{APP_CATEGORY}}',
  permissions: [],
  multiInstance: {{MULTI_INSTANCE}},
  defaultSize: { width: {{DEFAULT_WIDTH}}, height: {{DEFAULT_HEIGHT}} },
  minSize: { width: {{MIN_WIDTH}}, height: {{MIN_HEIGHT}} },
  author: '{{APP_AUTHOR}}',
  keywords: [{{APP_KEYWORDS}}]
};`;

/**
 * Alkalmazás store sablon.
 */
export const DEFAULT_STORE_TEMPLATE = `/**
 * {{APP_NAME}} alkalmazás store
 *
 * Ez a store a {{APP_NAME}} alkalmazás állapotát kezeli Svelte 5 rune-okkal.
 */

interface {{APP_NAME_PASCAL}}State {
  // Alkalmazás állapot definíciók itt
  isLoading: boolean;
}

const initialState: {{APP_NAME_PASCAL}}State = {
  // Kezdeti állapot értékek
  isLoading: false
};

export class {{APP_NAME_PASCAL}}Manager {
  state = $state<{{APP_NAME_PASCAL}}State>({ ...initialState });

  setLoading(isLoading: boolean) {
    this.state.isLoading = isLoading;
  }

  reset() {
    this.state = { ...initialState };
  }

  // További metódusok itt
}

/**
 * {{APP_NAME_PASCAL}} manager példány létrehozása
 */
export function create{{APP_NAME_PASCAL}}Manager(): {{APP_NAME_PASCAL}}Manager {
  return new {{APP_NAME_PASCAL}}Manager();
}`;

/**
 * Alkalmazás típusok sablon.
 */
export const DEFAULT_TYPES_TEMPLATE = `/**
 * {{APP_NAME}} alkalmazás típus definíciók
 */

export interface {{APP_NAME_PASCAL}}Config {
  // Konfigurációs típusok
}

export interface {{APP_NAME_PASCAL}}Data {
  // Adat típusok
}

export interface {{APP_NAME_PASCAL}}Events {
  // Event típusok
}`;

/**
 * Alkalmazás segédprogramok sablon.
 */
export const DEFAULT_UTILS_TEMPLATE = `/**
 * {{APP_NAME}} alkalmazás segédprogramok
 */

/**
 * Alkalmazás-specifikus segédfunkciók
 */
export const {{APP_NAME_CAMEL}}Utils = {
  // Segédfunkciók itt
};`;

/**
 * Alkalmazás sablon generálása.
 * @param appId - Az alkalmazás egyedi azonosítója
 * @param appName - Az alkalmazás megjelenítendő neve
 * @param description - Az alkalmazás leírása
 * @param config - Struktúra konfiguráció
 * @returns Az alkalmazás sablon objektum
 */
export function generateAppTemplate(
	appId: string,
	appName: string,
	description: string = `${appName} alkalmazás`,
	config: Partial<AppStructureConfig> = {}
): AppTemplate {
	const structureConfig: AppStructureConfig = {
		includeStores: false,
		includeTypes: false,
		includeUtils: false,
		includeComponents: false,
		includeTests: false,
		...config
	};

	const metadata: AppMetadata = {
		id: appId,
		name: appName,
		description,
		version: '1.0.0',
		icon: `/icons/${appId}.svg`,
		category: 'other',
		permissions: [],
		multiInstance: false,
		defaultSize: { width: 800, height: 600 },
		minSize: { width: 400, height: 300 }
	};

	const templateVars = {
		APP_ID: appId,
		APP_NAME: appName,
		APP_DESCRIPTION: description,
		APP_CATEGORY: 'other',
		MULTI_INSTANCE: 'false',
		DEFAULT_WIDTH: '800',
		DEFAULT_HEIGHT: '600',
		MIN_WIDTH: '400',
		MIN_HEIGHT: '300',
		APP_AUTHOR: '',
		APP_KEYWORDS: '',
		APP_NAME_PASCAL: toPascalCase(appName),
		APP_NAME_CAMEL: toCamelCase(appName)
	};

	const componentTemplate = replaceTemplateVars(DEFAULT_APP_COMPONENT_TEMPLATE, templateVars);
	const metadataTemplate = replaceTemplateVars(DEFAULT_METADATA_TEMPLATE, templateVars);

	const template: AppTemplate = {
		metadata,
		componentTemplate,
		metadataTemplate,
		hasStores: structureConfig.includeStores,
		hasTypes: structureConfig.includeTypes,
		hasUtils: structureConfig.includeUtils,
		hasComponents: structureConfig.includeComponents
	};

	if (structureConfig.includeStores) {
		template.storeTemplate = replaceTemplateVars(DEFAULT_STORE_TEMPLATE, templateVars);
	}

	if (structureConfig.includeTypes) {
		template.typesTemplate = replaceTemplateVars(DEFAULT_TYPES_TEMPLATE, templateVars);
	}

	if (structureConfig.includeUtils) {
		template.utilsTemplate = replaceTemplateVars(DEFAULT_UTILS_TEMPLATE, templateVars);
	}

	return template;
}

/**
 * Sablon változók cseréje
 * @param template
 * @param vars
 */
function replaceTemplateVars(template: string, vars: Record<string, string>): string {
	let result = template;
	Object.entries(vars).forEach(([key, value]) => {
		const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
		result = result.replace(regex, value);
	});
	return result;
}

/**
 * String konvertálása PascalCase-re
 * @param str
 */
function toPascalCase(str: string): string {
	return str
		.replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
		.replace(/^(.)/, (_, char) => char.toUpperCase());
}

/**
 * String konvertálása camelCase-re
 * @param str
 */
function toCamelCase(str: string): string {
	const pascal = toPascalCase(str);
	return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Teljes alkalmazás struktúra generálása
 * @param appId
 * @param appName
 * @param description
 * @param config
 */
export function generateAppStructure(
	appId: string,
	appName: string,
	description?: string,
	config?: Partial<AppStructureConfig>
): {
	files: Record<string, string>;
	directories: string[];
} {
	const template = generateAppTemplate(appId, appName, description, config);

	const files: Record<string, string> = {
		'index.svelte': template.componentTemplate,
		'metadata.ts': template.metadataTemplate
	};

	const directories: string[] = [];

	if (template.hasStores && template.storeTemplate) {
		files['stores/index.ts'] = template.storeTemplate;
		directories.push('stores');
	}

	if (template.hasTypes && template.typesTemplate) {
		files['types/index.ts'] = template.typesTemplate;
		directories.push('types');
	}

	if (template.hasUtils && template.utilsTemplate) {
		files['utils/index.ts'] = template.utilsTemplate;
		directories.push('utils');
	}

	if (template.hasComponents) {
		directories.push('components');
	}

	return { files, directories };
}
