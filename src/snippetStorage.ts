import * as vscode from 'vscode';

export interface Snippet {
  id: string;
  name: string;
  code: string;
  language: string;
  tag: string;
  createdAt: string;
}

export class SnippetStorage {
  private readonly KEY = 'snippetbox.snippets';

  constructor(private state: vscode.Memento) {}

  getAllSnippets(): Snippet[] {
    return this.state.get<Snippet[]>(this.KEY, []);
  }

  addSnippet(snippet: Snippet): void {
    const all = this.getAllSnippets();
    const exists = all.findIndex(s => s.id === snippet.id);
    if (exists !== -1) {
      all[exists] = snippet;
    } else {
      all.push(snippet);
    }
    this.state.update(this.KEY, all);
  }

  deleteSnippet(id: string): void {
    const filtered = this.getAllSnippets().filter(s => s.id !== id);
    this.state.update(this.KEY, filtered);
  }

  getSnippetsByTag(tag: string): Snippet[] {
    return this.getAllSnippets().filter(s => s.tag === tag);
  }

  getAllTags(): string[] {
    const tags = this.getAllSnippets().map(s => s.tag);
    return [...new Set(tags)];
  }

  searchSnippets(query: string): Snippet[] {
    const q = query.toLowerCase();
    return this.getAllSnippets().filter(
      s =>
        s.name.toLowerCase().includes(q) ||
        s.tag.toLowerCase().includes(q) ||
        s.language.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q)
    );
  }
}