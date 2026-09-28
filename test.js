import test from 'node:test';
import assert from 'node:assert/strict';
import slugify, {slugifyWithCounter} from './index.js';

test('main', () => {
	assert.equal(slugify('Foo Bar'), 'foo-bar');
	assert.equal(slugify('foo bar baz'), 'foo-bar-baz');
	assert.equal(slugify('foo bar '), 'foo-bar');
	assert.equal(slugify('       foo bar'), 'foo-bar');
	assert.equal(slugify('[foo] [bar]'), 'foo-bar');
	assert.equal(slugify('Foo ÿ'), 'foo-y');
	assert.equal(slugify('FooBar'), 'foo-bar');
	assert.equal(slugify('fooBar'), 'foo-bar');
	assert.equal(slugify('UNICORNS AND RAINBOWS'), 'unicorns-and-rainbows');
	assert.equal(slugify('Foo & Bar'), 'foo-and-bar');
	assert.equal(slugify('Hællæ, hva skjera?'), 'haellae-hva-skjera');
	assert.equal(slugify('Foo Bar2'), 'foo-bar2');
	assert.equal(slugify('I ♥ Dogs'), 'i-love-dogs');
	assert.equal(slugify('Déjà Vu!'), 'deja-vu');
	assert.equal(slugify('fooBar 123 $#%'), 'foo-bar-123');
	assert.equal(slugify('foo🦄'), 'foo-unicorn');
	assert.equal(slugify('🦄🦄🦄'), 'unicorn-unicorn-unicorn');
	assert.equal(slugify('foo&bar'), 'foo-and-bar');
	assert.equal(slugify('foo360BAR'), 'foo360-bar');
	assert.equal(slugify('FOO360'), 'foo-360');
	assert.equal(slugify('FOOBar'), 'foo-bar');
});

test('decamelize acronyms', () => {
	assert.equal(slugify('APISection'), 'api-section');
	// The word after the acronym has `s` as its second letter, which used to prevent the split.
	assert.equal(slugify('HTMLEscape'), 'html-escape');
	assert.equal(slugify('XMLMsgBox'), 'xml-msg-box');
	// The minimum two-character acronym splits from a following capitalized word.
	assert.equal(slugify('IDValue'), 'id-value');
	// The minimum uppercase run also splits from a numeric suffix.
	assert.equal(slugify('ID2'), 'id-2');
	// Acronyms split correctly when preceded by a lowercase word.
	assert.equal(slugify('parseXMLDocument'), 'parse-xml-document');
	// Multiple acronym-to-word boundaries are handled in the same identifier.
	assert.equal(slugify('XMLHttpAPIResponse'), 'xml-http-api-response');
	// Numeric acronym suffixes compose with a following capitalized word.
	assert.equal(slugify('HTML5Parser'), 'html-5-parser');

	// A plural acronym stays intact.
	assert.equal(slugify('APIs'), 'apis');
	assert.equal(slugify('Util APIs'), 'util-apis');
	assert.equal(slugify('APIsAndMore'), 'apis-and-more');
	assert.equal(slugify('APIs2'), 'apis2');
	// A plural acronym remains intact between camel-cased words.
	assert.equal(slugify('getAPIsNow'), 'get-apis-now');
});

