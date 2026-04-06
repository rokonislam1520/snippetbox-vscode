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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const snippetProvider_1 = require("./snippetProvider");
const snippetPanelProvider_1 = require("./snippetPanelProvider");
const snippetStorage_1 = require("./snippetStorage");
function activate(context) {
    const storage = new snippetStorage_1.SnippetStorage(context.globalState);
    const provider = new snippetProvider_1.SnippetProvider(storage);
    const panelProvider = new snippetPanelProvider_1.SnippetPanelProvider(context.extensionUri, storage);
    vscode.window.registerTreeDataProvider('snippetboxView', provider);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('snippetboxPanel', panelProvider));
    context.subscriptions.push(vscode.commands.registerCommand('snippetbox.saveSnippet', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor found.');
            return;
        }
        const selectedText = editor.document.getText(editor.selection);
        if (!selectedText) {
            vscode.window.showWarningMessage('Please select some code first.');
            return;
        }
        const name = await vscode.window.showInputBox({ prompt: 'Snippet name', placeHolder: 'e.g. React useEffect hook' });
        if (!name)
            return;
        const tag = await vscode.window.showInputBox({ prompt: 'Tag / Category', placeHolder: 'e.g. react, utils, api' });
        const language = editor.document.languageId;
        storage.addSnippet({ id: Date.now().toString(), name, code: selectedText, language, tag: tag || 'general', createdAt: new Date().toISOString() });
        provider.refresh();
        panelProvider.refresh();
        vscode.window.showInformationMessage(`✅ Snippet "${name}" saved!`);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('snippetbox.insertSnippet', async (code) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return;
        editor.insertSnippet(new vscode.SnippetString(code));
    }));
    context.subscriptions.push(vscode.commands.registerCommand('snippetbox.deleteSnippet', async (id) => {
        storage.deleteSnippet(id);
        provider.refresh();
        panelProvider.refresh();
        vscode.window.showInformationMessage('🗑️ Snippet deleted.');
    }));
    context.subscriptions.push(vscode.commands.registerCommand('snippetbox.exportSnippets', async () => {
        const uri = await vscode.window.showSaveDialog({ filters: { JSON: ['json'] }, defaultUri: vscode.Uri.file('snippetbox-export.json') });
        if (!uri)
            return;
        const data = JSON.stringify(storage.getAllSnippets(), null, 2);
        await vscode.workspace.fs.writeFile(uri, Buffer.from(data, 'utf8'));
        vscode.window.showInformationMessage('📦 Snippets exported!');
    }));
    context.subscriptions.push(vscode.commands.registerCommand('snippetbox.importSnippets', async () => {
        const uris = await vscode.window.showOpenDialog({ filters: { JSON: ['json'] } });
        if (!uris || uris.length === 0)
            return;
        const raw = await vscode.workspace.fs.readFile(uris[0]);
        const snippets = JSON.parse(Buffer.from(raw).toString('utf8'));
        snippets.forEach((s) => storage.addSnippet(s));
        provider.refresh();
        panelProvider.refresh();
        vscode.window.showInformationMessage(`✅ ${snippets.length} snippets imported!`);
    }));
}
function deactivate() { }
//# sourceMappingURL=extension.js.map