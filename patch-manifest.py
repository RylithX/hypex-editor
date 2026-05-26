import sys

try:
    with open('index.html', 'r') as f:
        content = f.read()
except FileNotFoundError:
    print('index.html not found')
    sys.exit(1)

if 'manifest.json' in content:
    print('Already patched')
    sys.exit(0)

insert = '  <link rel="manifest" href="/manifest.json">\n  <meta name="theme-color" content="#ff0000">\n'

if '</head>' in content:
    content = content.replace('</head>', insert + '</head>', 1)
elif '</HEAD>' in content:
    content = content.replace('</HEAD>', insert + '</HEAD>', 1)
else:
    print('Could not find </head> tag')
    sys.exit(1)

with open('index.html', 'w') as f:
    f.write(content)

print('index.html patched')
