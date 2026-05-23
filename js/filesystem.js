class FileSystem {
    constructor() { this.projects = this.loadFromStorage(); this.currentProject = null; this.currentLang = 'html'; }
    loadFromStorage() { try { const data = localStorage.getItem('hypex-projects-v2'); if (data) return JSON.parse(data); } catch (e) {} return this.getDefaultProjects(); }
    getDefaultProjects() {
        return {
            'Project 1': {
                created: Date.now(),
                html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<title>Hype-X Demo</title>\n<style>\nbody { font-family: "Segoe UI", sans-serif; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #eee; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }\nh1 { color: #ff0033; text-shadow: 0 0 20px rgba(255,0,51,0.5); }\n.card { background: rgba(255,255,255,0.05); padding: 30px; border-radius: 15px; border: 1px solid rgba(255,0,51,0.2); text-align: center; }\nbutton { padding: 10px 20px; background: #ff0033; color: #fff; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; margin-top: 15px; }\n</style>\n</head>\n<body>\n<div class="card">\n<h1>🚀 Hype-X</h1>\n<p>Edit the code and click <b>RUN</b>!</p>\n<button onclick="alert(\'Hello from Hype-X!\')">Click Me</button>\n</div>\n<script>\nconsole.log("Hype-X is running!");\ndocument.querySelector("h1").addEventListener("click", () => { document.querySelector("h1").style.color = "#00ff88"; });\n</script>\n</body>\n</html>',
                css: '/* Hype-X Styles */\nbody { transition: all 0.3s ease; }\n.card:hover { transform: scale(1.02); }',
                js: '// Hype-X JavaScript\nconsole.log("Project 1 loaded");',
                mixed: '<!DOCTYPE html>\n<html>\n<head>\n<style>\nbody { background: #1a1a2e; color: #fff; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }\n.box { background: rgba(255,0,51,0.1); border: 1px solid #ff0033; padding: 40px; border-radius: 10px; text-align: center; }\n</style>\n</head>\n<body>\n<div class="box">\n<h1>Mixed Mode</h1>\n<p>Paste your complete HTML here with CSS and JS included!</p>\n</div>\n<script>\nconsole.log("Mixed mode active");\n</script>\n</body>\n</html>'
            }
        };
    }
    saveToStorage() { try { localStorage.setItem('hypex-projects-v2', JSON.stringify(this.projects)); return true; } catch (e) { return false; } }
    createProject(name) { if (!name || this.projects[name]) return false; this.projects[name] = { created: Date.now(), html: '<!DOCTYPE html>\n<html>\n<head><title>' + name + '</title></head>\n<body>\n<h1>Hello World</h1>\n</body>\n</html>', css: '/* Styles */', js: '// JavaScript', mixed: '<!DOCTYPE html>\n<html>\n<head><title>' + name + ' Mixed</title></head>\n<body>\n<h1>Mixed Mode</h1>\n</body>\n</html>' }; this.saveToStorage(); return true; }
    deleteProject(name) { if (!this.projects[name]) return false; delete this.projects[name]; if (this.currentProject === name) { const remaining = Object.keys(this.projects); this.currentProject = remaining.length > 0 ? remaining[0] : null; } this.saveToStorage(); return true; }
    renameProject(oldName, newName) { if (!oldName || !newName || oldName === newName || this.projects[newName]) return false; this.projects[newName] = this.projects[oldName]; delete this.projects[oldName]; if (this.currentProject === oldName) this.currentProject = newName; this.saveToStorage(); return true; }
    getFile(project, lang) { return this.projects[project]?.[lang] ?? ''; }
    updateFile(project, lang, content) { if (this.projects[project] && this.projects[project][lang] !== undefined) { this.projects[project][lang] = content; this.saveToStorage(); return true; } return false; }
    exportProject(name) { if (!this.projects[name]) return null; return JSON.stringify({ name, exported: Date.now(), data: this.projects[name] }, null, 2); }
    importProject(jsonString) { try { const parsed = JSON.parse(jsonString); if (!parsed.name || !parsed.data || !parsed.data.html) return null; let name = parsed.name; let counter = 1; while (this.projects[name]) { name = parsed.name + '-' + counter; counter++; } this.projects[name] = { created: Date.now(), html: parsed.data.html, css: parsed.data.css || '', js: parsed.data.js || '', mixed: parsed.data.mixed || '' }; this.saveToStorage(); return name; } catch (e) { return null; } }
    getMode(lang) { if (lang === 'html') return 'htmlmixed'; if (lang === 'css') return 'css'; if (lang === 'js') return 'javascript'; return 'htmlmixed'; }
}
