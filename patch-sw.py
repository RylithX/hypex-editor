import sys

try:
    with open('index.html', 'r') as f:
        content = f.read()
except FileNotFoundError:
    print('index.html not found')
    sys.exit(1)

sw_script = '''
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered'))
      .catch(err => console.log('SW failed', err));
  }
</script>
'''

if 'sw.js' in content:
    print('Service worker already registered')
    sys.exit(0)

if '</body>' in content:
    content = content.replace('</body>', sw_script + '</body>', 1)
elif '</BODY>' in content:
    content = content.replace('</BODY>', sw_script + '</BODY>', 1)
else:
    # Append to end if no body tag found
    content = content + sw_script

with open('index.html', 'w') as f:
    f.write(content)

print('Service worker registered in index.html')
