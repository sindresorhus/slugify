import escapeStringRegexp from 'escape-string-regexp';
import transliterate from '@sindresorhus/transliterate';
import builtinOverridableReplacements from './overridable-replacements.js';

// A combining mark belongs to the character before it, so each letter or digit is matched together with its marks. This keeps decomposed (NFD) text in one piece. Titlecase letters (`ǅ`, `ᾼ`) count as uppercase.
const uppercase = String.raw`[\p{Titlecase_Letter}\p{Uppercase_Letter}]\p{Mark}*`;
const lowercaseOrDigit = String.raw`[\p{Decimal_Number}\p{Lowercase_Letter}]\p{Mark}*`;

// Each pattern captures the least leading context it needs, as a greedy quantifier there causes quadratic backtracking on long runs of the same character class.
const separateAcronymFromDigits = new RegExp(String.raw`(?<acronym>(?:${uppercase}){2})(?<digits>\p{Decimal_Number}+)`, 'gv');
const separateWordFromUppercase = new RegExp(`(?<word>${lowercaseOrDigit})(?<uppercase>${uppercase})`, 'gv');
const separateAcronymFromWord = new RegExp(String.raw`(?<acronymHead>${uppercase})(?<rest>${uppercase}(?!s(?!\p{Mark}*\p{Lowercase_Letter}))(?:${lowercaseOrDigit})+)`, 'gv');

const decamelize = string => string
	// Separate capitalized words.
	// `FOO360` → `FOO 360`
	.replaceAll(separateAcronymFromDigits, '$<acronym> $<digits>')
	// `foo360BAR` → `foo360 BAR`, `fooBar` → `foo Bar`
	.replaceAll(separateWordFromUppercase, '$<word> $<uppercase>')
	// `APISection` → `API Section`. A lowercase `s` right after the acronym is a plural marker rather than the start of a new word, unless another lowercase letter follows it, so `APIs` is left alone while `APIUsage` is still separated.
	.replaceAll(separateAcronymFromWord, '$<acronymHead> $<rest>');

const normalize = string => {
	// Match transliterate's guard, as long combining-mark sequences can make native normalization take quadratic time.
	if (/\p{Mark}{101}/v.test(string)) {
		throw new RangeError('Cannot normalize more than 100 consecutive combining marks');
	}

	return string.normalize();
};

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

	// When transliteration is disabled, preserve Unicode characters, including combining marks
	if (options.transliterate === false) {
		negationSetPattern += String.raw`\p{L}\p{M}\p{N}`;
	}

	for (const character of options.preserveCharacters) {
		if (character === options.separator) {
			throw new Error(`The separator character \`${options.separator}\` cannot be included in preserved characters: ${options.preserveCharacters}`);
		}

		negationSetPattern += escapeStringRegexp(character);
	}

	// Not `v`, as `escapeStringRegexp` does not escape characters that a `v`-mode character class requires escaped, like `/` and `&&`. The `u` flag is enough for `\p{…}`.
	const flags = options.transliterate ? 'g' : 'gu';
	// Discard combining marks with a removed character so emoji do not leave orphaned variation selectors.
	const combiningMarksPattern = options.transliterate ? '' : String.raw`\p{M}*`;
	return new RegExp(`(?:[^${negationSetPattern}]${combiningMarksPattern})+`, flags);
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
		// An option set to `undefined` uses the default.
		...Object.fromEntries(Object.entries(options ?? {}).filter(([, value]) => value !== undefined)),
	};

	const shouldPrependUnderscore = options.preserveLeadingUnderscore && string.startsWith('_');
	const shouldAppendDash = options.preserveTrailingDash && string.endsWith('-');

	let {customReplacements} = options;
	if (options.transliterate) {
		customReplacements = Array.from(new Map([
			...builtinOverridableReplacements,
			...customReplacements,
		]), ([key, value]) => [normalize(key), value]).toSorted((a, b) => b[0].length - a[0].length);

		// Preserve transliterate's canonical key matching and longest-key-first replacement order.
		string = normalize(string);
	}

	// Apply custom replacements before decamelization, even when transliteration is disabled.
	for (const [key, value] of customReplacements) {
		// A replacement value keeps `replaceAll`'s replacement-pattern semantics, matching how `@sindresorhus/transliterate` applies the same replacements. Escaping `$` would change that behavior.
		// eslint-disable-next-line unicorn/no-unsafe-string-replacement
		string = string.replaceAll(key, value);
	}

	if (options.transliterate) {
		// Custom replacement values can be in any normalization form.
		string = normalize(string);
	}

	// Decamelization runs after custom replacements and before transliteration, as transliteration expands one character to several with a lower-case part (`Ü` → `Ue`), which would otherwise read as a camel-case boundary inside an upper-case word.
	if (options.decamelize) {
		string = decamelize(string);
	}

	if (options.transliterate) {
		string = transliterate(string, {locale: options.locale});
	}

	const patternSlug = buildPatternSlug(options);

	if (options.lowercase) {
		// The locale is only used without transliteration, as a transliterated string is ASCII and locale-aware lowercasing could make it non-ASCII again, like `I` to `ı` for Turkish.
		string = options.locale && !options.transliterate ? string.toLocaleLowerCase(options.locale) : string.toLowerCase();
	}

	// Drop the apostrophe from contractions and possessives so that `Conway's Law` becomes `conways-law` rather than `conway-s-law`. Only a word-final `'t` or `'s` qualifies, so `foo'sbar` is left alone, and both straight and curly apostrophes are handled. What counts as a word character has to be what survives into the slug, so it widens to Unicode alongside `buildPatternSlug` when transliteration is disabled. The `i` flag covers `DON'T` when the `lowercase` option is disabled.
	const contractionPattern = options.transliterate
		? /(?<word>[\da-z])['\u{2019}](?<ending>[st])(?![\da-z])/giv
		: /(?<word>[\p{Letter}\p{Mark}\p{Number}])['\u{2019}](?<ending>[st])(?![\p{Letter}\p{Mark}\p{Number}])/giv;

	string = string.replaceAll(contractionPattern, '$<word>$<ending>');

	// The replacement is a function so a separator containing `$` is inserted literally instead of being read as a replacement pattern.
	string = string.replace(patternSlug, () => options.separator);

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