test('possessives and contractions', () => {
	// Straight apostrophes
	assert.equal(slugify('Conway\'s Law'), 'conways-law');
	assert.equal(slugify('Conway\'s'), 'conways');
	assert.equal(slugify('Don\'t Repeat Yourself'), 'dont-repeat-yourself');
	assert.equal(slugify('my parents\' rules'), 'my-parents-rules');
	assert.equal(slugify('it-s-hould-not-modify-t-his'), 'it-s-hould-not-modify-t-his');

	// Curly/smart apostrophes
	assert.equal(slugify('Sindre’s app'), 'sindres-app');
	assert.equal(slugify('can’t stop'), 'cant-stop');
	assert.equal(slugify('won’t work'), 'wont-work');

	// Punctuation after the contraction must not stop it from being collapsed.
	assert.equal(slugify('Don\'t!'), 'dont');
	assert.equal(slugify('Conway\'s, revisited'), 'conways-revisited');
	assert.equal(slugify('it\'s, then'), 'its-then');
	assert.equal(slugify('can\'t-stop'), 'cant-stop');
	assert.equal(slugify('it\'s...'), 'its');
	assert.equal(slugify('Don’t!'), 'dont');
	assert.equal(slugify('(it\'s)'), 'its');
	assert.equal(slugify('He said “It\'s”'), 'he-said-its');
	assert.equal(slugify('user\'s_id'), 'users-id');

	// Several contractions in the same string.
	assert.equal(slugify('It\'s, Bob\'s, and Sue\'s.'), 'its-bobs-and-sues');

	// A digit before the apostrophe counts as the word.
	assert.equal(slugify('1990\'s, 2000\'s'), '1990s-2000s');

	// Not a contraction when a letter or digit follows.
	assert.equal(slugify('foo\'sbar'), 'foo-sbar');
	assert.equal(slugify('it\'s2'), 'it-s2');

	// An apostrophe that does not end a `'s`/`'t` word is untouched.
	assert.equal(slugify('\'tis the season'), 'tis-the-season');
	assert.equal(slugify('rock \'n\' roll'), 'rock-n-roll');

	// Works with the other options.
	assert.equal(slugify('Don\'t! stop', {separator: '_'}), 'dont_stop');
	assert.equal(slugify('Don\'t! stop', {separator: ''}), 'dontstop');
	assert.equal(slugify('Don\'t Stop, Please', {lowercase: false}), 'Dont-Stop-Please');
	// An uppercase contraction is collapsed too when `lowercase` is disabled.
	assert.equal(slugify('DON\'T STOP!', {lowercase: false}), 'DONT-STOP');
	assert.equal(slugify('IT\'S, THEN', {lowercase: false}), 'ITS-THEN');
	// Unicode letters kept by `transliterate: false` count as part of the word on both sides of the apostrophe.
	assert.equal(slugify('Don’t!', {transliterate: false}), 'dont');
	assert.equal(slugify('Déjà’s vu', {transliterate: false}), 'déjàs-vu');
	assert.equal(slugify('foo\'sé', {transliterate: false}), 'foo-sé');
	// A character transliteration drops cannot be part of the word, so the contraction still ends there.
	assert.equal(slugify('Sindre\'s日記'), 'sindres');
	assert.equal(slugify('Sindre\'s日記', {transliterate: false}), 'sindre-s日記');
});

test('custom separator', () => {
	assert.equal(slugify('foo bar', {separator: '_'}), 'foo_bar');
	assert.equal(slugify('aaa bbb', {separator: ''}), 'aaabbb');
	assert.equal(slugify('BAR&baz', {separator: '_'}), 'bar_and_baz');
	assert.equal(slugify('Déjà Vu!', {separator: '-'}), 'deja-vu');
	assert.equal(slugify('UNICORNS AND RAINBOWS!', {separator: '@'}), 'unicorns@and@rainbows');
	assert.equal(slugify('[foo] [bar]', {separator: '.'}), 'foo.bar', 'escape regexp special characters');

	// Test multi-character separator collapse
	assert.equal(slugify('a   b   c', {separator: '__'}), 'a__b__c');
	assert.equal(slugify('a____b', {separator: '__'}), 'a__b');
	assert.equal(slugify('__a__b__', {separator: '__'}), 'a__b');
	assert.equal(slugify('foo---bar', {separator: '---'}), 'foo---bar');
});

test('a separator containing `$` is inserted literally', () => {
	// A separator is a plain string, not a replacement pattern, so `$&`, `$$` and `` $` `` must not be expanded.
	assert.equal(slugify('foo bar', {separator: '$&'}), 'foo$&bar');
	assert.equal(slugify('foo bar', {separator: '$$'}), 'foo$$bar');
	assert.equal(slugify('foo bar', {separator: '$1'}), 'foo$1bar');
	assert.equal(slugify('foo bar', {separator: '$`'}), 'foo$`bar');
});

