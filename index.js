import escapeStringRegexp from 'escape-string-regexp';
import transliterate from '@sindresorhus/transliterate';
import builtinOverridableReplacements from './overridable-replacements.js';

const decamelize = string => {
	return string
		// Separate capitalized words.
		.replace(/([A-Z]{2,})(\d+)/g, '$1 $2')
		.replace(/([a-z\d]+)([A-Z]{2,})/g, '$1 $2')

		.replace(/([a-z\d])([A-Z])/g, '$1 $2')
		.replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1 $2');
};

const removeMootSeparators = (string, separator) => {
	const escapedSeparator = escapeStringRegexp(separator);

	return string
		.replace(new RegExp(`${escapedSeparator}{2,}`, 'g'), separator)
		.replace(new RegExp(`^${escapedSeparator}|${escapedSeparator}$`, 'g'), '');
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
		...options
	};

	const shouldPrependUnderscore = options.preserveLeadingUnderscore && string.startsWith('_');
	const shouldAppendDash = options.preserveTrailingDash && string.endsWith('-');

	const customReplacements = new Map([
		...builtinOverridableReplacements,
		...options.customReplacements
	]);

	string = transliterate(string, {customReplacements});

	if (options.decamelize) {
		string = decamelize(string);
	}

	let patternCharacters = ['a-z', 'A-Z', '\\d'];

	if (options.lowercase) {
		string = string.toLowerCase();
		patternCharacters = patternCharacters.filter(char => char !== 'A-Z');
	}

	if (options.preserveCharacters.length > 0) {
		const preserveCharacters = options.preserveCharacters.map(char => escapeStringRegexp(char));
		patternCharacters = [...patternCharacters, ...preserveCharacters];
	}

	const patternSlug = new RegExp(`[^${patternCharacters.join('')}]`,'g')

	string = string.replace(patternSlug, options.separator);

	string = string.replace(/\\/g, '');
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
