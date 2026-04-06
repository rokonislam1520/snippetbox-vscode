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
exports.SnippetPanelProvider = void 0;
const vscode = __importStar(require("vscode"));
class SnippetPanelProvider {
    constructor(extensionUri, storage) {
        this.extensionUri = extensionUri;
        this.storage = storage;
    }
    refresh() {
        if (this._view) {
            this._view.webview.html = this.getHtml(this._view.webview);
        }
    }
    resolveWebviewView(webviewView) {
        this._view = webviewView;
        webviewView.webview.options = { enableScripts: true };
        webviewView.webview.html = this.getHtml(webviewView.webview);
        webviewView.webview.onDidReceiveMessage(msg => {
            if (msg.type === 'insert') {
                vscode.commands.executeCommand('snippetbox.insertSnippet', msg.code);
            }
            if (msg.type === 'delete') {
                vscode.commands.executeCommand('snippetbox.deleteSnippet', msg.id);
            }
            if (msg.type === 'copy') {
                vscode.env.clipboard.writeText(msg.code);
                vscode.window.showInformationMessage('📋 Copied to clipboard!');
            }
        });
    }
    getHtml(webview) {
        const snippets = this.storage.getAllSnippets();
        const tags = this.storage.getAllTags();
        const snippetsJson = JSON.stringify(snippets);
        const tagsJson = JSON.stringify(tags);
        return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Syne:wght@400;600;700&display=swap');
  :root {
    --bg:#0d0d0f;--surface:#141416;--surface2:#1c1c1f;--border:#2a2a2e;
    --accent:#7c6af7;--accent2:#a78bfa;--text:#e8e8f0;--muted:#6b6b7a;
    --success:#34d399;--danger:#f87171;--tag-bg:#1e1a3a;--tag-text:#a78bfa;
  }
  *{margin:0;padding:0;box-sizing:border-box;}
  body{background:var(--bg);color:var(--text);font-family:'Syne',sans-serif;font-size:13px;height:100vh;display:flex;flex-direction:column;overflow:hidden;}
  .header{padding:16px 14px 10px;border-bottom:1px solid var(--border);background:var(--surface);}
  .header-top{display:flex;align-items:center;gap:8px;margin-bottom:10px;}
  .logo{width:22px;height:22px;background:linear-gradient(135deg,var(--accent),var(--accent2));border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:11px;}
  .title{font-size:14px;font-weight:700;letter-spacing:0.04em;background:linear-gradient(90deg,var(--accent2),#c4b5fd);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
  .count{margin-left:auto;font-size:10px;color:var(--muted);font-family:'JetBrains Mono',monospace;background:var(--surface2);padding:2px 7px;border-radius:20px;border:1px solid var(--border);}
  .search-wrap{position:relative;}
  .search-icon{position:absolute;left:9px;top:50%;transform:translateY(-50%);color:var(--muted);font-size:11px;}
  input[type="text"]{width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:7px 10px 7px 28px;color:var(--text);font-family:'Syne',sans-serif;font-size:12px;outline:none;transition:border-color 0.15s;}
  input[type="text"]:focus{border-color:var(--accent);}
  input::placeholder{color:var(--muted);}
  .tags-bar{padding:8px 14px;display:flex;gap:6px;overflow-x:auto;border-bottom:1px solid var(--border);scrollbar-width:none;}
  .tag-pill{flex-shrink:0;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;cursor:pointer;background:var(--surface2);color:var(--muted);border:1px solid var(--border);transition:all 0.15s;}
  .tag-pill:hover,.tag-pill.active{background:var(--tag-bg);color:var(--tag-text);border-color:var(--accent);}
  .list{flex:1;overflow-y:auto;padding:10px;display:flex;flex-direction:column;gap:8px;scrollbar-width:thin;scrollbar-color:var(--border) transparent;}
  .empty{text-align:center;padding:40px 20px;color:var(--muted);}
  .empty-icon{font-size:32px;margin-bottom:10px;}
  .empty-title{font-size:13px;font-weight:600;margin-bottom:4px;color:var(--text);}
  .empty-sub{font-size:11px;line-height:1.5;}
  .card{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:11px 12px;cursor:pointer;transition:all 0.15s;position:relative;overflow:hidden;}
  .card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--accent);opacity:0;transition:opacity 0.15s;}
  .card:hover{border-color:var(--accent);background:var(--surface2);transform:translateX(2px);}
  .card:hover::before{opacity:1;}
  .card-top{display:flex;align-items:flex-start;gap:6px;margin-bottom:7px;}
  .card-name{flex:1;font-size:12px;font-weight:600;color:var(--text);line-height:1.3;word-break:break-word;}
  .lang-badge{font-family:'JetBrains Mono',monospace;font-size:9px;padding:2px 6px;border-radius:4px;background:rgba(124,106,247,0.15);color:var(--accent2);border:1px solid rgba(124,106,247,0.3);flex-shrink:0;}
  .code-preview{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted);background:rgba(0,0,0,0.3);border-radius:6px;padding:6px 8px;margin-bottom:8px;white-space:pre;overflow:hidden;max-height:44px;line-height:1.5;border:1px solid rgba(255,255,255,0.04);}
  .card-footer{display:flex;align-items:center;gap:6px;}
  .card-tag{font-size:10px;color:var(--tag-text);background:var(--tag-bg);padding:2px 7px;border-radius:10px;font-weight:600;}
  .card-date{font-size:10px;color:var(--muted);margin-left:auto;font-family:'JetBrains Mono',monospace;}
  .actions{display:flex;gap:4px;margin-left:4px;}
  .btn{padding:3px 8px;border-radius:5px;font-size:10px;font-weight:600;cursor:pointer;border:1px solid transparent;font-family:'Syne',sans-serif;transition:all 0.1s;}
  .btn-insert{background:rgba(124,106,247,0.15);color:var(--accent2);border-color:rgba(124,106,247,0.3);}
  .btn-insert:hover{background:var(--accent);color:white;border-color:var(--accent);}
  .btn-copy{background:rgba(52,211,153,0.1);color:var(--success);border-color:rgba(52,211,153,0.2);}
  .btn-copy:hover{background:var(--success);color:#0d0d0f;}
  .btn-del{background:rgba(248,113,113,0.1);color:var(--danger);border-color:rgba(248,113,113,0.2);}
  .btn-del:hover{background:var(--danger);color:white;}
  .footer-bar{padding:8px 14px;border-top:1px solid var(--border);background:var(--surface);font-size:10px;color:var(--muted);text-align:center;}
</style>
</head>
<body>
<div class="header">
  <div class="header-top">
    <div class="logo">⬡</div>
    <span class="title">SnippetBox</span>
    <span class="count" id="count">0 snippets</span>
  </div>
  <div class="search-wrap">
    <span class="search-icon">⌕</span>
    <input type="text" id="search" placeholder="Search snippets..." oninput="filterSnippets()"/>
  </div>
</div>
<div class="tags-bar" id="tagsBar"></div>
<div class="list" id="list"></div>
<div class="footer-bar">Select code → Right-click → Save to SnippetBox</div>
<script>
  const vscode = acquireVsCodeApi();
  let allSnippets = ${snippetsJson};
  let allTags = ${tagsJson};
  let activeTag = 'all';

  function renderTags() {
    const bar = document.getElementById('tagsBar');
    const tags = ['all', ...allTags];
    bar.innerHTML = tags.map(t =>
      '<div class="tag-pill ' + (activeTag===t?'active':'') + '" onclick="setTag(\\'' + t + '\\')">' + (t==='all'?'✦ All':t) + '</div>'
    ).join('');
  }

  function setTag(tag) { activeTag = tag; renderTags(); renderList(); }

  function filterSnippets() { renderList(); }

  function getFiltered() {
    let list = allSnippets;
    if (activeTag !== 'all') list = list.filter(s => s.tag === activeTag);
    const q = document.getElementById('search').value.toLowerCase();
    if (q) list = list.filter(s => s.name.toLowerCase().includes(q) || s.tag.toLowerCase().includes(q) || s.language.toLowerCase().includes(q) || s.code.toLowerCase().includes(q));
    return list;
  }

  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', {day:'2-digit',month:'short'});
  }

