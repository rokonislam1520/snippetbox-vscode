"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnippetStorage = void 0;
class SnippetStorage {
    constructor(state) {
        this.state = state;
        this.KEY = 'snippetbox.snippets';
    }
    getAllSnippets() {
        return this.state.get(this.KEY, []);
    }
    addSnippet(snippet) {
        const all = this.getAllSnippets();
        const exists = all.findIndex(s => s.id === snippet.id);
        if (exists !== -1) {
            all[exists] = snippet;
        }
        else {
            all.push(snippet);
        }
        this.state.update(this.KEY, all);
    }
    deleteSnippet(id) {
        const filtered = this.getAllSnippets().filter(s => s.id !== id);
        this.state.update(this.KEY, filtered);
    }
    getSnippetsByTag(tag) {
        return this.getAllSnippets().filter(s => s.tag === tag);
    }
    getAllTags() {
        const tags = this.getAllSnippets().map(s => s.tag);
        return [...new Set(tags)];
    }
    searchSnippets(query) {
        const q = query.toLowerCase();
        return this.getAllSnippets().filter(s => s.name.toLowerCase().includes(q) ||
            s.tag.toLowerCase().includes(q) ||
            s.language.toLowerCase().includes(q) ||
            s.code.toLowerCase().includes(q));
    }
}
exports.SnippetStorage = SnippetStorage;
//# sourceMappingURL=snippetStorage.js.map