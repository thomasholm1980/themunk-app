import json
with open('packages/core/package.json', 'r') as f:
    pkg = json.load(f)
pkg['exports']['./state/pattern-engine-v1'] = './state/pattern-engine-v1.ts'
with open('packages/core/package.json', 'w') as f:
    json.dump(pkg, f, indent=2)
print('written ok')
