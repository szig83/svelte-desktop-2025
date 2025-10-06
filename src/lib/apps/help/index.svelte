<script lang="ts">
	import {
		getAppParameters,
		getParameter,
		getWindowId,
		updateWindowTitleById
	} from '$lib/services/appContext';
	const helpId = getParameter<number>('helpId', 0);
	const parameters = getAppParameters();
</script>

<div>
	<h2>Súgó</h2>
	<p>Help ID: {helpId}</p>
	<pre>{JSON.stringify(parameters, null, 2)}</pre>
</div>
