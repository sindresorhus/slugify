export interface Options {
	/**
	 * @default "-"
	 *
	 * @example
	 *
	 * slugify('BAR and baz');
	 * //=> 'bar-and-baz'
	 *
	 * slugify('BAR and baz', {separator: '_'});
	 * //=> 'bar_and_baz'
	 */
	readonly separator?: string;

	/**
	 * Make the slug lowercase.
	 *
	 * @default true
	 *
	 * @example
	 *
	 * slugify('Déjà Vu!');
	 * //=> 'deja-vu'
	 *
	 * slugify('Déjà Vu!', {lowercase: false});
	 * //=> 'Deja-Vu'
	 */
	readonly lowercase?: boolean;

	/**
	 * Convert camelcase to separate words. Internally it does `fooBar` → `foo bar`.
	 *
	 * @default true
	 *
	 * @example
	 *
	 * slugify('fooBar');
	 * //=> 'foo-bar'
	 *
	 * slugify('fooBar', {decamelize: false});
	 * //=> 'foobar'
	 */
	readonly decamelize?: boolean;

	/**
	 * Specifying this only replaces the default if you set an item with the same key, like `&`.
	 * The replacements are run on the original string before any other transformations.
	 *
	 * Add a leading and trailing space to the replacement to have it separated by dashes.
	 *
	 * @default [ ['&', ' and '], ['🦄', ' unicorn '], ['♥', ' love '] ]
	 *
	 * @example
	 *
	 * slugify('Foo@unicorn', {
	 * 	customReplacements: [
	 * 		['@', 'at']
	 * 	]
	 * });
	 * //=> 'fooatunicorn'
	 *
	 * slugify('foo@unicorn', {
	 * 	customReplacements: [
	 * 		['@', ' at ']
	 * 	]
	 * });
	 * //=> 'foo-at-unicorn'
	 */
	readonly customReplacements?: ReadonlyArray<[string, string]>;
}

/**
 * Slugify a string.
 *
 * @param input - The string to slugify.
 */
declare function slugify(input: string, options?: Options): string;
