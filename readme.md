# slugify

> Slugify a string

Useful for URLs, filenames, and IDs.

It handles most major languages, including [German (umlauts)](https://en.wikipedia.org/wiki/Germanic_umlaut), Vietnamese, Arabic, Russian, [and more](https://github.com/sindresorhus/transliterate#supported-languages).

## Install

```sh
npm install @sindresorhus/slugify
```

## Usage

```js
import slugify from '@sindresorhus/slugify';

slugify('I ♥ Dogs');
//=> 'i-love-dogs'

slugify('  Déjà Vu!  ');
//=> 'deja-vu'

slugify('fooBar 123 $#%');
//=> 'foo-bar-123'

slugify('я люблю единорогов');
//=> 'ya-lyublyu-edinorogov'
```

## API

### slugify(string, options?)

#### string

Type: `string`

String to slugify.

#### options

Type: `object`

##### separator

Type: `string`\
Default: `'-'`

```js
import slugify from '@sindresorhus/slugify';

slugify('BAR and baz');
//=> 'bar-and-baz'

slugify('BAR and baz', {separator: '_'});
//=> 'bar_and_baz'

slugify('BAR and baz', {separator: ''});
//=> 'barandbaz'
```

##### lowercase

Type: `boolean`\
Default: `true`

Make the slug lowercase.

```js
import slugify from '@sindresorhus/slugify';

slugify('Déjà Vu!');
//=> 'deja-vu'

slugify('Déjà Vu!', {lowercase: false});
//=> 'Deja-Vu'
```

##### decamelize

Type: `boolean`\
Default: `true`

Convert camelcase to separate words. Internally it does `fooBar` → `foo bar`.

```js
import slugify from '@sindresorhus/slugify';

slugify('fooBar');
//=> 'foo-bar'

slugify('fooBar', {decamelize: false});
//=> 'foobar'
```

##### customReplacements

Type: `Array<string[]>`\
Default: `[
	['&', ' and '],
	['🦄', ' unicorn '],
	['♥', ' love ']
]`

Add your own custom replacements.

The replacements are run on the original string before any other transformations.

This only overrides a default replacement if you set an item with the same key, like `&`.

```js
import slugify from '@sindresorhus/slugify';

slugify('Foo@unicorn', {
	customReplacements: [
		['@', 'at']
	]
});
//=> 'fooatunicorn'
```

Add a leading and trailing space to the replacement to have it separated by dashes:

```js
import slugify from '@sindresorhus/slugify';

slugify('foo@unicorn', {
	customReplacements: [
		['@', ' at ']
	]
});
//=> 'foo-at-unicorn'
```

Another example:

```js
import slugify from '@sindresorhus/slugify';

slugify('I love 🐶', {
	customReplacements: [
		['🐶', 'dogs']
	]
});
//=> 'i-love-dogs'
```

##### preserveLeadingUnderscore

Type: `boolean`\
Default: `false`

If your string starts with an underscore, it will be preserved in the slugified string.

Sometimes leading underscores are intentional, for example, filenames representing hidden paths on a website.

```js
import slugify from '@sindresorhus/slugify';

slugify('_foo_bar');
//=> 'foo-bar'

slugify('_foo_bar', {preserveLeadingUnderscore: true});
//=> '_foo-bar'
```

##### preserveTrailingDash

Type: `boolean`\
Default: `false`

If your string ends with a dash, it will be preserved in the slugified string.

For example, using slugify on an input field would allow for validation while not preventing the user from writing a slug.

```js
import slugify from '@sindresorhus/slugify';

slugify('foo-bar-');
//=> 'foo-bar'

slugify('foo-bar-', {preserveTrailingDash: true});
//=> 'foo-bar-'
```

##### preserveCharacters

Type: `string[]`\
Default: `[]`

Preserve certain characters.

It cannot contain the `separator`.

For example, if you want to slugify URLs, but preserve the HTML fragment `#` character.

```js
import slugify from '@sindresorhus/slugify';

slugify('foo_bar#baz', {preserveCharacters: ['#']});
//=> 'foo-bar#baz'
```

##### locale

Type: `string`\
Default: `undefined`

The locale to use for language-specific transliteration.

See the [`@sindresorhus/transliterate` package](https://github.com/sindresorhus/transliterate#locale) for more info.

```js
import slugify from '@sindresorhus/slugify';

slugify('Räksmörgås');
//=> 'raeksmoergas'

slugify('Räksmörgås', {locale: 'sv'});
//=> 'raksmorgas'
```

##### transliterate

Type: `boolean`\
Default: `true`

Whether to transliterate Unicode characters to ASCII.

When `false`, non-ASCII characters will be preserved instead of being transliterated. This can improve performance when you don't need transliteration.

```js
import slugify from '@sindresorhus/slugify';

slugify('Déjà Vu');
//=> 'deja-vu'

slugify('Déjà Vu', {transliterate: false});
//=> 'déjà-vu'
```

##### maxLength

Type: `number`\
Default: `undefined`

Truncate the slug to a maximum length, in characters.

Must be a positive integer. When the slug is longer than `maxLength`, it is cut back to the last `separator` boundary at or before the limit so words are not split. If there is no such boundary (for example, a single long word or an empty `separator`), the slug is hard-cut to exactly `maxLength` characters.

When omitted, the slug is not truncated.

```js
import slugify from '@sindresorhus/slugify';

slugify('The quick brown fox', {maxLength: 12});
//=> 'the-quick'

slugify('supercalifragilistic', {maxLength: 5});
//=> 'super'
```

### slugifyWithCounter()

Returns a new instance of `slugify(string, options?)` with a counter to handle multiple occurrences of the same string.

#### Example

```js
import {slugifyWithCounter} from '@sindresorhus/slugify';

const slugify = slugifyWithCounter();

slugify('foo bar');
//=> 'foo-bar'

slugify('foo bar');
//=> 'foo-bar-2'

slugify.reset();

slugify('foo bar');
//=> 'foo-bar'
```

#### Use-case example of counter

If, for example, you have a document with multiple sections where each subsection has an example.

```md
## Section 1

### Example

## Section 2

### Example
```

You can then use `slugifyWithCounter()` to generate unique HTML `id`'s to ensure anchors will link to the right headline.

### slugify.reset()

Reset the counter

#### Example

```js
import {slugifyWithCounter} from '@sindresorhus/slugify';

const slugify = slugifyWithCounter();

slugify('foo bar');
//=> 'foo-bar'

slugify('foo bar');
//=> 'foo-bar-2'

slugify.reset();

slugify('foo bar');
//=> 'foo-bar'
```

## Related

- [slugify-cli](https://github.com/sindresorhus/slugify-cli) - CLI for this module
- [transliterate](https://github.com/sindresorhus/transliterate) - Convert Unicode characters to Latin characters using transliteration
- [filenamify](https://github.com/sindresorhus/filenamify) - Convert a string to a valid safe filename
