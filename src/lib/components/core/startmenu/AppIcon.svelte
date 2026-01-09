<!--
Alkalmazás parancsikonok komponens.
Start menüben megjelenő ikonokat mutatja.
-->
<script lang="ts">
	import { type AppMetadata } from '$lib/types/window';
	import { UniversalIcon } from '$lib/components/shared';
	interface Props {
		app: AppMetadata;
		onclick: () => void;
	}
	let { app, onclick }: Props = $props();
</script>

<button {onclick} class="btn-click-effect">
	<div class="app-icon">
		<UniversalIcon icon={app.icon ?? ''} size={56} appName={app.appName} />
	</div>
	<div class="app-title"><div>{app.title}</div></div>
</button>

<style>
	button {
		--btn-size: 80px;
		display: flex;
		position: relative;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 2px;
		z-index: 100;
		cursor: pointer;
		aspect-ratio: 1;
		width: var(--btn-size);
		color: var(--color-foreground);

		.app-icon {
			display: flex;
			justify-content: center;
			align-items: center;
			transition: background-color 0.35s ease-out;
			border-radius: var(--radius-sm);
			/*background-color: hsl(from var(--panel-bg-color) h s calc(l - 5));*/
			aspect-ratio: 1;
			width: 100%;
		}
		.app-title {
			width: var(--btn-size);

			& > div {
				display: -webkit-box;
				transition: color 0.25s ease-out;
				line-clamp: 2;
				-webkit-line-clamp: 2;
				overflow: hidden;
				font-size: 0.7rem;
				text-overflow: ellipsis;
				-webkit-box-orient: vertical;
				line-height: 1.5em;
				white-space: normal;
			}
		}

		&:hover {
			.app-icon {
				background-color: var(--color-primary-alpha-70);
			}
			.app-title {
				& > div {
					color: var(--color-primary-alpha-70);
				}
			}
		}
	}
</style>
