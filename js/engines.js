/* Hype-X Language Engines — drop-in execution layer */
const HXEngines = (() => {
  let pyodide = null;
  let pyodideReady = false;

  const templates = {
    python: `import sys, math

def main():
    print("Hype-X Python engine online")
    for i in range(3):
        print(f"Loop {i}: {math.pow(i,2)}")

main()`,

    cpp: `#include <iostream>
#include <cmath>

int main() {
    std::cout << "Hype-X C++ engine online" << std::endl;
    for (int i = 0; i < 3; i++) {
        std::cout << "Loop " << i << ": " << (i * i) << std::endl;
    }
    return 0;
}`,

    rust: `fn main() {
    println!("Hype-X Rust engine online");
    for i in 0..3 {
        println!("Loop {}: {}", i, i.pow(2));
    }
}`,

    mixed: `<!-- Hype-X Mixed Mode -->
<style>
  body{background:#000;color:#ff003c;font-family:monospace;display:grid;place-items:center;height:100vh;margin:0}
  h1{text-shadow:0 0 10px #ff003c}
</style>
<h1>MIXED MODE ACTIVE</h1>
<script>
  console.log("Mixed tab ready");
<<\/script>`
  };

  return {
    templates,

    /* ---------- Python (Pyodide) ---------- */
    async initPython() {
      if (pyodideReady) return;
      pyodide = await loadPyodide();
      pyodideReady = true;
      console.log('[Hype-X] Pyodide ready');
    },

    runPython(src) {
      if (!pyodideReady) return '⏳ Pyodide is still loading (first run takes ~3-5s)...';
      try {
        const buf = [];
        pyodide.setStdout({ batched: s => buf.push(s) });
        pyodide.setStderr({ batched: s => buf.push(s) });
        pyodide.runPython(src);
        return buf.join('') || '✓ Program finished with no output';
      } catch (e) {
        return String(e);
      }
    },

    /* ---------- C++ (JSCPP interpreter) ---------- */
    runCPP(src) {
      try {
        const buf = [];
        JSCPP.run(src, '', {
          stdio: { write: s => buf.push(s) }
        });
        return buf.join('') || '✓ Program finished with no output';
      } catch (e) {
        return String(e);
      }
    },

    /* ---------- Rust (Playground API) ---------- */
    async runRust(src) {
      try {
        const r = await fetch('https://play.rust-lang.org/evaluate.json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            version: 'stable',
            optimize: '0',
            code: src,
            edition: '2021'
          })
        });
        const j = await r.json();
        if (j.result === 'error') return j.stderr || 'Unknown compilation error';
        return (j.stdout || '') + (j.stderr || '') || '✓ Program finished with no output';
      } catch (e) {
        return '❌ Network / Playground error: ' + e.message;
      }
    }
  };
})();
