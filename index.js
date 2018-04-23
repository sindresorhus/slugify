'use strict';
const deburr = require('lodash.deburr');

const separator = '-';

const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)));

const curry2 = fn => a1 => a2 => fn(a1, a2);

const insertSeparator =
	curry2(
		(separator, string) => string.replace(/[^a-z\d]+/g, separator)
	);

const removeDuplicateSeparator = curry2(
	(separator, string) => string
		.replace(new RegExp(`${separator}{2,}`, 'g'), separator)
		.replace(new RegExp(`^${separator}|${separator}$`, 'g'), '')
);

const toLowerCase = string => string.toLowerCase();

const fromNullable = string => string ? string : '';

const customReplacement = string => string
	.replace(/&/g, ' and ')
	.replace(/🦄/g, ' unicorn ')
	.replace(/♥/g, ' love ');

const decamelize = string => string
	.replace(/([a-z\d])([A-Z])/g, `$1 $2`)
	.replace(/([A-Z]+)([A-Z][a-z\d]+)/g, `$1 $2`);

module.exports = compose(
	removeDuplicateSeparator(separator),
	insertSeparator(separator),
	toLowerCase,
	customReplacement,
	decamelize,
	deburr,
	fromNullable
);
