import os
import base64

assets_dir = 'mobile/assets'
os.makedirs(assets_dir, exist_ok=True)

# 1x1 transparent PNG base64
png_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
png_data = base64.b64decode(png_b64)

files_to_create = [
    'icon.png',
    'splash.png',
    'adaptive-icon.png',
    'notification-icon.png'
]

for filename in files_to_create:
    filepath = os.path.join(assets_dir, filename)
    with open(filepath, 'wb') as f:
        f.write(png_data)
        
print("Assets created successfully.")
