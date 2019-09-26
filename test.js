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
	const dict = require('./dictionaries/german');
	t.is(slugify('ä ö ü Ä Ö Ü ß', {lowercase: false, separator: ' ', dictionaries: [dict]}), 'ae oe ue Ae Oe Ue ss');
});

test('supports Swedish', t => {
	const dict = require('./dictionaries/swedish');
	t.is(slugify('ä ö Ä Ö', {lowercase: false, separator: ' ', dictionaries: [dict]}), 'a o A O');
});

test('supports Vietnamese', t => {
	const dict = require('./dictionaries/vietnamese');
	t.is(slugify('ố Ừ Đ', {lowercase: false, separator: ' ', dictionaries: [dict]}), 'o U D');
});

test('supports Arabic', t => {
	const dict = require('./dictionaries/arabic');
	t.is(slugify('ث س و', {lowercase: false, separator: ' ', dictionaries: [dict]}), 'th s w');
});

test('supports Persian / Farsi', t => {
	const dict = require('./dictionaries/persian');
	t.is(slugify('چ ی پ', {lowercase: false, separator: ' ', dictionaries: [dict]}), 'ch y p');
});

test('supports Urdu', t => {
	const dict = require('./dictionaries/urdu');
	t.is(slugify('ٹ ڈ ھ', {lowercase: false, separator: ' ', dictionaries: [dict]}), 't d h');
});

test('supports Pashto', t => {
	const dict = require('./dictionaries/pashto');
	t.is(slugify('ګ ړ څ', {lowercase: false, separator: ' ', dictionaries: [dict]}), 'g r c');
});

test('supports Russian', t => {
	const dict = require('./dictionaries/russian');
	t.is(slugify('Ж п ю', {lowercase: false, separator: ' ', dictionaries: [dict]}), 'Zh p yu');
});

test('supports Romanian', t => {
	const dict = require('./dictionaries/romanian');
	t.is(slugify('ș Ț', {lowercase: false, separator: ' ', dictionaries: [dict]}), 's t');
});

test('supports Turkish', t => {
	const dict = require('./dictionaries/turkish');
	t.is(slugify('İ ı Ş ş Ç ç Ğ ğ', {lowercase: false, separator: ' ', dictionaries: [dict]}), 'i i s s c c g g');
});

test('supports Armenian', t => {
	const dict = require('./dictionaries/armenian');
	t.is(slugify('ա թ խ', {lowercase: false, separator: ' ', dictionaries: [dict]}), 'a t kh');
});

test('supports Georgian', t => {
	const dict = require('./dictionaries/georgian');
	t.is(slugify('ა ბ გ', {lowercase: false, separator: ' ', dictionaries: [dict]}), 'a b g');
});

test('supports Latin', t => {
	const dict = require('./dictionaries/latin');
	t.is(slugify('Ä Ð Ø', {lowercase: false, separator: ' ', dictionaries: [dict]}), 'Ae D O');
});

test('supports Czech', t => {
	const dict = require('./dictionaries/czech');
	t.is(slugify('č ž Ň', {lowercase: false, separator: ' ', dictionaries: [dict]}), 'c z N');
});

test('supports Dhivehi', t => {
	const dict = require('./dictionaries/dhivehi');
	t.is(slugify('ޝ ޓ ބ', {lowercase: false, separator: ' ', dictionaries: [dict]}), 'sh t b');
});

test('supports Greek', t => {
	const dict = require('./dictionaries/greek');
	t.is(slugify('θ Γ Ξ', {lowercase: false, separator: ' ', dictionaries: [dict]}), 'th G KS');
});

test('supports Latvian', t => {
	const dict = require('./dictionaries/latvian');
	t.is(slugify('ā Ņ Ģ', {lowercase: false, separator: ' ', dictionaries: [dict]}), 'a N G');
});

test('supports Macedonian', t => {
	const dict = require('./dictionaries/macedonian');
	t.is(slugify('Ќ љ Тс', {lowercase: false, separator: ' ', dictionaries: [dict]}), 'Kj lj Ts');
});

test('supports Polish', t => {
	const dict = require('./dictionaries/polish');
	t.is(slugify('ą Ą Ł', {lowercase: false, separator: ' ', dictionaries: [dict]}), 'a A L');
});

test('supports Ukrainian', t => {
	const dict = require('./dictionaries/ukrainian');
	t.is(slugify('Є Ґ ї', {lowercase: false, separator: ' ', dictionaries: [dict]}), 'Ye G yi');
});

test('supports Serbian', t => {
	const dict = require('./dictionaries/serbian');
	t.is(slugify('ђ џ Ђ Љ', {lowercase: false, separator: ' ', dictionaries: [dict]}), 'dj dz Dj Lj');
});

test('supports Slovak', t => {
	const dict = require('./dictionaries/slovak');
	t.is(slugify('ľ Ľ Ŕ', {lowercase: false, separator: ' ', dictionaries: [dict]}), 'l L R');
});

test('supports Hungarian', t => {
	const dict = require('./dictionaries/hungarian');
	t.is(slugify('ű ö Ö', {lowercase: false, separator: ' ', dictionaries: [dict]}), 'u o O');
});

test('supports Lithuanian', t => {
	const dict = require('./dictionaries/lithuanian');
	t.is(slugify('ą į Š', {lowercase: false, separator: ' ', dictionaries: [dict]}), 'a i S');
});

test('supports a list of dictionary', t => {
	const arabic = require('./dictionaries/arabic');
	const swedish = require('./dictionaries/swedish');
	const vietnamese = require('./dictionaries/vietnamese');
	t.is(slugify('ä Đ س', {lowercase: false, separator: ' ', dictionaries: [arabic, swedish, vietnamese]}), 'a D s');
});
