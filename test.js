import test from 'ava';
import slugify, {slugifyWithCounter} from './index.js';

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
	t.is(slugify('FOOBar'), 'foo-bar');
	t.is(slugify('APIs'), 'apis');
	t.is(slugify('APISection'), 'api-section');
	t.is(slugify('Util APIs'), 'util-apis');
});

test('custom separator', t => {
	t.is(slugify('foo bar', {separator: '_'}), 'foo_bar');
	t.is(slugify('aaa bbb', {separator: ''}), 'aaabbb');
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
	t.is(slugify('ș Ț', {lowercase: false, separator: ' '}), 's T');
});

test('supports Turkish', t => {
	t.is(slugify('İ ı Ş ş Ç ç Ğ ğ', {lowercase: false, separator: ' '}), 'I i S s C c G g');
});

test('supports Armenian', t => {
	t.is(slugify('Ե ր ե ւ ա ն', {lowercase: false, separator: ' '}), 'Ye r ye a n');
});

test('leading underscore', t => {
	t.is(slugify('_foo bar', {preserveLeadingUnderscore: true}), '_foo-bar');
	t.is(slugify('_foo_bar', {preserveLeadingUnderscore: true}), '_foo-bar');
	t.is(slugify('__foo__bar', {preserveLeadingUnderscore: true}), '_foo-bar');
	t.is(slugify('____-___foo__bar', {preserveLeadingUnderscore: true}), '_foo-bar');
});

test('trailing dash', t => {
	t.is(slugify('foo bar-', {preserveTrailingDash: true}), 'foo-bar-');
	t.is(slugify('foo-bar--', {preserveTrailingDash: true}), 'foo-bar-');
	t.is(slugify('foo-bar -', {preserveTrailingDash: true}), 'foo-bar-');
	t.is(slugify('foo-bar - ', {preserveTrailingDash: true}), 'foo-bar');
	t.is(slugify('foo-bar ', {preserveTrailingDash: true}), 'foo-bar');
});

test('counter', t => {
	const slugify = slugifyWithCounter();
	t.is(slugify('foo bar'), 'foo-bar');
	t.is(slugify('foo bar'), 'foo-bar-2');

	slugify.reset();

	t.is(slugify('foo'), 'foo');
	t.is(slugify('foo'), 'foo-2');
	t.is(slugify('foo 1'), 'foo-1');
	t.is(slugify('foo-1'), 'foo-1-2');
	t.is(slugify('foo-1'), 'foo-1-3');
	t.is(slugify('foo'), 'foo-3');
	t.is(slugify('foo'), 'foo-4');
	t.is(slugify('foo-1'), 'foo-1-4');
	t.is(slugify('foo-2'), 'foo-2-1');
	t.is(slugify('foo-2'), 'foo-2-2');
	t.is(slugify('foo-2-1'), 'foo-2-1-1');
	t.is(slugify('foo-2-1'), 'foo-2-1-2');
	t.is(slugify('foo-11'), 'foo-11-1');
	t.is(slugify('foo-111'), 'foo-111-1');
	t.is(slugify('foo-111-1'), 'foo-111-1-1');
	t.is(slugify('fooCamelCase', {lowercase: false, decamelize: false}), 'fooCamelCase');
	t.is(slugify('fooCamelCase', {decamelize: false}), 'foocamelcase-2');
	t.is(slugify('_foo'), 'foo-5');
	t.is(slugify('_foo', {preserveLeadingUnderscore: true}), '_foo');
	t.is(slugify('_foo', {preserveLeadingUnderscore: true}), '_foo-2');

	const slugify2 = slugifyWithCounter();
	t.is(slugify2('foo'), 'foo');
	t.is(slugify2('foo'), 'foo-2');

	t.is(slugify2(''), '');
	t.is(slugify2(''), '');
});

test('preserve characters', t => {
	t.is(slugify('foo#bar', {preserveCharacters: []}), 'foo-bar');
	t.is(slugify('foo.bar', {preserveCharacters: []}), 'foo-bar');
	t.is(slugify('foo?bar ', {preserveCharacters: ['#']}), 'foo-bar');
	t.is(slugify('foo#bar', {preserveCharacters: ['#']}), 'foo#bar');
	t.is(slugify('foo_bar#baz', {preserveCharacters: ['#']}), 'foo-bar#baz');
	t.is(slugify('foo.bar#baz-quux', {preserveCharacters: ['.', '#']}), 'foo.bar#baz-quux');
	t.is(slugify('foo.bar#baz-quux', {separator: '.', preserveCharacters: ['-']}), 'foo.bar.baz-quux');
	t.throws(() => {
		slugify('foo', {separator: '-', preserveCharacters: ['-']});
	});
	t.throws(() => {
		slugify('foo', {separator: '.', preserveCharacters: ['.']});
	});
	// Not implicit-whitelist-approved
	t.is(slugify('foo$bar', {preserveCharacters: ['$']}), 'foo-bar');
});
