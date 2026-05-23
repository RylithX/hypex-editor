(function() {
    const canvas = document.getElementById('matrix-canvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    function resize() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }
    resize(); window.addEventListener('resize', resize);
    const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const nums = '0123456789';
    const symbols = 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ';
    const alphabet = katakana + latin + nums + symbols;
    const fontSize = 16;
    let columns = Math.floor(width / fontSize);
    const drops = [], speeds = [], glowIntensity = [];
    function initDrops() {
        columns = Math.floor(width / fontSize);
        drops.length = 0; speeds.length = 0; glowIntensity.length = 0;
        for (let i = 0; i < columns; i++) { drops[i] = Math.random() * -100; speeds[i] = 0.3 + Math.random() * 1.2; glowIntensity[i] = 0.2 + Math.random() * 0.8; }
    }
    initDrops(); window.addEventListener('resize', initDrops);
    const baseRed = '#ff0033', brightRed = '#ff3355', dimRed = '#330000';
    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.07)'; ctx.fillRect(0, 0, width, height);
        ctx.font = fontSize + 'px monospace';
        for (let i = 0; i < drops.length; i++) {
            const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
            const x = i * fontSize, y = drops[i] * fontSize;
            ctx.shadowBlur = 10 * glowIntensity[i]; ctx.shadowColor = baseRed;
            ctx.fillStyle = brightRed; ctx.fillText(text, x, y);
            ctx.shadowBlur = 5 * glowIntensity[i]; ctx.fillStyle = baseRed; ctx.fillText(text, x, y - fontSize);
            ctx.shadowBlur = 0; ctx.fillStyle = dimRed; ctx.fillText(text, x, y - fontSize * 2);
            if (y > height && Math.random() > 0.99) { drops[i] = 0; speeds[i] = 0.3 + Math.random() * 1.2; glowIntensity[i] = 0.2 + Math.random() * 0.8; }
            drops[i] += speeds[i] * 0.35;
        }
    }
    setInterval(draw, 70);
})();
