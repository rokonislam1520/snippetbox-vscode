import * as vscode from 'vscode';
import { SnippetStorage, Snippet } from './snippetStorage';

export class SnippetItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly snippet?: Snippet,
    public readonly isTag?: boolean
  ) {
    super(label, collapsibleState);

    if (snippet) {
      this.tooltip = `${snippet.language} · ${snippet.tag}\n\n${snippet.code.substring(0, 100)}...`;
      this.description = snippet.language;
      this.iconPath = new vscode.ThemeIcon('code');
      this.command = {
        command: 'snippetbox.insertSnippet',
        title: 'Insert Snippet',
        arguments: [snippet.code],
      };
      this.contextValue = 'snippet';
    } else if (isTag) {
      this.iconPath = new vscode.ThemeIcon('tag');
      this.contextValue = 'tag';
    }
  }
}

export class SnippetProvider implements vscode.TreeDataProvider<SnippetItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<SnippetItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private storage: SnippetStorage) {}

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: SnippetItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: SnippetItem): SnippetItem[] {
    if (!element) {
      const tags = this.storage.getAllTags();
      if (tags.length === 0) {
        return [new SnippetItem('No snippets yet. Select code & save!', vscode.TreeItemCollapsibleState.None)];
      }
      return tags.map(tag => new SnippetItem(tag, vscode.TreeItemCollapsibleState.Collapsed, undefined, true));
    } else if (element.isTag) {
      const snippets = this.storage.getSnippetsByTag(element.label);
      return snippets.map(s => new SnippetItem(s.name, vscode.TreeItemCollapsibleState.None, s));
    }
    return [];
  }
}