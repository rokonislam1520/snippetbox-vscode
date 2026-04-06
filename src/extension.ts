import * as vscode from 'vscode';
import { SnippetProvider } from './snippetProvider';
import { SnippetPanelProvider } from './snippetPanelProvider';
import { SnippetStorage } from './snippetStorage';

export function activate(context: vscode.ExtensionContext) {
  const storage = new SnippetStorage(context.globalState);
  const provider = new SnippetProvider(storage);
  const panelProvider = new SnippetPanelProvider(context.extensionUri, storage);

  vscode.window.registerTreeDataProvider('snippetboxView', provider);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('snippetboxPanel', panelProvider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('snippetbox.saveSnippet', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) { vscode.window.showWarningMessage('No active editor found.'); return; }
      const selectedText = editor.document.getText(editor.selection);
      if (!selectedText) { vscode.window.showWarningMessage('Please select some code first.'); return; }
      const name = await vscode.window.showInputBox({ prompt: 'Snippet name', placeHolder: 'e.g. React useEffect hook' });
      if (!name) return;
      const tag = await vscode.window.showInputBox({ prompt: 'Tag / Category', placeHolder: 'e.g. react, utils, api' });
      const language = editor.document.languageId;
      storage.addSnippet({ id: Date.now().toString(), name, code: selectedText, language, tag: tag || 'general', createdAt: new Date().toISOString() });
      provider.refresh();
      panelProvider.refresh();
      vscode.window.showInformationMessage(`✅ Snippet "${name}" saved!`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('snippetbox.insertSnippet', async (code: string) => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      editor.insertSnippet(new vscode.SnippetString(code));
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('snippetbox.deleteSnippet', async (id: string) => {
      storage.deleteSnippet(id);
      provider.refresh();
      panelProvider.refresh();
      vscode.window.showInformationMessage('🗑️ Snippet deleted.');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('snippetbox.exportSnippets', async () => {
      const uri = await vscode.window.showSaveDialog({ filters: { JSON: ['json'] }, defaultUri: vscode.Uri.file('snippetbox-export.json') });
      if (!uri) return;
      const data = JSON.stringify(storage.getAllSnippets(), null, 2);
      await vscode.workspace.fs.writeFile(uri, Buffer.from(data, 'utf8'));
      vscode.window.showInformationMessage('📦 Snippets exported!');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('snippetbox.importSnippets', async () => {
      const uris = await vscode.window.showOpenDialog({ filters: { JSON: ['json'] } });
      if (!uris || uris.length === 0) return;
      const raw = await vscode.workspace.fs.readFile(uris[0]);
      const snippets = JSON.parse(Buffer.from(raw).toString('utf8'));
      snippets.forEach((s: any) => storage.addSnippet(s));
      provider.refresh();
      panelProvider.refresh();
      vscode.window.showInformationMessage(`✅ ${snippets.length} snippets imported!`);
    })
  );
}

export function deactivate() {}