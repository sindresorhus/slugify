```js
import test from 'ava';
import slugify, {slugifyWithCounter} from './index.js';

const runTestCases = (t, cases, slugifyFunc) => {
	cases.forEach(([input, expected]) => {
		t.is(slugifyFunc(input), expected);
	});
};

const runCustomSeparatorTests = (t, cases) => {
	cases.forEach(([input, separator, expected]) => {
		t.is(slugify(input, {separator}), expected);
	});
};

const runCustomReplacementsTests = (t, cases) => {
	cases.forEach(([input, replacements, expected]) => {
		t.is(slugify(input, {customReplacements: replacements}), expected);
	});
};

const runLowercaseOptionTests = (t, cases) => {
	cases.forEach(([input, separator, lowercase, expected]) => {
		if (separator) {
			t.is(slugify(input, {separator, lowercase}), expected);
		} else {
			t.is(slugify(input, {lowercase}), expected);
		}
	});
};

const runLeadingTrailingTests = (t, cases, func) => {
	cases.forEach(([input, flag, expected]) => {
		t.is(slugify(input, {[func]: flag}), expected);
	});
};

const runCounterTests = (t, slugifyCounter, cases) => {
	cases.forEach(([input, expected]) => {
		t.is(slugifyCounter(input), expected);
	});
};

test('main', t => {
	const cases = [
		['Foo Bar', 'foo-bar'],
		['foo bar baz', 'foo-bar-baz'],
		['foo bar ', 'foo-bar'],
		['       foo bar', 'foo-bar'],
		['[foo] [bar]', 'foo-bar'],
		['Foo ÿ', 'foo-y'],
		['FooBar', 'foo-bar'],
		['fooBar', 'foo-bar'],
		['UNICORNS AND RAINBOWS', 'unicorns-and-rainbows'],
		['Foo & Bar', 'foo-and-bar'],
		['Hællæ, hva skjera?', 'haellae-hva-skjera'],
		['Foo Bar2', 'foo-bar2'],
		['I ♥ Dogs', 'i-love-dogs'],
		['Déjà Vu!', 'deja-vu'],
		['fooBar 123 $#%', 'foo-bar-123'],
		['foo🦄', 'foo-unicorn'],
		['🦄🦄🦄', 'unicorn-unicorn-unicorn'],
		['foo&bar', 'foo-and-bar'],
		['foo360BAR', 'foo360-bar'],
		['FOO360', 'foo-360'],
		['FOOBar', 'foo-bar'],
		['APIs', 'apis'],
		['APISection', 'api-section'],
		['Util APIs', 'util-apis'],
	];

	runTestCases(t, cases, slugify);
});

test('possessives and contractions', t => {
	const cases = [
		["Conway's Law", 'conways-law'],
		["Conway's", 'conways'],
		["Don't Repeat Yourself", 'dont-repeat-yourself'],
		["my parents' rules", 'my-parents-rules'],
		["it-s-hould-not-modify-t-his", 'it-s-hould-not-modify-t-his'],
	];

	runTestCases(t, cases, slugify);
});

test('custom separator', t => {
	const cases = [
		['foo bar', '_', 'foo_bar'],
		['aaa bbb', '', 'aaabbb'],
		['BAR&baz', '_', 'bar_and_baz'],
		['Déjà Vu!', '-', 'deja-vu'],
		['UNICORNS AND RAINBOWS!', '@', 'unicorns@and@rainbows'],
		['[foo] [bar]', '.', 'foo.bar'],
	];

	runCustomSeparatorTests(t, cases);
});

test('custom replacements', t => {
	const cases = [
		['foo | bar', [['|', ' or ']], 'foo-or-bar'],
		['10 | 20 %', [['|', ' or '], ['%', ' percent ']], '10-or-20-percent'],
		['I ♥ 🦄', [['♥', ' amour '], ['🦄', ' licorne ']], 'i-amour-licorne'],
		['x.y.z', [['.', '']], 'xyz'],
		['Zürich', [['ä', 'ae'], ['ö', 'oe'], ['ü', 'ue'], ['ß', 'ss']], 'zuerich'],
	];

	runCustomReplacementsTests(t, cases);
});

test('lowercase option', t => {
	const cases = [
		['foo bar', false, 'foo-bar'],
		['BAR&baz', false, 'BAR-and-baz'],
		['Déjà Vu!', true, 'Deja_Vu'],
		['UNICORNS AND RAINBOWS!', '@', false, 'UNICORNS@AND@RAINBOWS'],
		['[foo] [bar]', '.', false, 'foo.bar'],
		['Foo🦄', false, 'Foo-unicorn'],
	];

	runLowercaseOptionTests(t, cases);
});

test('decamelize option', t => {
	const cases = [
		['fooBar', 'foo-bar'],
		['fooBar', false, 'foobar'],
	];

	runTestCases(t, cases, slugify);
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
	const cases = [
		['_foo bar', true, '_foo-bar'],
		['_foo_bar', true, '_foo-bar'],
		['__foo__bar', true, '_foo-bar'],
		['____-___foo__bar', true, '_foo-bar'],
	];

	runLeadingTrailingTests(t, cases, 'preserveLeadingUnderscore');
});

test('trailing dash', t => {
	const cases = [
		['foo bar-', true, 'foo-bar-'],
		['foo-bar--', true, 'foo-bar-'],
		['foo-bar -', true, 'foo-bar-'],
		['foo-bar - ', true, 'foo-bar'],
		['foo-bar ', true, 'foo-bar'],
	];

	runLeadingTrailingTests(t, cases, 'preserveTrailingDash');
});

test('counter', t => {
	const slugifyCounter = slugifyWithCounter();
	t.is(slugifyCounter('foo bar'), 'foo-bar');
	t.is(slugifyCounter('foo bar'), 'foo-bar-2');

	slugifyCounter.reset();

	const cases = [
		['foo', 'foo'],
		['foo', 'foo-2'],
		['foo 1', 'foo-1'],
		['foo-1', 'foo-1-2'],
		['foo-1', 'foo-1-3'],
		['foo', 'foo-3'],
		['foo', 'foo-4'],
		['foo-1', 'foo-1-4'],
		['foo-2', 'foo-2-1'],
		['foo-2', 'foo-2-2'],
		['foo-2-1', 'foo-2-1-1'],
		['foo-2-1', 'foo-2-1-2'],
		['foo-11', 'foo-11-1'],
		['foo-111', 'foo-111-1'],
		['foo-111-1', 'foo-111-1-1'],
		['fooCamelCase', {lowercase: false, decamelize: false}, 'fooCamelCase'],
		['fooCamelCase', {decamelize: false}, 'foocamelcase-2'],
		['_foo', 'foo-5'],
		['_foo', {preserveLeadingUnderscore: true}, '_foo'],
		['_foo', {preserveLeadingUnderscore: true}, '_foo-2'],
	];

	runCounterTests(t, slugifyCounter, cases);

	const slugify2 = slugifyWithCounter();
	t.is(slugify2('foo'), 'foo');
	t.is(slugify2('foo'), 'foo-2');
	t.is(slugify2(''), '');
	t.is(slugify2(''), '');
});

test('preserve characters', t => {
	const cases = [
		['foo#bar', [], 'foo-bar'],
		['foo.bar', [], 'foo-bar'],
		['foo?bar ', ['#'], 'foo-bar'],
		['foo#bar', ['#'], 'foo#bar'],
		['foo_bar#baz', ['#'], 'foo-bar#baz'],
		['foo.bar#baz-quux', ['.', '#'], 'foo.bar#baz-quux'],
		['foo.bar#baz-quux', {separator: '.', preserveCharacters: ['-']}, 'foo.bar.baz-quux'],
	];

	runCustomReplacementsTests(t, cases);

	t.throws(() => {
		slugify('foo', {separator: '-', preserveCharacters: ['-']});
	});
	t.throws(() => {
		slugify('foo', {separator: '.', preserveCharacters: ['.']});
	});
});
```