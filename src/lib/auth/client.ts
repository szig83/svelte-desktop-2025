import { createAuthClient } from 'better-auth/svelte';
export const authClient = createAuthClient({});
export type AuthClient = typeof authClient;
