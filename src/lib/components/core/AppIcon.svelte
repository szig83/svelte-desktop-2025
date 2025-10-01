<script lang="ts">
	import { type AppMetadata } from '$lib/types/window';
	import UniversalIcon from '../UniversalIcon.svelte';
	interface Props {
		app: AppMetadata;
		onclick: () => void;
	}
	let { app, onclick }: Props = $props();
</script>

<button {onclick}>
	<div class="app-icon">
		<UniversalIcon icon={app.icon ?? ''} size={48} appName={app.appName} />
	</div>
	<div class="app-title"><div>{app.title}</div></div>
</button>

<style>
	button {
		--btn-size: 80px;
		display: flex;
		/*all: unset;*/
		position: relative;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		z-index: 100;
		/*transition: transform 0.2s ease;*/

		/*transition: background-color 0.2s ease;*/
		cursor: pointer;
		aspect-ratio: 1;

		width: var(--btn-size);

		/*		background-color: rgba(255, 255, 255, 0.1);*/

		&:hover {
			/*transform: scale(1.05);*/
			z-index: 101;

			.app-icon {
				background-color: rgba(109, 109, 109, 0.9);
			}

			.app-title {
				z-index: 10;

				& > div {
					position: absolute;
					left: 0;

					background-color: rgba(109, 109, 109, 0.9);
					width: 100%;

					-webkit-line-clamp: none;
					line-clamp: none;
					text-align: center;
					text-overflow: unset;
					white-space: unset;
				}
			}
		}

		.app-icon {
			display: flex;
			justify-content: center;
			justify-content: center;
			align-items: center;
			align-items: center;
			/*transform: scale(1);*/
			transition: background-color 0.35s ease-out;

			border-radius: 8px;
			background-color: rgba(70, 70, 70, 0.9);
			aspect-ratio: 1;
			width: 100%;
			color: rgba(255, 255, 255, 0.5);
			font-size: 24px;
		}
		.app-title {
			position: relative;
			flex-grow: 1;
			width: var(--btn-size);

			& > div {
				/*white-space: nowrap;*/
				display: -webkit-box;
				position: relative;
				transition: background-color 0.35s ease-out;
				margin-top: 2px;
				border-radius: 6px;
				background-color: transparent;

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
	}
</style>
