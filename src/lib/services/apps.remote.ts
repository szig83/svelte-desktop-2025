import { query } from '$app/server';
import { type AppMetadata } from '$lib/types/window';

export const getApps = query(async () => {
	//await new Promise((resolve) => setTimeout(resolve, 4000));
	return [
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
	] as AppMetadata[];
});
