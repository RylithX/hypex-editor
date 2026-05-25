/* Hype-X Language Runner — wire into your Run button */
const HXRunner = (() => {
  let currentTab = 'python';

  function getConsole() {
    let pre = document.getElementById('console-out');
    if (!pre) {
      pre = document.createElement('pre');
      pre.id = 'console-out';
      pre.style.cssText = `
        display:none; background:#0a0a0a; color:#00ff41;
        font-family:'Courier New',monospace; padding:1rem;
        height:100%; overflow:auto; white-space:pre-wrap;
        border:1px solid #ff003c; margin:0;
      `;
      const preview = document.getElementById('preview-frame');
      if (preview && preview.parentNode) preview.parentNode.appendChild(pre);
    }
    return pre;
  }

  function showConsole(text) {
    const preview = document.getElementById('preview-frame');
    const pre = getConsole();
    if (preview) preview.style.display = 'none';
    pre.style.display = 'block';
    pre.textContent = text;
  }

  function restoreIframe() {
    const preview = document.getElementById('preview-frame');
    const pre = document.getElementById('console-out');
    if (preview) preview.style.display = 'block';
    if (pre) pre.style.display = 'none';
  }

  return {
    setTab(tab) {
      currentTab = tab;
      if (tab === 'mixed') restoreIframe();
      if (tab === 'python') HXEngines.initPython();
    },

    async run(src) {
      if (currentTab === 'mixed') {
        // Try common existing preview functions, fallback to srcdoc
        if (typeof updateIframe === 'function') updateIframe(src);
        else if (typeof setPreview === 'function') setPreview(src);
        else {
          const frame = document.getElementById('preview-frame');
          if (frame) frame.srcdoc = src;
        }
        restoreIframe();
        return;
      }

      let out = '';
      if (currentTab === 'python') out = await HXEngines.runPython(src);
      else if (currentTab === 'cpp') out = HXEngines.runCPP(src);
      else if (currentTab === 'rust') out = await HXEngines.runRust(src);
      else out = 'Unknown tab: ' + currentTab;

      showConsole(out);
    },

    getTemplate(tab) {
      return HXEngines.templates[tab] || '';
    }
  };
})();
