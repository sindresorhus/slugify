import {expectType} from 'tsd-check';
import slugify from '.';

expectType<string>(slugify('I ♥ Dogs'));
expectType<string>(slugify('BAR and baz', {separator: '_'}));
expectType<string>(slugify('Déjà Vu!', {lowercase: false}));
expectType<string>(slugify('fooBar', {decamelize: false}));
expectType<string>(
	slugify('I ♥ 🦄 & 🐶', {customReplacements: [['🐶', 'dog']]})
);
