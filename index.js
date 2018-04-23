'use strict';
const deburr = require('lodash.deburr');
const escapeStringRegexp = require('escape-string-regexp');

const decamelize = string => {
	return string
		.replace(/([a-z\d])([A-Z])/g, `$1 $2`)
		.replace(/([A-Z]+)([A-Z][a-z\d]+)/g, `$1 $2`);
};

const customReplacements = new Map([
	['&', 'and'],
	['🦄', 'unicorn'],
	['♥', 'love']
]);

const doCustomReplacements = string => {
	for (const [key, value] of customReplacements) {
		string = string.replace(new RegExp(escapeStringRegexp(key), 'g'), ` ${value} `);
	}

	return string;
};

const removeMootSeparators = (string, separator) => {
	return string
		.replace(new RegExp(`${separator}{2,}`, 'g'), separator)
		.replace(new RegExp(`^${separator}|${separator}$`, 'g'), '');
};

module.exports = (string, options) => {
	if (typeof string !== 'string') {
		throw new TypeError(`Expected a string, got \`${typeof string}\``);
	}

	options = Object.assign({
		separator: '-'
	}, options);

	const separator = escapeStringRegexp(options.separator);

	string = deburr(string);
	string = decamelize(string);
	string = doCustomReplacements(string);
	string = string.toLowerCase();
	string = string.replace(/[^a-z\d]+/g, separator);
	string = string.replace(/\\/g, '');
	string = removeMootSeparators(string, separator);

	return string;
};
