import slugify from '../.';

describe('Slugify', () => {
  it('without any additional options', () => {
    expect(slugify('Foo Bar')).toBe('foo-bar');
    expect(slugify('foo bar baz')).toBe('foo-bar-baz');
    expect(slugify('foo bar ')).toBe('foo-bar');
    expect(slugify('       foo bar')).toBe('foo-bar');
    expect(slugify('[foo] [bar]')).toBe('foo-bar');
    expect(slugify('Foo ÿ')).toBe('foo-y');
    expect(slugify('FooBar')).toBe('foo-bar');
    expect(slugify('fooBar')).toBe('foo-bar');
    expect(slugify('UNICORNS AND RAINBOWS')).toBe('unicorns-and-rainbows');
    expect(slugify('Hællæ, hva skjera?')).toBe('haellae-hva-skjera');
    expect(slugify('Foo Bar2')).toBe('foo-bar2');
    expect(slugify('Déjà Vu!')).toBe('deja-vu');
    expect(slugify('fooBar 123 $#%')).toBe('foo-bar-123');
  });

  it('with custom separator option', () => {
    expect(slugify('foo bar', { separator: '_' })).toBe('foo_bar');
    expect(slugify('Déjà Vu!', { separator: '-' })).toBe('deja-vu');
    expect(slugify('UNICORNS AND RAINBOWS!', { separator: '@' })).toBe(
      'unicorns@and@rainbows',
    );
    expect(slugify('[foo] [bar]', { separator: '.' })).toBe('foo.bar');
  });

  it('with custom decamelize option', () => {
    expect(slugify('GraphQL', { decamelize: false })).toBe('graphql');
    expect(slugify('GraphQL', { decamelize: true })).toBe('graph-ql');
  });

  it('with custom lowercase option', () => {
    expect(slugify('Foo Bar', { lowerCase: false })).toBe('Foo-Bar');
    expect(slugify('Déjà Vu!', { lowerCase: false })).toBe('Deja-Vu');
    expect(slugify('Foo Bar', { lowerCase: true })).toBe('foo-bar');
  });

  it('with all custom options enabled', () => {
    expect(
      slugify('Foo Bar', {
        separator: '_',
        decamelize: false,
        lowerCase: false,
      }),
    ).toBe('Foo_Bar');
    expect(
      slugify('FooBar Baz', {
        separator: '_',
        decamelize: true,
        lowerCase: true,
      }),
    ).toBe('foo_bar_baz');
    expect(
      slugify('FooBar Baz', {
        separator: '@',
        decamelize: false,
        lowerCase: true,
      }),
    ).toBe('foobar@baz');
  });
});
