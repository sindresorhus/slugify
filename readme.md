# slugify [![Build Status](https://travis-ci.org/sindresorhus/slugify.svg?branch=master)](https://travis-ci.org/sindresorhus/slugify)

> Slugify a string

Useful for URLs, filenames, and IDs.


## Install

```
$ npm install @sindresorhus/slugify
```


## Usage

```js
const slugify = require('@sindresorhus/slugify');

slugify('I ♥ Dogs');
//=> 'i-love-dogs'

slugify('  Déjà Vu!  ');
//=> 'deja-vu'

slugify('fooBar 123 $#%');
//=> 'foo-bar-123'

slugify('BAR and baz', {separator: '_'});
//=> 'bar_and_baz'
```

## API

### slugify(input, [options])

#### input

Type: `string`

#### options

Type: `Object`

##### separator

Type: `string`<br>
Default: `-`

## Related

- [filenamify](https://github.com/sindresorhus/filenamify) - Convert a string to a valid safe filename


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
