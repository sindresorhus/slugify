import {expectType} from 'tsd';
import slugify = require('.');

expectType<string>(slugify('I ♥ Dogs'));
expectType<string>(slugify('BAR and baz', {separator: '_'}));
expectType<string>(slugify('Déjà Vu!', {lowercase: false}));
expectType<string>(slugify('fooBar', {decamelize: false}));
expectType<string>(slugify('I ♥ 🦄 & 🐶', {customReplacements: [['🐶', 'dog']]}));
expectType<string>(slugify('_foo_bar', {preserveLeadingUnderscore: true}));

// Counter
expectType<string>(slugify.counter()('I ♥ Dogs'));
expectType<void>(slugify.counter().reset()); // eslint-disable-line @typescript-eslint/no-invalid-void-type
