'use strict';
const deburr = require('lodash.deburr');
const flatten = require('lodash.flatten');
const escapeStringRegexp = require('escape-string-regexp');
const specialCharsReplacements = require('./dictionaries/special-chars');

const decamelize = string => {
	return string
		.replace(/([a-z\d])([A-Z])/g, '$1 $2')
		.replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1 $2');
};

const doCustomReplacements = (string, replacements) => {
	for (const [key, value] of replacements) {
		string = string.replace(new RegExp(escapeStringRegexp(key), 'g'), value);
	}

	return string;
};

const removeMootSeparators = (string, separator) => {
	return string
		.replace(new RegExp(`${separator}{2,}`, 'g'), separator)
		.replace(new RegExp(`^${separator}|${separator}$`, 'g'), '');
};

const slugify = (string, options) => {
	if (typeof string !== 'string') {
		throw new TypeError(`Expected a string, got \`${typeof string}\``);
	}

	options = {
		separator: '-',
		lowercase: true,
		decamelize: true,
		dictionaries: [],
		customReplacements: [],
		...options
	};

	const separator = escapeStringRegexp(options.separator);
	const customReplacements = new Map([
		...flatten(options.dictionaries),
		...specialCharsReplacements,
		...options.customReplacements
	]);

	string = doCustomReplacements(string, customReplacements);
	string = deburr(string);
	string = string.normalize('NFKD');

	if (options.decamelize) {
		string = decamelize(string);
	}

	let patternSlug = /[^a-zA-Z\d]+/g;

	if (options.lowercase) {
		string = string.toLowerCase();
		patternSlug = /[^a-z\d]+/g;
	}

	string = string.replace(patternSlug, separator);
	string = string.replace(/\\/g, '');
	string = removeMootSeparators(string, separator);

	return string;
};

module.exports = slugify;
// TODO: Remove this for the next major release
module.exports.default = slugify;
