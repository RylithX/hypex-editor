(function(){
  let currentProject = 'default';
  let currentTab = 'html5';
  let projects = [];
  const els = {
    html5: document.getElementById('code-html5'),
    css3: document.getElementById('code-css3'),
    js: document.getElementById('code-js'),
    mixed: document.getElementById('code-mixed'),
    preview: document.getElementById('preview'),
    projectList: document.getElementById('project-list'),
    importFile: document.getElementById('import-file')
  };
  function key(t,p){ return 'hypex_'+(p||currentProject)+'_'+t; }
  function loadProjectsList(){
    const stored = localStorage.getItem('hypex_projects');
    projects = stored ? JSON.parse(stored) : ['default'];
    renderProjects();
  }
  function saveProjectsList(){ localStorage.setItem('hypex_projects', JSON.stringify(projects)); }
  function loadProject(name){
    currentProject = name;
    els.html5.value = localStorage.getItem(key('html5')) || '';
    els.css3.value = localStorage.getItem(key('css3')) || '';
    els.js.value = localStorage.getItem(key('js')) || '';
    els.mixed.value = localStorage.getItem(key('mixed')) || '';
    renderProjects();
    runPreview();
  }
  function saveCurrent(){
    localStorage.setItem(key('html5'), els.html5.value);
    localStorage.setItem(key('css3'), els.css3.value);
    localStorage.setItem(key('js'), els.js.value);
    localStorage.setItem(key('mixed'), els.mixed.value);
  }
  function createProject(){
    const name = prompt('Project name:');
    if(!name || projects.includes(name)) return alert('Invalid or duplicate name');
    projects.push(name);
    saveProjectsList();
    loadProject(name);
  }
  function deleteProject(name){
    if(!confirm('Delete '+name+'?')) return;
    projects = projects.filter(p=>p!==name);
    if(currentProject===name) currentProject = projects[0] || 'default';
    ['html5','css3','js','mixed'].forEach(t=>localStorage.removeItem('hypex_'+name+'_'+t));
    saveProjectsList();
    loadProject(currentProject);
  }
  function renderProjects(){
    els.projectList.innerHTML = '';
    projects.forEach(p=>{
      const div = document.createElement('div');
      div.className = 'project-item'+(p===currentProject?' active':'');
      div.innerHTML = '<span>'+p+'</span>';
      const del = document.createElement('button');
      del.textContent = '×';
      del.onclick = e=>{ e.stopPropagation(); deleteProject(p); };
      div.appendChild(del);
      div.onclick = ()=>loadProject(p);
      els.projectList.appendChild(div);
    });
  }
  function switchTab(tab){
    currentTab = tab;
    document.querySelectorAll('.editor-tabs button').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab));
    ['html5','css3','js','mixed'].forEach(t=>document.getElementById('code-'+t).style.display = t===tab?'block':'none');
  }
  function switchView(view){
    document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active', b.dataset.view===view));
    document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active', v.id===view+'-view'));
    if(view==='aura'){ if(window.aura && window.aura.start) window.aura.start(); }
    else { if(window.aura && window.aura.stop) window.aura.stop(); }
  }
  function runPreview(){
    saveCurrent();
    const mixed = els.mixed.value.trim();
    let srcdoc;
    if(mixed){ srcdoc = mixed; }
    else {
      srcdoc = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${els.css3.value}</style></head><body>${els.html5.value}<script>${els.js.value}<\/script></body></html>`;
    }
    els.preview.srcdoc = srcdoc;
  }
  function fullscreenPreview(){ els.preview.requestFullscreen(); }
  function exportJSON(){
    const data = {};
    projects.forEach(p=>{
      data[p] = { html5:localStorage.getItem('hypex_'+p+'_html5')||'', css3:localStorage.getItem('hypex_'+p+'_css3')||'', js:localStorage.getItem('hypex_'+p+'_js')||'', mixed:localStorage.getItem('hypex_'+p+'_mixed')||'' };
    });
    const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'hypex-backup.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }
  function importJSON(file){
    const reader = new FileReader();
    reader.onload = ()=>{
      try{
        const data = JSON.parse(reader.result);
        Object.keys(data).forEach(p=>{
          if(!projects.includes(p)) projects.push(p);
          ['html5','css3','js','mixed'].forEach(t=>localStorage.setItem('hypex_'+p+'_'+t, data[p][t]||''));
        });
        saveProjectsList();
        loadProject(Object.keys(data)[0] || currentProject);
        alert('Import successful');
      }catch(e){ alert('Invalid JSON'); }
    };
    reader.readAsText(file);
  }
  function initLogoGlitch(){
    const letters = document.querySelectorAll('.logo-letter');
    setInterval(()=>{
      const t = Date.now() % 12000;
      if((t<5000)||(t>6000 && t<11000)){
        const l = letters[Math.floor(Math.random()*letters.length)];
        l.style.textShadow = (Math.random()>0.5?'2px 0 #fff, -2px 0 #ff0033':'-2px 0 #fff, 2px 0 #ff0033');
        l.style.transform = `translate(${Math.random()*6-3}px,${Math.random()*4-2}px)`;
        l.style.color = '#fff';
        setTimeout(()=>{ l.style.textShadow=''; l.style.transform=''; l.style.color=''; }, 60+Math.random()*100);
      }
    }, 120);
  }
  document.addEventListener('DOMContentLoaded', ()=>{
    loadProjectsList();
    loadProject(currentProject);
    document.querySelectorAll('.editor-tabs button').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.tab)));
    document.querySelectorAll('.nav-btn').forEach(b=>b.addEventListener('click',()=>switchView(b.dataset.view)));
    document.getElementById('btn-run').addEventListener('click', runPreview);
    document.getElementById('btn-fullscreen').addEventListener('click', fullscreenPreview);
    document.getElementById('btn-new-project').addEventListener('click', createProject);
    document.getElementById('btn-export').addEventListener('click', exportJSON);
    document.getElementById('btn-import').addEventListener('click', ()=>els.importFile.click());
    els.importFile.addEventListener('change', e=>{ if(e.target.files[0]) importJSON(e.target.files[0]); });
    ['html5','css3','js','mixed'].forEach(t=>document.getElementById('code-'+t).addEventListener('input', saveCurrent));
    initLogoGlitch();
    runPreview();
  });
})();