test('custom replacements', () => {
	assert.equal(slugify('foo | bar', {
		customReplacements: [
			['|', ' or '],
		],
	}), 'foo-or-bar');

	assert.equal(slugify('10 | 20 %', {
		customReplacements: [
			['|', ' or '],
			['%', ' percent '],
		],
	}), '10-or-20-percent');

	assert.equal(slugify('I ♥ 🦄', {
		customReplacements: [
			['♥', ' amour '],
			['🦄', ' licorne '],
		],
	}), 'i-amour-licorne');

	assert.equal(slugify('x.y.z', {
		customReplacements: [
			['.', ''],
		],
	}), 'xyz');

	assert.equal(slugify('Zürich', {
		customReplacements: [
			['ä', 'ae'],
			['ö', 'oe'],
			['ü', 'ue'],
			['ß', 'ss'],
		],
	}), 'zuerich');
});

test('lowercase option', () => {
	assert.equal(slugify('foo bar', {lowercase: false}), 'foo-bar');
	assert.equal(slugify('BAR&baz', {lowercase: false}), 'BAR-and-baz');
	assert.equal(slugify('Déjà Vu!', {separator: '_', lowercase: false}), 'Deja_Vu');
	assert.equal(slugify('UNICORNS AND RAINBOWS!', {separator: '@', lowercase: false}), 'UNICORNS@AND@RAINBOWS');
	assert.equal(slugify('[foo] [bar]', {separator: '.', lowercase: false}), 'foo.bar', 'escape regexp special characters');
	assert.equal(slugify('Foo🦄', {lowercase: false}), 'Foo-unicorn');
});

test('decamelize option', () => {
	assert.equal(slugify('fooBar'), 'foo-bar');
	assert.equal(slugify('fooBar', {decamelize: false}), 'foobar');
});

test('supports German umlauts', () => {
	assert.equal(slugify('ä ö ü Ä Ö Ü ß', {lowercase: false, separator: ' '}), 'ae oe ue Ae Oe Ue ss');
});

test('supports Vietnamese', () => {
	assert.equal(slugify('ố Ừ Đ', {lowercase: false, separator: ' '}), 'o U D');
});

test('supports Arabic', () => {
	assert.equal(slugify('ث س و', {lowercase: false, separator: ' '}), 'th s w');
});

test('supports Persian / Farsi', () => {
	assert.equal(slugify('چ ی پ', {lowercase: false, separator: ' '}), 'ch y p');
});

test('supports Urdu', () => {
	assert.equal(slugify('ٹ ڈ ھ', {lowercase: false, separator: ' '}), 't d h');
});

test('supports Pashto', () => {
	assert.equal(slugify('ګ ړ څ', {lowercase: false, separator: ' '}), 'g r c');
});

test('supports Russian', () => {
	assert.equal(slugify('Ж п ю', {lowercase: false, separator: ' '}), 'Zh p yu');
});

test('supports Romanian', () => {
	assert.equal(slugify('ș Ț', {lowercase: false, separator: ' '}), 's T');
});

test('supports Turkish', () => {
	assert.equal(slugify('İ ı Ş ş Ç ç Ğ ğ', {lowercase: false, separator: ' '}), 'I i S s C c G g');
});

test('supports Armenian', () => {
	assert.equal(slugify('Ե ր ե ւ ա ն', {lowercase: false, separator: ' '}), 'Ye r ye v a n');
});

test('leading underscore', () => {
	assert.equal(slugify('_foo bar', {preserveLeadingUnderscore: true}), '_foo-bar');
	assert.equal(slugify('_foo_bar', {preserveLeadingUnderscore: true}), '_foo-bar');
	assert.equal(slugify('__foo__bar', {preserveLeadingUnderscore: true}), '_foo-bar');
	assert.equal(slugify('____-_______foo__bar', {preserveLeadingUnderscore: true}), '_foo-bar');
});

