<script lang="ts">
	import { getThemeManager } from '$lib/stores/themeStore.svelte';

	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import ColorSchemePicker from '$lib/components/ColorSchemePicker.svelte';
	import AppSideBar from '$lib/components/AppSideBar.svelte';
	import ThemeSettings from './components/ThemeSettings.svelte';

	import { Command } from 'bits-ui';
	const theme = getThemeManager();
	function scrollToSection(id: string) {
		const element = document.getElementById(id);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth' });
		}
	}
</script>

<div class="settings-app">
	<AppSideBar>
		<Command.Root class="command-root">
			<Command.Input placeholder="Keresés..." />
			<Command.List class="command-list">
				<Command.Viewport>
					<Command.Empty
						class="text-muted-foreground flex w-full items-center justify-center pb-6 pt-8 text-sm"
					>
						No results found.
					</Command.Empty>
					<Command.Group>
						<Command.GroupHeading class="command-group-heading">Megjelenés</Command.GroupHeading>
						<Command.GroupItems>
							<Command.Item
								onclick={() => scrollToSection('elso')}
								class="command-item"
								keywords={[]}>Első</Command.Item
							>
							<Command.Item
								onclick={() => scrollToSection('info')}
								class="command-item"
								keywords={['child', 'custom element', 'snippets']}
							>
								Második
							</Command.Item>
							<Command.Item
								class="command-item"
								keywords={['css', 'theme', 'colors', 'fonts', 'tailwind']}
							>
								Harmadik
							</Command.Item>
						</Command.GroupItems>
					</Command.Group>
					<Command.Separator class="bg-foreground/5 h-px w-full" />
				</Command.Viewport>
			</Command.List>
		</Command.Root>
	</AppSideBar>
	<div class="settings-content">
		<ThemeSettings />
		<ThemeToggle />
		<!-- Gyors színséma választó -->
		<section class="settings-section" id="elso">
			<h2>🎨 Gyors Színséma Választó</h2>
			<ColorSchemePicker />
		</section>

		<!-- Teljes téma beállítások -->
		<section class="settings-section"></section>

		<!-- Információk -->
		<section class="settings-section info-section">
			<h2 id="info">ℹ️ Információk</h2>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Aktuális mód:</span>
					<span class="info-value">{theme.effectiveMode}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Beállított mód:</span>
					<span class="info-value">{theme.settings.mode}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Színséma:</span>
					<span class="info-value">{theme.settings.colorScheme}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Betűméret:</span>
					<span class="info-value">{theme.settings.fontSize}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Animációk:</span>
					<span class="info-value">{theme.settings.animations ? 'Engedélyezve' : 'Letiltva'}</span>
				</div>
			</div>
		</section>
	</div>
</div>

<style>
	@reference "tailwindcss";
	@custom-variant dark (&:is(.dark *));

	.settings-app {
		display: flex;
		flex-direction: row;
		height: 100%;
		overflow: hidden;
	}

	.settings-content {
		flex: 1;
		padding: 24px;
		overflow-y: auto;
	}

	.settings-section {
		margin-bottom: 20px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		background: white;
		padding: 24px;
	}

	.settings-section h2 {
		margin-top: 0;
		margin-bottom: 20px;
		color: #374151;
		font-weight: 600;
		font-size: 18px;
	}

	.info-section {
		border: none;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.info-section h2 {
		color: white;
	}

	.info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 16px;
	}

	.info-item {
		display: flex;
		flex-direction: column;
		gap: 4px;
		backdrop-filter: blur(10px);
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.1);
		padding: 12px;
	}

	.info-label {
		opacity: 0.9;
		font-weight: 500;
		font-size: 12px;
		letter-spacing: 0.5px;
		text-transform: uppercase;
	}

	.info-value {
		font-weight: 700;
		font-size: 16px;
	}

	:global(#desktop.dark) .settings-section {
		border-color: #374151;
		background: #1f2937;
	}

	:global(#desktop.dark) .settings-section h2 {
		color: #f9fafb;
	}

	/* Scrollbar styling */
	.settings-content::-webkit-scrollbar {
		width: 8px;
	}

	.settings-content::-webkit-scrollbar-track {
		background: transparent;
	}

	.settings-content::-webkit-scrollbar-thumb {
		border-radius: 4px;
		background: #d1d5db;
	}

	.settings-content::-webkit-scrollbar-thumb:hover {
		background: #9ca3af;
	}

	:global(#desktop.dark) .settings-content::-webkit-scrollbar-thumb {
		background: #4b5563;
	}

	:global(#desktop.dark) .settings-content::-webkit-scrollbar-thumb:hover {
		background: #6b7280;
	}

	:global {
		.command-root {
			@apply flex h-full w-full flex-col divide-y self-start overflow-hidden;
		}
		.command-list {
			@apply max-h-[280px] overflow-y-auto overflow-x-hidden py-2;
		}

		.command-group-heading {
			@apply text-neutral-500 dark:text-neutral-200;
			font-size: 0.7rem;
		}

		.command-search {
		}
		.command-item {
			@apply rounded-sm flex cursor-pointer select-none capitalize hover:bg-gray-200 dark:hover:bg-neutral-800;
			padding: 2px 10px;
			font-size: 0.8rem;
		}
	}
</style>
