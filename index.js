import escapeStringRegexp from 'escape-string-regexp';
import transliterate from '@sindresorhus/transliterate';
import builtinOverridableReplacements from './overridable-replacements.js';

const decamelize = string => string
	// Separate capitalized words.
	// Each pattern captures the least leading context it needs, as a greedy quantifier there causes quadratic backtracking on long runs of the same character class.
	// `FOO360` → `FOO 360`
	.replaceAll(/([A-Z]{2})(\d+)/g, '$1 $2')
	// `foo360BAR` → `foo360 BAR`, `fooBar` → `foo Bar`
	.replaceAll(/([a-z\d])([A-Z])/g, '$1 $2')
	// `APISection` → `API Section`. A lowercase `s` right after the acronym is a plural marker rather than the start of a new word, unless another lowercase letter follows it, so `APIs` is left alone while `APIUsage` is still separated.
	.replaceAll(/([A-Z])([A-Z](?!s(?![a-z]))[a-z\d]+)/g, '$1 $2');

const removeMootSeparators = (string, separator) => {
	const escapedSeparator = escapeStringRegexp(separator);

	return string
		.replaceAll(new RegExp(`(?:${escapedSeparator}){2,}`, 'g'), separator)
		.replaceAll(new RegExp(`^(?:${escapedSeparator})|(?:${escapedSeparator})$`, 'g'), '');
};

const buildPatternSlug = options => {
	let negationSetPattern = String.raw`a-z\d`;
	negationSetPattern += options.lowercase ? '' : 'A-Z';

	// When transliteration is disabled, preserve Unicode characters
	if (options.transliterate === false) {
		negationSetPattern += String.raw`\p{L}\p{N}`;
	}

	if (options.preserveCharacters.length > 0) {
		for (const character of options.preserveCharacters) {
			if (character === options.separator) {
				throw new Error(`The separator character \`${options.separator}\` cannot be included in preserved characters: ${options.preserveCharacters}`);
			}

			negationSetPattern += escapeStringRegexp(character);
		}
	}

	const flags = options.transliterate ? 'g' : 'gu';
	return new RegExp(`[^${negationSetPattern}]+`, flags);
};

export default function slugify(string, options) {
	if (typeof string !== 'string') {
		throw new TypeError(`Expected a string, got \`${typeof string}\``);
	}

	options = {
		separator: '-',
		lowercase: true,
		decamelize: true,
		customReplacements: [],
		preserveLeadingUnderscore: false,
		preserveTrailingDash: false,
		preserveCharacters: [],
		transliterate: true,
		...options,
	};

	const shouldPrependUnderscore = options.preserveLeadingUnderscore && string.startsWith('_');
	const shouldAppendDash = options.preserveTrailingDash && string.endsWith('-');

	if (options.transliterate) {
		const customReplacements = new Map([
			...builtinOverridableReplacements,
			...options.customReplacements,
		]);

		string = transliterate(string, {customReplacements, locale: options.locale});
	} else if (options.customReplacements.length > 0) {
		// Apply custom replacements even when transliteration is disabled
		for (const [key, value] of options.customReplacements) {
			string = string.replaceAll(key, value);
		}
	}

	if (options.decamelize) {
		string = decamelize(string);
	}

	const patternSlug = buildPatternSlug(options);

	if (options.lowercase) {
		string = options.locale ? string.toLocaleLowerCase(options.locale) : string.toLowerCase();
	}

	// Drop the apostrophe from contractions and possessives so that `Conway's Law` becomes `conways-law` rather than `conway-s-law`. Only a word-final `'t` or `'s` qualifies, and both straight and curly apostrophes are handled.
	string = string.replaceAll(/([a-zA-Z\d])['\u2019]([ts])(\s|$)/g, '$1$2$3');

	string = string.replace(patternSlug, options.separator);
	string = string.replaceAll('\\', '');

	if (options.separator) {
		string = removeMootSeparators(string, options.separator);
	}

	if (shouldPrependUnderscore) {
		string = `_${string}`;
	}

	if (shouldAppendDash) {
		string = `${string}-`;
	}

	return string;
}

export function slugifyWithCounter() {
	const occurrences = new Map();

	const countable = (string, options) => {
		string = slugify(string, options);

		if (!string) {
			return '';
		}

		const stringLower = string.toLowerCase();
		const numberless = occurrences.get(stringLower.replace(/(?:-\d+?)+?$/, '')) || 0;
		const counter = occurrences.get(stringLower);
		occurrences.set(stringLower, typeof counter === 'number' ? counter + 1 : 1);
		const newCounter = occurrences.get(stringLower) || 2;
		if (newCounter >= 2 || numberless > 2) {
			string = `${string}-${newCounter}`;
		}

		return string;
	};

	countable.reset = () => {
		occurrences.clear();
	};

	return countable;
}
