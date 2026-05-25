import re, os
os.chdir(os.path.expanduser('~/hype-x'))

# === 1. PATCH index.html ===
with open('index.html', 'r') as f:
    html = f.read()

# Change the 4 broken inline-onclick tabs to lang-tab + data-lang so bindEvents() catches them
html = html.replace(
    "        <div class=\"tab\" onclick=\"switchTab('python',this)\">PYTHON</div>\n"
    "        <div class=\"tab\" onclick=\"switchTab('cpp',this)\">C / C++</div>\n"
    "        <div class=\"tab\" onclick=\"switchTab('rust',this)\">RUST</div>\n"
    "        <div class=\"tab active\" onclick=\"switchTab('mixed',this)\">MIXED</div>",
    "        <div class=\"lang-tab\" data-lang=\"python\">PYTHON</div>\n"
    "        <div class=\"lang-tab\" data-lang=\"cpp\">C / C++</div>\n"
    "        <div class=\"lang-tab\" data-lang=\"rust\">RUST</div>\n"
    "        <div class=\"lang-tab active\" data-lang=\"mixed\">MIXED</div>"
)

# Add console output panel before the preview iframe if not present
if 'id="console-out"' not in html:
    html = html.replace(
        '<iframe id="preview-frame"',
        '<pre id="console-out" style="display:none;background:#0a0a0a;color:#00ff41;font-family:monospace;padding:1rem;height:100%;overflow:auto;white-space:pre-wrap;border:1px solid #ff003c;margin:0;"></pre>\n        <iframe id="preview-frame"'
    )

with open('index.html', 'w') as f:
    f.write(html)

# === 2. PATCH app.js ===
with open('js/app.js', 'r') as f:
    js = f.read()

# Fix all default lang assignments from 'html' to 'mixed'
js = js.replace("fs.currentLang = 'html';", "fs.currentLang = 'mixed';")
js = js.replace("setLangTabActive('html');", "setLangTabActive('mixed');")
js = js.replace("editor.loadLang(name, 'html');", "editor.loadLang(name, 'mixed');")
js = js.replace("editor.loadLang(importedName, 'html');", "editor.loadLang(importedName, 'mixed');")

# New runPreview that handles python/cpp/rust via HXEngines and keeps mixed as iframe
new_run = '''    function runPreview() {
        if (!fs.currentProject) { els.previewFrame.srcdoc = '<p style="color:red;padding:20px;">No active project</p>'; return; }
        const consoleOut = document.getElementById('console-out');
        const frame = els.previewFrame;

        if (fs.currentLang === 'mixed') {
            if (consoleOut) consoleOut.style.display = 'none';
            frame.style.display = 'block';
            frame.srcdoc = fs.projects[fs.currentProject].mixed || '';
            return;
        }

        frame.style.display = 'none';
        if (consoleOut) consoleOut.style.display = 'block';

        const src = editor.getValue();
        if (fs.currentLang === 'python') {
            HXEngines.initPython().then(() => {
                if (consoleOut) consoleOut.textContent = HXEngines.runPython(src);
            });
        } else if (fs.currentLang === 'cpp') {
            if (consoleOut) consoleOut.textContent = HXEngines.runCPP(src);
        } else if (fs.currentLang === 'rust') {
            HXEngines.runRust(src).then(out => {
                if (consoleOut) consoleOut.textContent = out;
            });
        } else {
            if (consoleOut) consoleOut.textContent = 'Unknown language: ' + fs.currentLang;
        }
    }'''

# Find old runPreview by brace counting and replace it
m = re.search(r'(\s+)function\s+runPreview\s*\([^)]*\)\s*\{', js)
if m:
    start = m.start()
    brace = js.find('{', m.end() - 1)
    depth = 1
    i = brace + 1
    while i < len(js) and depth > 0:
        if js[i] == '{': depth += 1
        elif js[i] == '}': depth -= 1
        i += 1
    js = js[:start] + new_run + js[i:]
    print('Replaced runPreview()')
else:
    print('WARNING: runPreview() not found — manual fix needed')

with open('js/app.js', 'w') as f:
    f.write(js)

print('Patch complete.')
