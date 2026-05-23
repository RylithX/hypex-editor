class EditorManager {
    constructor(fs, onChangeCallback) { this.fs = fs; this.onChange = onChangeCallback; this.cm = null; this.init(); }
    init() {
        const textarea = document.getElementById('code-editor');
        this.cm = CodeMirror.fromTextArea(textarea, {
            lineNumbers: true, mode: 'htmlmixed', theme: 'monokai', autoCloseBrackets: true, matchBrackets: true,
            lineWrapping: true, indentUnit: 4, tabSize: 4, indentWithTabs: false,
            extraKeys: {
                'Ctrl-S': (cm) => { this.onChange('save'); return false; },
                'Ctrl-Enter': (cm) => { this.onChange('run'); return false; }
            }
        });
        this.cm.on('change', () => { if (this.fs.currentProject) { this.fs.updateFile(this.fs.currentProject, this.fs.currentLang, this.cm.getValue()); this.onChange('content'); } });
    }
    loadLang(project, lang) { if (!project) { this.cm.setValue(''); return; } const content = this.fs.getFile(project, lang); const mode = this.fs.getMode(lang); this.cm.setOption('mode', mode); this.cm.setValue(content || ''); this.cm.clearHistory(); this.cm.focus(); }
    getValue() { return this.cm.getValue(); }
    refresh() { this.cm.refresh(); }
}