test('trailing dash', () => {
	assert.equal(slugify('foo bar-', {preserveTrailingDash: true}), 'foo-bar-');
	assert.equal(slugify('foo-bar--', {preserveTrailingDash: true}), 'foo-bar-');
	assert.equal(slugify('foo-bar -', {preserveTrailingDash: true}), 'foo-bar-');
	assert.equal(slugify('foo-bar - ', {preserveTrailingDash: true}), 'foo-bar');
	assert.equal(slugify('foo-bar ', {preserveTrailingDash: true}), 'foo-bar');
});

test('counter', () => {
	const countingSlugify = slugifyWithCounter();
	assert.equal(countingSlugify('foo bar'), 'foo-bar');
	assert.equal(countingSlugify('foo bar'), 'foo-bar-2');

	countingSlugify.reset();

	assert.equal(countingSlugify('foo'), 'foo');
	assert.equal(countingSlugify('foo'), 'foo-2');
	assert.equal(countingSlugify('foo 1'), 'foo-1');
	assert.equal(countingSlugify('foo-1'), 'foo-1-2');
	assert.equal(countingSlugify('foo-1'), 'foo-1-3');
	assert.equal(countingSlugify('foo'), 'foo-3');
	assert.equal(countingSlugify('foo'), 'foo-4');
	assert.equal(countingSlugify('foo-1'), 'foo-1-4');
	assert.equal(countingSlugify('foo-2'), 'foo-2-1');
	assert.equal(countingSlugify('foo-2'), 'foo-2-2');
	assert.equal(countingSlugify('foo-2-1'), 'foo-2-1-1');
	assert.equal(countingSlugify('foo-2-1'), 'foo-2-1-2');
	assert.equal(countingSlugify('foo-11'), 'foo-11-1');
	assert.equal(countingSlugify('foo-111'), 'foo-111-1');
	assert.equal(countingSlugify('foo-111-1'), 'foo-111-1-1');
	assert.equal(countingSlugify('fooCamelCase', {lowercase: false, decamelize: false}), 'fooCamelCase');
	assert.equal(countingSlugify('fooCamelCase', {decamelize: false}), 'foocamelcase-2');
	assert.equal(countingSlugify('_foo'), 'foo-5');
	assert.equal(countingSlugify('_foo', {preserveLeadingUnderscore: true}), '_foo');
	assert.equal(countingSlugify('_foo', {preserveLeadingUnderscore: true}), '_foo-2');

	const secondCountingSlugify = slugifyWithCounter();
	assert.equal(secondCountingSlugify('foo'), 'foo');
	assert.equal(secondCountingSlugify('foo'), 'foo-2');

	assert.equal(secondCountingSlugify(''), '', 'first empty slug');
	assert.equal(secondCountingSlugify(''), '', 'an empty slug must not consume a counter value');
});

test('slugifyWithCounter() never returns the same slug twice', () => {
	// A slug produced by appending a counter to one input can collide with the plain slug of a different input, as the counter is keyed on the incoming slug only.
	const countingSlugify = slugifyWithCounter();
	assert.equal(countingSlugify('foo'), 'foo');
	assert.equal(countingSlugify('foo'), 'foo-2');
	assert.equal(countingSlugify('foo 2'), 'foo-2-2');

	countingSlugify.reset();

	// The same collision in the other order.
	assert.equal(countingSlugify('foo'), 'foo');
	assert.equal(countingSlugify('foo 2'), 'foo-2');
	assert.equal(countingSlugify('foo'), 'foo-3');

	countingSlugify.reset();

	// The bump has to keep going while the next candidate is also taken.
	assert.equal(countingSlugify('bar'), 'bar');
	assert.equal(countingSlugify('bar 2'), 'bar-2');
	assert.equal(countingSlugify('bar 3'), 'bar-3');
	assert.equal(countingSlugify('bar'), 'bar-4');

	countingSlugify.reset();

	// The collision check is case-insensitive, matching the counter itself.
	assert.equal(countingSlugify('baz'), 'baz');
	assert.equal(countingSlugify('BAZ 2', {lowercase: false}), 'BAZ-2');
	assert.equal(countingSlugify('baz'), 'baz-3');
});

