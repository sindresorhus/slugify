import test from 'ava';
import slugify from '.';

test('main', t => {
	t.is(slugify('Foo Bar'), 'foo-bar');
	t.is(slugify('foo bar baz'), 'foo-bar-baz');
	t.is(slugify('foo bar '), 'foo-bar');
	t.is(slugify('       foo bar'), 'foo-bar');
	t.is(slugify('[foo] [bar]'), 'foo-bar');
	t.is(slugify('Foo ÿ'), 'foo-y');
	t.is(slugify('FooBar'), 'foo-bar');
	t.is(slugify('fooBar'), 'foo-bar');
	t.is(slugify('UNICORNS AND RAINBOWS'), 'unicorns-and-rainbows');
	t.is(slugify('Foo & Bar'), 'foo-and-bar');
	t.is(slugify('Foo & Bar'), 'foo-and-bar');
	t.is(slugify('Hællæ, hva skjera?'), 'haellae-hva-skjera');
	t.is(slugify('Foo Bar2'), 'foo-bar2');
	t.is(slugify('I ♥ Dogs'), 'i-love-dogs');
	t.is(slugify('Déjà Vu!'), 'deja-vu');
	t.is(slugify('fooBar 123 $#%'), 'foo-bar-123');
	t.is(slugify('foo🦄'), 'foo-unicorn');
	t.is(slugify('🦄🦄🦄'), 'unicorn-unicorn-unicorn');
	t.is(slugify('foo&bar'), 'foo-and-bar');
	t.is(slugify('foo360BAR'), 'foo360-bar');
	t.is(slugify('FOO360'), 'foo-360');
	t.is(slugify('FOObar'), 'foo-bar');
});

test('custom separator', t => {
	t.is(slugify('foo bar', {separator: '_'}), 'foo_bar');
	t.is(slugify('BAR&baz', {separator: '_'}), 'bar_and_baz');
	t.is(slugify('Déjà Vu!', {separator: '-'}), 'deja-vu');
	t.is(slugify('UNICORNS AND RAINBOWS!', {separator: '@'}), 'unicorns@and@rainbows');
	t.is(slugify('[foo] [bar]', {separator: '.'}), 'foo.bar', 'escape regexp special characters');
});

test('custom replacements', t => {
	t.is(slugify('foo | bar', {
		customReplacements: [
			['|', ' or ']
		]
	}), 'foo-or-bar');

	t.is(slugify('10 | 20 %', {
		customReplacements: [
			['|', ' or '],
			['%', ' percent ']
		]
	}), '10-or-20-percent');

	t.is(slugify('I ♥ 🦄', {
		customReplacements: [
			['♥', ' amour '],
			['🦄', ' licorne ']
		]
	}), 'i-amour-licorne');

	t.is(slugify('x.y.z', {
		customReplacements: [
			['.', '']
		]
	}), 'xyz');

	t.is(slugify('Zürich', {
		customReplacements: [
			['ä', 'ae'],
			['ö', 'oe'],
			['ü', 'ue'],
			['ß', 'ss']
		]
	}), 'zuerich');
});

test('lowercase option', t => {
	t.is(slugify('foo bar', {lowercase: false}), 'foo-bar');
	t.is(slugify('BAR&baz', {lowercase: false}), 'BAR-and-baz');
	t.is(slugify('Déjà Vu!', {separator: '_', lowercase: false}), 'Deja_Vu');
	t.is(slugify('UNICORNS AND RAINBOWS!', {separator: '@', lowercase: false}), 'UNICORNS@AND@RAINBOWS');
	t.is(slugify('[foo] [bar]', {separator: '.', lowercase: false}), 'foo.bar', 'escape regexp special characters');
	t.is(slugify('Foo🦄', {lowercase: false}), 'Foo-unicorn');
});

test('decamelize option', t => {
	t.is(slugify('fooBar'), 'foo-bar');
	t.is(slugify('fooBar', {decamelize: false}), 'foobar');
});

test('supports German umlauts', t => {
	t.is(slugify('ä ö ü Ä Ö Ü ß', {lowercase: false, separator: ' '}), 'ae oe ue Ae Oe Ue ss');
});

test('supports Vietnamese', t => {
	t.is(slugify('ố Ừ Đ', {lowercase: false, separator: ' '}), 'o U D');
});

test('supports Arabic', t => {
	t.is(slugify('ث س و', {lowercase: false, separator: ' '}), 'th s w');
});

test('supports Persian / Farsi', t => {
	t.is(slugify('چ ی پ', {lowercase: false, separator: ' '}), 'ch y p');
});

test('supports Urdu', t => {
	t.is(slugify('ٹ ڈ ھ', {lowercase: false, separator: ' '}), 't d h');
});

test('supports Pashto', t => {
	t.is(slugify('ګ ړ څ', {lowercase: false, separator: ' '}), 'g r c');
});

test('supports Russian', t => {
	t.is(slugify('Ж п ю', {lowercase: false, separator: ' '}), 'Zh p yu');
});

test('supports Romanian', t => {
	t.is(slugify('ș Ț', {lowercase: false, separator: ' '}), 's t');
});

test('supports Turkish', t => {
	t.is(slugify('İ ı Ş ş Ç ç Ğ ğ', {lowercase: false, separator: ' '}), 'i i s s c c g g');
});

test('supports Armenian', t => {
	t.is(slugify('Ե ր ե ւ ա ն', {lowercase: false, separator: ' '}), 're ye v a n');
});

test('leading underscore', t => {
	t.is(slugify('_foo bar', {leadingUnderscore: true}), '_foo-bar');
	t.is(slugify('_foo_bar', {leadingUnderscore: true}), '_foo-bar');
});
