import {expectType} from 'tsd';
import slugify = require('.');

expectType<string>(slugify('I ♥ Dogs'));
expectType<string>(slugify('BAR and baz', {separator: '_'}));
expectType<string>(slugify('Déjà Vu!', {lowercase: false}));
expectType<string>(slugify('fooBar', {decamelize: false}));
expectType<string>(
	slugify('I ♥ 🦄 & 🐶', {customReplacements: [['🐶', 'dog']]})
);