test('preserve characters', () => {
	assert.equal(slugify('foo#bar', {preserveCharacters: []}), 'foo-bar');
	assert.equal(slugify('foo.bar', {preserveCharacters: []}), 'foo-bar');
	assert.equal(slugify('foo?bar ', {preserveCharacters: ['#']}), 'foo-bar');
	assert.equal(slugify('foo#bar', {preserveCharacters: ['#']}), 'foo#bar');
	assert.equal(slugify('foo_bar#baz', {preserveCharacters: ['#']}), 'foo-bar#baz');
	assert.equal(slugify('foo.bar#baz-quux', {preserveCharacters: ['.', '#']}), 'foo.bar#baz-quux');
	assert.equal(slugify('foo.bar#baz-quux', {separator: '.', preserveCharacters: ['-']}), 'foo.bar.baz-quux');

	// Contraction collapsing runs first, so a word-final `'s`/`'t` apostrophe is dropped even when `'` is preserved.
	assert.equal(slugify('it\'s!', {preserveCharacters: ['\'']}), 'its');
	assert.equal(slugify('rock \'n\' roll', {preserveCharacters: ['\'']}), 'rock-\'n\'-roll');

	assert.throws(() => {
		slugify('foo', {separator: '-', preserveCharacters: ['-']});
	}, /cannot be included in preserved characters/v);
	assert.throws(() => {
		slugify('foo', {separator: '.', preserveCharacters: ['.']});
	}, /cannot be included in preserved characters/v);
});

test('locale option', () => {
	// Locale-specific transliteration
	assert.equal(slugify('Räksmörgås'), 'raeksmoergas');
	assert.equal(slugify('Räksmörgås', {locale: 'sv'}), 'raksmorgas');
	assert.equal(slugify('Räksmörgås', {locale: 'de'}), 'raeksmoergas');
	assert.equal(slugify('Fön', {locale: 'de'}), 'foen');
	assert.equal(slugify('Fön', {locale: 'sv'}), 'fon');

	// Locale-specific lowercasing demonstrates locale awareness
	// Note: Some locales may have complex behavior with transliteration
	assert.equal(slugify('TEST', {locale: 'tr'}), 'test'); // Basic test
	assert.equal(slugify('TEST'), 'test'); // Default behavior same for basic ASCII
});

test('transliterate option disabled', () => {
	// Test what happens when transliteration is disabled
	// ASCII characters work normally
	assert.equal(slugify('foo bar', {transliterate: false}), 'foo-bar');
	assert.equal(slugify('hello world', {transliterate: false}), 'hello-world');

	// Non-ASCII characters are preserved instead of transliterated
	assert.equal(slugify('Déjà Vu', {transliterate: false}), 'déjà-vu');
	assert.equal(slugify('Räksmörgås', {transliterate: false}), 'räksmörgås');
	assert.equal(slugify('你好世界', {transliterate: false}), '你好世界');
	assert.equal(slugify('مرحبا', {transliterate: false}), 'مرحبا');

	// Custom replacements should still work when transliterate is disabled
	assert.equal(slugify('foo & bar', {transliterate: false, customReplacements: [['&', ' and ']]}), 'foo-and-bar');

	// Built-in replacements (like & -> and) are disabled when transliterate is false
	assert.equal(slugify('foo & bar', {transliterate: false}), 'foo-bar');

	// Mixed ASCII and non-ASCII
	assert.equal(slugify('Hello Déjà Vu', {transliterate: false}), 'hello-déjà-vu');

	// Ensure transliterate: true still works normally (default behavior)
	assert.equal(slugify('Déjà Vu'), 'deja-vu');
	assert.equal(slugify('foo & bar'), 'foo-and-bar');
});

test('slugifyWithCounter() is not vulnerable to ReDoS', () => {
	const countingSlugify = slugifyWithCounter();

	// Stripping the trailing counter used to backtrack quadratically on a long run of `-<digits>` groups that ends in a non-digit. This input took over 30 seconds; the threshold is generous so that it only trips on that blowup.
	const start = performance.now();
	countingSlugify(`${'-1'.repeat(50_000)}a`);
	const duration = performance.now() - start;

	assert.ok(duration < 5000, `Took ${duration.toFixed(0)}ms`);
});
