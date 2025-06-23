```js
// overridable-replacements.js

class Replacements {
    constructor() {
        this.replacements = {};
    }

    add(key, value) {
        this.replacements[key] = value;
    }

    get(key) {
        return this.replacements[key] || null;
    }

    remove(key) {
        if (this.replacements.hasOwnProperty(key)) {
            delete this.replacements[key];
        }
    }

    replace(text) {
        return Object.entries(this.replacements).reduce((acc, [key, value]) => {
            const regex = new RegExp(key, 'g');
            return acc.replace(regex, value);
        }, text);
    }

    clear() {
        this.replacements = {};
    }
}

export default Replacements;
```