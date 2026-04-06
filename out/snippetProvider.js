"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnippetProvider = exports.SnippetItem = void 0;
const vscode = __importStar(require("vscode"));
class SnippetItem extends vscode.TreeItem {
    constructor(label, collapsibleState, snippet, isTag) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.snippet = snippet;
        this.isTag = isTag;
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
        }
        else if (isTag) {
            this.iconPath = new vscode.ThemeIcon('tag');
            this.contextValue = 'tag';
        }
    }
}
exports.SnippetItem = SnippetItem;
class SnippetProvider {
    constructor(storage) {
        this.storage = storage;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire(undefined);
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element) {
            const tags = this.storage.getAllTags();
            if (tags.length === 0) {
                return [new SnippetItem('No snippets yet. Select code & save!', vscode.TreeItemCollapsibleState.None)];
            }
            return tags.map(tag => new SnippetItem(tag, vscode.TreeItemCollapsibleState.Collapsed, undefined, true));
        }
        else if (element.isTag) {
            const snippets = this.storage.getSnippetsByTag(element.label);
            return snippets.map(s => new SnippetItem(s.name, vscode.TreeItemCollapsibleState.None, s));
        }
        return [];
    }
}
exports.SnippetProvider = SnippetProvider;
//# sourceMappingURL=snippetProvider.js.map