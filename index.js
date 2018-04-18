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
		.replace(/&/, ' and ')
		.replace(/🦄/, ' unicorn ')
		.replace(/♥/, ' love ');

	string = string.toLowerCase();

	string = string.replace(/[^a-z\d]+/g, '-');

	string = string
		// Remove duplicate separators
		.replace(new RegExp(`${separator}{2,}`, 'g'), separator)
		// Remove separator from start and end
		.replace(new RegExp(`^${separator}|${separator}$`, 'g'), '');

	return string;
};