  function esc(str) { return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function renderList() {
    const list = document.getElementById('list');
    const filtered = getFiltered();
    document.getElementById('count').textContent = allSnippets.length + ' snippet' + (allSnippets.length!==1?'s':'');
    if (filtered.length === 0) {
      list.innerHTML = '<div class="empty"><div class="empty-icon">◈</div><div class="empty-title">' + (allSnippets.length===0?'No snippets yet':'No results') + '</div><div class="empty-sub">' + (allSnippets.length===0?'Select code → right-click → Save to SnippetBox':'Try different search') + '</div></div>';
      return;
    }
    list.innerHTML = filtered.map(s =>
      '<div class="card"><div class="card-top"><div class="card-name">' + esc(s.name) + '</div><span class="lang-badge">' + esc(s.language) + '</span></div>' +
      '<div class="code-preview">' + esc(s.code.split("\\n").slice(0,3).join("\\n")) + '</div>' +
      '<div class="card-footer"><span class="card-tag">#' + esc(s.tag) + '</span><span class="card-date">' + formatDate(s.createdAt) + '</span>' +
      '<div class="actions">' +
      '<button class="btn btn-insert" onclick=\'vscode.postMessage({type:"insert",code:' + JSON.stringify(s.code) + '})\'>↵ Insert</button>' +
      '<button class="btn btn-copy" onclick=\'vscode.postMessage({type:"copy",code:' + JSON.stringify(s.code) + '})\'>⎘ Copy</button>' +
      '<button class="btn btn-del" onclick=\'vscode.postMessage({type:"delete",id:"' + s.id + '"})\'>✕</button>' +
      '</div></div></div>'
    ).join('');
  }

  renderTags();
  renderList();
</script>
</body>
</html>`;
    }
}
exports.SnippetPanelProvider = SnippetPanelProvider;
//# sourceMappingURL=snippetPanelProvider.js.map