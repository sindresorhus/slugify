'use strict';
const deburr = require('lodash.deburr');

module.exports = string => {
	const separator = '-';

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

	string = string.replace(/[^a-z\d]+/g, separator);

	string = string
		// Remove duplicate separators
		.replace(new RegExp(`${separator}{2,}`, 'g'), separator)
		// Remove separator from start and end
		.replace(new RegExp(`^${separator}|${separator}$`, 'g'), '');

	return string;
};
