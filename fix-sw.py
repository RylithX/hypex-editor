import sys

try:
    with open('index.html', 'r') as f:
        content = f.read()
except FileNotFoundError:
    print('index.html not found')
    sys.exit(1)

# Remove the broken trailing script
content = content.replace('''
</body>
</html>
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered'))
      .catch(err => console.log('SW failed', err));
  }
</script>''', '''</body>
</html>''')

# Add the script properly before </body>
sw_script = '''<<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered'))
      .catch(err => console.log('SW failed', err));
  }
</script>
'''

if '</body>' in content:
    content = content.replace('</body>', sw_script + '</body>', 1)

with open('index.html', 'w') as f:
    f.write(content)

print('Fixed service worker placement')
