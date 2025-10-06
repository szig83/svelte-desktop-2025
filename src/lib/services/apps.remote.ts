import { query } from '$app/server';
import { type AppMetadata } from '$lib/types/window';
import { faker } from '@faker-js/faker';

export const getApps = query(async () => {
	//await new Promise((resolve) => setTimeout(resolve, 4000));
	const appNames = ['app1', 'app2', 'app3'];
	const icons = ['/icons/svelte.svg', 'LayoutDashboard', 'icon.svg'];
	for (let i = 1; i < 28; i++) {
		icons.push(`/icons/icon_${i}.svg`);
	}
	const apps = [];
	apps.push({
		title: 'Beállítások',
		appName: 'settings',
		//icon: 'icon.svg',
		minSize: { width: 400, height: 300 },
		defaultSize: { width: 600, height: 400, maximized: false },
		allowMultiple: false,
		helpId: 1
	});

	apps.push({
		title: 'Felhasználók',
		appName: 'users',
		//icon: 'icon.svg',
		minSize: { width: 500, height: 500 },
		defaultSize: { width: 500, height: 500, maximized: false },
		allowMultiple: false
	});

	apps.push({
		title: 'Súgó',
		appName: 'help',
		//icon: 'icon.svg',
		minSize: { width: 500, height: 500 },
		defaultSize: { width: 500, height: 500, maximized: false },
		allowMultiple: true
	});

	/*for (let i = 0; i < 17; i++) {
		const icon = faker.helpers.arrayElement(icons);
		const appName = faker.helpers.arrayElement(appNames);
		apps.push({
			title: faker.word.words({ count: { min: 1, max: 3 } }),
			appName: appName,
			icon: icon,
			minSize: {
				width: 400,
				height: 200
			},
			defaultSize: {
				width: faker.number.int({ min: 300, max: 1200 }),
				height: faker.number.int({ min: 200, max: 800 })
			}
		});
	}*/

	/*return [
		{
			title: 'App1',
			appName: 'app1',
			icon: 'LayoutDashboard',
			defaultSize: { width: 600, height: 400 }
		},
		{
			title: 'App2',
			appName: 'app2',
			icon: '/icons/svelte.svg',
			defaultSize: { width: 300, height: 200 }
		},
		{
			title: 'Valami hosszú nevű cucc ami olyan hosszú hogy nem fér be egy sorba',
			appName: 'app3',
			icon: 'icon.svg',
			defaultSize: { width: 300, height: 200 }
		},
		{
			title: 'Subidubi',
			appName: 'app3',
			icon: 'icon.svg',
			defaultSize: { width: 300, height: 200 }
		},
		{
			title: 'sallala',
			appName: 'app3',
			icon: 'icon.svg',
			defaultSize: { width: 300, height: 200 }
		},
		{
			title: 'Ez meg az',
			appName: 'app3',
			icon: 'icon.svg',
			defaultSize: { width: 300, height: 200 }
		}
	] as AppMetadata[];*/
	return apps as AppMetadata[];
});
