import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as v from 'valibot';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

/**
 * @packageDocumentation
 * Szerver és kliens oldalon is használható segéd függvények, típusok
 */

/**
 * A bemeneti string első karakterét nagybetűsre alakítja.
 * @param input Átalakítandó string.
 * @returns Átalakított string.
 */
export function capitalizeFirstLetter(input: string): string {
	if (input.length === 0) return input;
	return input.charAt(0).toUpperCase() + input.slice(1);
}

/**
 * Nyelvi lokalizációhoz szükséges típus
 */
export type LocalizedText = {
	hu: string;
	en: string;
	[key: string]: string; // További nyelvek
};

/**
 * Nyelvi lokalizációhoz szükséges validációs valibot schema
 */
export const localizedTextSchema = v.intersect([
	v.object({
		hu: v.pipe(v.string(), v.minLength(1)),
		en: v.pipe(v.string(), v.minLength(1))
	}),
	v.record(v.string(), v.string()) // Bármilyen további nyelv is megengedett
]);
