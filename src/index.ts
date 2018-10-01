import deburr from 'lodash.deburr';
import escaperegexp from 'lodash.escaperegexp';

interface Options {
  separator?: string;
  decamelize?: boolean;
  lowerCase?: boolean;
}

const defaultOptions: Options = {
  separator: '-',
  decamelize: true,
  lowerCase: true,
};

const decamelize = (textLine: string) => {
  return textLine
    .replace(new RegExp(/([a-z\d])([A-Z])/, 'g'), `$1 $2`)
    .replace(new RegExp(/([A-Z]+)([A-Z][a-z\d]+)/, 'g'), `$1 $2`);
};

const removeMootSeparators = (textLine: string, separator: string) => {
  return textLine
    .replace(new RegExp(`${separator}{2,}`, 'g'), separator)
    .replace(new RegExp(`^${separator}|${separator}$`, 'g'), '');
};

export default (textLine: string, options?: Options): string => {
  if (typeof textLine !== 'string') {
    throw new Error(`Expected a 'string', got a '${typeof textLine}'.`);
  }

  options = {
    ...defaultOptions,
    ...options,
  };

  const separator = escaperegexp(options.separator);
  let regex = new RegExp(/[^a-zA-Z\d]+/, 'g');

  textLine = deburr(textLine);
  if (options.decamelize) {
    textLine = decamelize(textLine);
  }
  if (options.lowerCase) {
    textLine = textLine.toLowerCase();
    regex = new RegExp(/[^a-z\d]+/, 'g');
  }
  textLine = textLine.replace(regex, separator);
  textLine = textLine.replace(new RegExp(/\\/, 'g'), '');
  textLine = removeMootSeparators(textLine, separator);

  return textLine;
};
