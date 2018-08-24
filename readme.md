# tslug [![Build Status](https://travis-ci.com/yakovlevyuri/tslug.svg?branch=master)](https://travis-ci.com/yakovlevyuri/tslug)

Slugify URLs, filenames and IDs.

## Install

```
$ yarn add tslug
```

or

```
$ npm install tslug
```

## Usage

```js
import tslug from 'tslug';

tslug('Hello World');
//=> 'hello-world'

tslug('  Déjà Vu!  ');
//=> 'deja-vu'

tslug('fooBar 123 $#%');
//=> 'foo-bar-123'

tslug('BAR and baz', { separator: '_' });
//=> 'bar_and_baz'

tslug('GraphQL', { decamelize: false });
//=> 'graphql'

tslug('Foo Bar', { lowerCase: false });
//=> 'Foo-Bar'

tslug('FooBar Baz', {
  separator: '@',
  decamelize: false,
  lowerCase: true,
});
//=> 'foobar@baz'
```

## API

### tslug(input, [options])

#### input

Type: `string`

#### options

Type: `Object`

##### separator

Type: `string`\
Default: `-`

##### decamelize

Type: `boolean`\
Default: true

##### lowerCase

Type: `boolean`\
Default: true

## License

MIT © [Yuri Yakovlev](https://mynameisyuri.com)\
Based on the original [Slugify](https://github.com/sindresorhus/slugify) by [Sindre Sorhus](https://sindresorhus.com)
