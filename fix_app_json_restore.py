import json

with open('mobile/app.json', 'r') as f:
    data = json.load(f)

data['expo']['icon'] = "./assets/icon.png"
data['expo']['splash']['image'] = "./assets/splash.png"
data['expo']['android']['adaptiveIcon']['foregroundImage'] = "./assets/adaptive-icon.png"

plugins = data['expo'].get('plugins', [])
for i, plugin in enumerate(plugins):
    if isinstance(plugin, list) and plugin[0] == 'expo-notifications':
        plugin[1]['icon'] = "./assets/notification-icon.png"

with open('mobile/app.json', 'w') as f:
    json.dump(data, f, indent=2)

