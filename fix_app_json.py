import json

with open('mobile/app.json', 'r') as f:
    data = json.load(f)

# Remove missing image references so Expo falls back to defaults
if 'icon' in data['expo']:
    del data['expo']['icon']

if 'splash' in data['expo']:
    if 'image' in data['expo']['splash']:
        del data['expo']['splash']['image']

if 'android' in data['expo']:
    if 'adaptiveIcon' in data['expo']['android']:
        if 'foregroundImage' in data['expo']['android']['adaptiveIcon']:
            del data['expo']['android']['adaptiveIcon']['foregroundImage']

# Fix plugins
plugins = data['expo'].get('plugins', [])
for i, plugin in enumerate(plugins):
    if isinstance(plugin, list) and plugin[0] == 'expo-notifications':
        if 'icon' in plugin[1]:
            del plugin[1]['icon']

with open('mobile/app.json', 'w') as f:
    json.dump(data, f, indent=2)

