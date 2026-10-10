import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    if "paddingTop: Platform.OS" in content and filepath != "mobile/app/(patient)/medicines.tsx":
        pass

    # Fix imports
    rn_import_match = re.search(r"import\s+{([^}]+)}\s+from\s+'react-native'", content)
    if rn_import_match:
        imports = rn_import_match.group(1)
        new_imports = imports
        if 'Platform' not in imports:
            new_imports += ", Platform"
        if 'StatusBar' not in imports:
            new_imports += ", StatusBar"
        
        if imports != new_imports:
            content = content.replace(imports, new_imports)

    # Add padding to safeArea
    safe_area_match = re.search(r"(safeArea:\s*{\s*)([^}]+?)\s*}", content)
    if safe_area_match:
        inner = safe_area_match.group(2)
        if "paddingTop" not in inner:
            replacement = safe_area_match.group(1) + inner + ",\n    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,\n  }"
            content = content.replace(safe_area_match.group(0), replacement)
            
    with open(filepath, 'w') as f:
        f.write(content)

for root, _, files in os.walk('mobile/app'):
    for file in files:
        if file.endswith('.tsx'):
            process_file(os.path.join(root, file))
