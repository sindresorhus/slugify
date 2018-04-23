'use strict';
const deburr = require('lodash.deburr');
const escapeStringRegexp = require('escape-string-regexp');

module.exports = (string, opts) => {
	opts = Object.assign({separator: '-'}, opts);

	if (opts.separator) {
		opts.separator = escapeStringRegexp(opts.separator);
	}

	string = deburr(string);

	// Decamelize
	string = string
		.replace(/([a-z\d])([A-Z])/g, `$1 $2`)
		.replace(/([A-Z]+)([A-Z][a-z\d]+)/g, `$1 $2`);

	// Custom replacements
	string = string
		.replace(/&/g, ' and ')
		.replace(/🦄/g, ' unicorn ')
		.replace(/♥/g, ' love ');

	string = string.toLowerCase();

	string = string.replace(/[^a-z\d]+/g, opts.separator);

	string = string
		// Remove backslash
		.replace(new RegExp('\\\\', 'g'), '')
		// Remove duplicate separators
		.replace(new RegExp(`${opts.separator}{2,}`, 'g'), opts.separator)
		// Remove separator from start and end
		.replace(new RegExp(`^${opts.separator}|${opts.separator}$`, 'g'), '');

	return string;
};
