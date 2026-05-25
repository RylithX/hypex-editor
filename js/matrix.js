(function(){
  const c = document.getElementById('matrix');
  if (!c) return;
  const x = c.getContext('2d');
  let w, h, columns, drops;
  const resize = () => {
    w = c.width = window.innerWidth;
    h = c.height = window.innerHeight;
    columns = Math.floor(w / 14);
    drops = Array(columns).fill(1);
  };
  window.addEventListener('resize', resize);
  resize();
  const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
  const draw = () => {
    x.fillStyle = 'rgba(5,5,5,0.05)';
    x.fillRect(0,0,w,h);
    x.fillStyle = '#ff0033';
    x.font = '14px monospace';
    for (let i = 0; i < drops.length; i++) {
      x.fillText(chars[Math.floor(Math.random()*chars.length)], i*14, drops[i]*14);
      if (drops[i]*14 > h && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
    requestAnimationFrame(draw);
  };
  draw();
})();
