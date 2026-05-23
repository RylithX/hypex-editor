(function() {
    const fs = new FileSystem(); let editor; let autoRunTimer = null; let isFullscreen = false;
    const els = { projectTabs: document.getElementById('project-tabs'), langTabs: document.getElementById('lang-tabs'), previewFrame: document.getElementById('preview-frame'), previewSection: document.getElementById('preview-section'), importInput: document.getElementById('import-input') };
    function init() {
        editor = new EditorManager(fs, handleEditorEvent);
        const projects = Object.keys(fs.projects);
        if (projects.length > 0) { fs.currentProject = projects[0]; fs.currentLang = 'html'; }
        renderProjectTabs(); setLangTabActive(fs.currentLang); editor.loadLang(fs.currentProject, fs.currentLang); bindEvents(); runPreview();
    }
    function handleEditorEvent(type) { if (type === 'save') { if (fs.saveToStorage()) flashStatus('SNAPSHOT SAVED'); } else if (type === 'run') { runPreview(); } else if (type === 'content') { clearTimeout(autoRunTimer); autoRunTimer = setTimeout(runPreview, 1000); } }
    function bindEvents() {
        document.getElementById('btn-new-project').addEventListener('click', createNewProject);
        document.getElementById('btn-save').addEventListener('click', () => { if (fs.saveToStorage()) flashStatus('SNAPSHOT SAVED'); });
        document.getElementById('btn-export').addEventListener('click', exportCurrentProject);
        document.getElementById('btn-import').addEventListener('click', () => els.importInput.click());
        document.getElementById('btn-run').addEventListener('click', runPreview);
        document.getElementById('btn-fullscreen').addEventListener('click', toggleFullscreen);
        els.importInput.addEventListener('change', handleImport);
        els.langTabs.querySelectorAll('.lang-tab').forEach(tab => {
            tab.addEventListener('click', () => { const lang = tab.dataset.lang; fs.currentLang = lang; setLangTabActive(lang); editor.loadLang(fs.currentProject, lang); runPreview(); });
        });
    }
    function toggleFullscreen() {
        isFullscreen = !isFullscreen;
        els.previewSection.classList.toggle('fullscreen', isFullscreen);
        document.getElementById('btn-fullscreen').textContent = isFullscreen ? '⛶ EXIT' : '⛶ FULLSCREEN';
    }
    function renderProjectTabs() {
        els.projectTabs.innerHTML = '';
        Object.keys(fs.projects).forEach(name => {
            const isActive = fs.currentProject === name;
            const tab = document.createElement('div'); tab.className = `project-tab ${isActive ? 'active' : ''}`;
            tab.innerHTML = `<span>${escapeHtml(name)}</span><span class="project-tab-close" data-name="${escapeHtml(name)}">×</span>`;
            tab.addEventListener('click', (e) => { if (e.target.classList.contains('project-tab-close')) return; fs.currentProject = name; renderProjectTabs(); editor.loadLang(fs.currentProject, fs.currentLang); runPreview(); });
            tab.querySelector('.project-tab-close').addEventListener('click', () => { if (confirm(`Close "${name}"?`)) { fs.deleteProject(name); renderProjectTabs(); editor.loadLang(fs.currentProject, fs.currentLang); runPreview(); } });
            els.projectTabs.appendChild(tab);
        });
    }
    function setLangTabActive(lang) { els.langTabs.querySelectorAll('.lang-tab').forEach(t => { t.classList.toggle('active', t.dataset.lang === lang); }); }
    function createNewProject() { const name = prompt('Enter new project name:'); if (!name) return; if (fs.createProject(name)) { fs.currentProject = name; fs.currentLang = 'html'; renderProjectTabs(); setLangTabActive('html'); editor.loadLang(name, 'html'); runPreview(); } else { alert('Project already exists or name invalid!'); } }
    function runPreview() {
        if (!fs.currentProject) { els.previewFrame.srcdoc = '<p style="color:red;padding:20px;">No active project</p>'; return; }
        const p = fs.projects[fs.currentProject];
        let html;
        if (fs.currentLang === 'mixed') {
            html = p.mixed || '';
        } else {
            html = p.html || ''; const css = p.css || ''; const js = p.js || '';
            const styleTag = `<style>\n${css}\n</style>`; const scriptTag = `<script>\n${js}\n</script>`;
            if (html.includes('</head>')) html = html.replace('</head>', styleTag + '\n</head>');
            else if (html.includes('<head>')) html = html.replace('<head>', '<head>\n' + styleTag);
            else if (html.includes('<html>')) html = html.replace('<html>', '<html>\n<head>' + styleTag + '\n</head>');
            else html = '<head>' + styleTag + '</head>\n' + html;
            if (html.includes('</body>')) html = html.replace('</body>', scriptTag + '\n</body>');
            else if (html.includes('<body>')) html = html.replace('<body>', '<body>\n' + scriptTag);
            else html += '\n' + scriptTag;
        }
        els.previewFrame.srcdoc = html;
    }
    function exportCurrentProject() { if (!fs.currentProject) { alert('No project selected'); return; } const data = fs.exportProject(fs.currentProject); if (!data) return; const blob = new Blob([data], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${fs.currentProject}-hypex.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); flashStatus('EXPORTED .JSON'); }
    function handleImport(e) { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = (event) => { const importedName = fs.importProject(event.target.result); if (importedName) { fs.currentProject = importedName; fs.currentLang = 'html'; renderProjectTabs(); setLangTabActive('html'); editor.loadLang(importedName, 'html'); runPreview(); flashStatus('IMPORTED .JSON'); } else { alert('Invalid JSON format'); } }; reader.readAsText(file); e.target.value = ''; }
    function flashStatus(msg) { const status = document.querySelector('.system-title'); const original = status.textContent; status.textContent = msg; status.style.color = '#00ff88'; setTimeout(() => { status.textContent = original; status.style.color = '#ff0033'; }, 2000); }
    function escapeHtml(text) { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }
    init();
})();
