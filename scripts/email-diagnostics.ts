#!/usr/bin/env bun

/**
 * Email Service Diagnostics CLI
 *
 * Run with: bun scripts/email-diagnostics.ts
 */

import { printEmailDiagnostics } from '../src/lib/server/email/diagnostics';

async function main() {
	try {
		await printEmailDiagnostics();
		process.exit(0);
	} catch (error) {
		console.error('Diagnostics failed:', error);
		process.exit(1);
	}
}

main();
