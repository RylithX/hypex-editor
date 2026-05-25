window.aura = (function(){
  let scene, camera, renderer, analyser, dataArray, audioCtx, source, gainNode;
  let animationId, mode = 'tree', isPlaying = false, initialized = false;
  let treeGroup, dreamMesh, particles;
  const canvas = document.getElementById('aura-canvas');

  function init(){
    if(!window.THREE){ console.error('Three.js not loaded'); return false; }
    if(initialized) return true;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 30;
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    window.addEventListener('resize', onResize);
    initialized = true;
    return true;
  }
  function onResize(){
    if(!camera || !renderer || !canvas) return;
    const parent = canvas.parentElement;
    const w = parent.clientWidth, h = parent.clientHeight;
    canvas.width = w; canvas.height = h;
    camera.aspect = w / h; camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  function initAudio(){
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if(audioCtx.state === 'suspended') audioCtx.resume();
  }
  function createAnalyser(){
    initAudio();
    if(analyser) analyser.disconnect();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    return analyser;
  }
  function loadFile(file){
    initAudio();
    const reader = new FileReader();
    reader.onload = ()=>{
      audioCtx.decodeAudioData(reader.result, buffer=>{
        stopAudio();
        source = audioCtx.createBufferSource();
        source.buffer = buffer; source.loop = true;
        gainNode = audioCtx.createGain(); gainNode.gain.value = 0.8;
        const a = createAnalyser();
        source.connect(a); a.connect(gainNode); gainNode.connect(audioCtx.destination);
        source.start(0); isPlaying = true;
      });
    };
    reader.readAsArrayBuffer(file);
  }
  function useMic(){
    initAudio();
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream=>{
      stopAudio();
      source = audioCtx.createMediaStreamSource(stream);
      createAnalyser(); source.connect(analyser);
      isPlaying = true;
    }).catch(err=>alert('Mic access denied: '+err.message));
  }
  function useSynth(){
    initAudio(); stopAudio();
    const osc = audioCtx.createOscillator();
    const lfo = audioCtx.createOscillator(); lfo.frequency.value = 0.5;
    const lfoGain = audioCtx.createGain(); lfoGain.gain.value = 100;
    lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
    osc.type = 'sawtooth'; osc.frequency.value = 55;
    gainNode = audioCtx.createGain(); gainNode.gain.value = 0.15;
    const a = createAnalyser();
    osc.connect(a); a.connect(gainNode); gainNode.connect(audioCtx.destination);
    osc.start(); lfo.start();
    source = { stop: ()=>{ osc.stop(); lfo.stop(); }, disconnect: ()=>{} };
    isPlaying = true;
  }
  function stopAudio(){
    if(source && source.stop) source.stop();
    if(source && source.disconnect) source.disconnect();
    source = null; isPlaying = false;
  }
  function clearScene(){
    if(!scene) return;
    while(scene.children.length > 0) scene.remove(scene.children[0]);
    treeGroup = null; dreamMesh = null; particles = null;
  }
  function buildParticles(count, color, size){
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for(let i=0;i<count*3;i++) pos[i] = (Math.random()-0.5)*80;
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: color, size: size, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);
    return pts;
  }
  function buildTree(){
    const group = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color: 0xff0033, wireframe: true });
    function branch(parent, len, depth){
      if(depth <= 0) return;
      const geo = new THREE.CylinderGeometry(0.1*depth, 0.15*depth, len, 5);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = len / 2;
      parent.add(mesh);
      for(let i=0;i<<2;i++){
        const sub = new THREE.Group();
        sub.position.y = len;
        sub.rotation.z = (i===0?1:-1)*(0.3+Math.random()*0.3);
        sub.rotation.x = Math.random()*0.3;
        mesh.add(sub);
        branch(sub, len*0.75, depth-1);
      }
    }
    const root = new THREE.Group();
    branch(root, 7, 7);
    root.rotation.x = Math.PI; root.position.y = -12;
    group.add(root);
    scene.add(group);
    return group;
  }
  function setMode(m){
    mode = m; clearScene();
    particles = buildParticles(4000, 0xff0033, 0.15);
    if(mode === 'tree'){ treeGroup = buildTree(); }
    else {
      const geo = new THREE.IcosahedronGeometry(10, 3);
      const mat = new THREE.MeshBasicMaterial({ color: 0xff0033, wireframe: true, transparent: true, opacity: 0.25 });
      dreamMesh = new THREE.Mesh(geo, mat);
      scene.add(dreamMesh);
    }
  }
  let time = 0;
  function animate(){
    animationId = requestAnimationFrame(animate);
    time += 0.01;
    let bass=0, mid=0, treble=0;
    if(analyser && isPlaying && dataArray){
      analyser.getByteFrequencyData(dataArray);
      const len = dataArray.length;
      for(let i=0;i<<len;i++){
        if(i < len*0.1) bass += dataArray[i];
        else if(i < len*0.5) mid += dataArray[i];
        else treble += dataArray[i];
      }
      bass = (bass/(len*0.1))/255;
      mid = (mid/(len*0.4))/255;
      treble = (treble/(len*0.5))/255;
    }
    if(mode==='tree' && treeGroup){
      treeGroup.rotation.y += 0.003 + bass*0.03;
      treeGroup.children[0].rotation.z = Math.sin(time)*0.1*(1+mid);
      if(particles){
        particles.rotation.y -= 0.002;
        const pos = particles.geometry.attributes.position.array;
        for(let i=1;i<<pos.length;i+=3){
          pos[i] += Math.sin(time*2+pos[i-1]*0.1)*0.03*(0.5+treble);
        }
        particles.geometry.attributes.position.needsUpdate = true;
      }
    } else if(dreamMesh){
      dreamMesh.rotation.x += 0.004 + bass*0.02;
      dreamMesh.rotation.y += 0.006 + mid*0.02;
      const s = 1 + treble*0.5;
      dreamMesh.scale.set(s,s,s);
      if(particles){ particles.rotation.y += 0.003; particles.rotation.x = Math.sin(time*0.5)*0.2; }
    }
    if(renderer && scene && camera) renderer.render(scene, camera);
  }
  function bindControls(){
    const el = id => document.getElementById(id);
    el('audio-file').addEventListener('change', e=>{ if(e.target.files[0]) loadFile(e.target.files[0]); });
    el('btn-mic').addEventListener('click', useMic);
    el('btn-synth').addEventListener('click', useSynth);
    el('btn-play-aura').addEventListener('click', ()=>{ initAudio(); isPlaying = true; });
    el('btn-stop-aura').addEventListener('click', stopAudio);
    el('aura-mode').addEventListener('change', e=>setMode(e.target.value));
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindControls);
  else bindControls();

  return {
    start: function(){
      if(!init()) return;
      if(!scene.children.length) setMode(mode);
      if(!animationId) animate();
      setTimeout(onResize, 50);
    },
    stop: function(){
      cancelAnimationFrame(animationId); animationId = null;
      stopAudio();
    }
  };
})();
