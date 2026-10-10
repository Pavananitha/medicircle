import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Fix the missing comma before Platform
    content = re.sub(r"([a-zA-Z]+)\s+Platform,", r"\1, Platform,", content)
    
    with open(filepath, 'w') as f:
        f.write(content)

for root, _, files in os.walk('mobile/app'):
    for file in files:
        if file.endswith('.tsx'):
            process_file(os.path.join(root, file))
