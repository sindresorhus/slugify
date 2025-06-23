// overridable-replacements.js

class Replacements {
    constructor() {
        this.replacements = Object.create(null);
    }

    add(key, value) {
        this.replacements[key] = value;
    }

    get(key) {
        return key in this.replacements ? this.replacements[key] : null;
    }

    remove(key) {
        if (this.has(key)) {
            delete this.replacements[key];
        }
    }

    has(key) {
        return Object.prototype.hasOwnProperty.call(this.replacements, key);
    }

    replace(text) {
        return Object.entries(this.replacements).reduce((acc, [key, value]) => {
            const regex = new RegExp(key, 'g');
            return acc.replace(regex, value);
        }, text);
    }

    clear() {
        this.replacements = Object.create(null);
    }
}

export default Replacements;