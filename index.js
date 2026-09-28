import escapeStringRegexp from 'escape-string-regexp';
import transliterate from '@sindresorhus/transliterate';
import builtinOverridableReplacements from './overridable-replacements.js';

const decamelize = string => string
	// Separate capitalized words.
	// Each pattern captures the least leading context it needs, as a greedy quantifier there causes quadratic backtracking on long runs of the same character class.
	// `FOO360` → `FOO 360`
	.replaceAll(/(?<acronym>[A-Z]{2})(?<digits>\d+)/gv, '$<acronym> $<digits>')
	// `foo360BAR` → `foo360 BAR`, `fooBar` → `foo Bar`
	.replaceAll(/(?<word>[\da-z])(?<uppercase>[A-Z])/gv, '$<word> $<uppercase>')
	// `APISection` → `API Section`. A lowercase `s` right after the acronym is a plural marker rather than the start of a new word, unless another lowercase letter follows it, so `APIs` is left alone while `APIUsage` is still separated.
	.replaceAll(/(?<acronymHead>[A-Z])(?<rest>[A-Z](?!s(?![a-z]))[\da-z]+)/gv, '$<acronymHead> $<rest>');

const removeMootSeparators = (string, separator) => {
	const escapedSeparator = escapeStringRegexp(separator);

	// The replacement is a function so a separator containing `$` is inserted literally instead of being read as a replacement pattern.
	return string
		.replaceAll(new RegExp(`(?:${escapedSeparator}){2,}`, 'gv'), () => separator)
		.replaceAll(new RegExp(`^(?:${escapedSeparator})|(?:${escapedSeparator})$`, 'gv'), '');
};

// Strip the trailing counter groups from a slug, so `foo-1-2` becomes `foo`. This is done with a split rather than a `(?:-\d+)+$` regex, as that pattern is unanchored and so retries at every `-` in the string, which is quadratic on input such as `-1-1-1…-1a`.
const removeCounterSuffix = string => {
	const parts = string.split('-');

	while (parts.length > 1 && /^\d+$/v.test(parts.at(-1))) {
		parts.pop();
	}

	return parts.join('-');
};

const buildPatternSlug = options => {
	let negationSetPattern = String.raw`a-z\d`;
	negationSetPattern += options.lowercase ? '' : 'A-Z';

	// When transliteration is disabled, preserve Unicode characters
	if (options.transliterate === false) {
		negationSetPattern += String.raw`\p{L}\p{N}`;
	}

	for (const character of options.preserveCharacters) {
		if (character === options.separator) {
			throw new Error(`The separator character \`${options.separator}\` cannot be included in preserved characters: ${options.preserveCharacters}`);
		}

		negationSetPattern += escapeStringRegexp(character);
	}

	const flags = options.transliterate ? 'g' : 'gv';
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
	} else {
		// Apply custom replacements even when transliteration is disabled
		for (const [key, value] of options.customReplacements) {
			// A replacement value keeps `replaceAll`'s replacement-pattern semantics here, so that this branch agrees with the transliterating one, where `@sindresorhus/transliterate` applies the same replacements the same way. Escaping `$` would make the two branches disagree.
			// eslint-disable-next-line unicorn/no-unsafe-string-replacement
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

	// Drop the apostrophe from contractions and possessives so that `Conway's Law` becomes `conways-law` rather than `conway-s-law`. Only a word-final `'t` or `'s` qualifies, so `foo'sbar` is left alone, and both straight and curly apostrophes are handled. What counts as a word character has to be what survives into the slug, so it widens to Unicode alongside `buildPatternSlug` when transliteration is disabled. The `i` flag covers `DON'T` when the `lowercase` option is disabled.
	const contractionPattern = options.transliterate
		? /(?<word>[\da-z])['\u{2019}](?<ending>[st])(?![\da-z])/giv
		: /(?<word>[\p{Letter}\p{Number}])['\u{2019}](?<ending>[st])(?![\p{Letter}\p{Number}])/giv;

	string = string.replaceAll(contractionPattern, '$<word>$<ending>');

	// The replacement is a function so a separator containing `$` is inserted literally instead of being read as a replacement pattern.
	string = string.replace(patternSlug, () => options.separator);
	string = string.replaceAll('\\', '');

	if (options.separator) {
		string = removeMootSeparators(string, options.separator);
	}

	if (shouldPrependUnderscore) {
		string = `_${string}`;
	}

	if (shouldAppendDash) {
		string += '-';
	}

	return string;
}

export function slugifyWithCounter() {
	const occurrences = new Map();
	const returned = new Set();

	const countable = (string, options) => {
		string = slugify(string, options);

		if (!string) {
			return '';
		}

		const stringLower = string.toLowerCase();
		const numberless = occurrences.get(removeCounterSuffix(stringLower)) || 0;
		const counter = occurrences.get(stringLower);
		occurrences.set(stringLower, typeof counter === 'number' ? counter + 1 : 1);
		let newCounter = occurrences.get(stringLower) || 2;
		let result = newCounter >= 2 || numberless > 2 ? `${string}-${newCounter}` : string;

		// The counter is keyed on the incoming slug, so it cannot see a slug that was previously handed out by appending a counter to a *different* input. Without this loop, `foo`, `foo`, `foo 2` would return `foo-2` twice. Keep bumping the counter until the result is one that has not been returned before.
		while (returned.has(result.toLowerCase())) {
			newCounter += 1;
			occurrences.set(stringLower, newCounter);
			result = `${string}-${newCounter}`;
		}

		returned.add(result.toLowerCase());

		return result;
	};

	countable.reset = () => {
		occurrences.clear();
		returned.clear();
	};

	return countable;
}
