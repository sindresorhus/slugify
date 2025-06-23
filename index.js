```js
import escapeStringRegexp from 'escape-string-regexp';
import transliterate from '@sindresorhus/transliterate';
import builtinOverridableReplacements from './overridable-replacements.js';

const decamelize = (string) => {
  return string
    .replace(/([A-Z]{2,})(\d+)/g, '$1 $2')
    .replace(/([a-z\d]+)([A-Z]{2,})/g, '$1 $2')
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-rt-z\d]+)/g, '$1 $2');
};

const removeMootSeparators = (string, separator) => {
  const escapedSeparator = escapeStringRegexp(separator);
  return string
    .replace(new RegExp(`${escapedSeparator}{2,}`, 'g'), separator)
    .replace(new RegExp(`^${escapedSeparator}|${escapedSeparator}$`, 'g'), '');
};

const buildPatternSlug = (options) => {
  const negationSetPattern = [
    'a-z\\d',
    options.lowercase ? '' : 'A-Z',
    ...options.preserveCharacters.map((character) => {
      if (character === options.separator) {
        throw new Error(`The separator character \`${options.separator}\` cannot be included in preserved characters: ${options.preserveCharacters}`);
      }
      return escapeStringRegexp(character);
    }),
  ].join('');

  return new RegExp(`[^${negationSetPattern}]+`, 'g');
};

export default function slugify(string, options = {}) {
  if (typeof string !== 'string') {
    throw new TypeError(`Expected a string, got \`${typeof string}\``);
  }

  const defaults = {
    separator: '-',
    lowercase: true,
    decamelize: true,
    customReplacements: [],
    preserveLeadingUnderscore: false,
    preserveTrailingDash: false,
    preserveCharacters: [],
  };

  options = { ...defaults, ...options };

  const shouldPrependUnderscore = options.preserveLeadingUnderscore && string.startsWith('_');
  const shouldAppendDash = options.preserveTrailingDash && string.endsWith('-');

  const customReplacements = new Map([
    ...builtinOverridableReplacements,
    ...options.customReplacements,
  ]);

  string = transliterate(string, { customReplacements });

  if (options.decamelize) {
    string = decamelize(string);
  }

  const patternSlug = buildPatternSlug(options);

  string = options.lowercase ? string.toLowerCase() : string;

  string = string.replace(/([a-zA-Z\d]+)'([ts])(\s|$)/g, '$1$2$3'); // Remove contractions
  string = string.replace(patternSlug, options.separator).replace(/\\/g, '');

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

  const countable = (string, options) => {
    const slug = slugify(string, options);
    if (!slug) return '';

    const slugLower = slug.toLowerCase();
    const baseSlug = slugLower.replace(/(?:-\d+?)?$/, '');
    const numberlessCount = occurrences.get(baseSlug) || 0;
    const currentCount = occurrences.get(slugLower) || 0;

    occurrences.set(slugLower, currentCount + 1);
    const newCount = occurrences.get(slugLower) || 2;

    return newCount > 1 || numberlessCount > 0 ? `${slug}-${newCount}` : slug;
  };

  countable.reset = () => {
    occurrences.clear();
  };

  return countable;
}
```