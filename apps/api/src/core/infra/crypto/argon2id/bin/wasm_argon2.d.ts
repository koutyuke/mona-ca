/* tslint:disable */
/* eslint-disable */
/**
* @param {string} password
* @param {HashOptions | undefined} [options]
* @returns {string}
*/
export function hash(password: string, options?: HashOptions): string;
/**
* @param {string} password
* @param {string} hash
* @returns {boolean}
*/
export function verify(password: string, hash: string): boolean;
/**
*/
export class HashOptions {
  free(): void;
/**
*/
  memory_cost: number;
/**
*/
  parallelism: number;
/**
*/
  time_cost: number;
}
