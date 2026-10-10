import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Fix the import syntax error
    content = content.replace(", Platform, StatusBar} from 'react-native';", "  Platform,\n  StatusBar,\n} from 'react-native';")
    content = content.replace(", StatusBar} from 'react-native';", "  StatusBar,\n} from 'react-native';")
    
    # Also fix some cases where it might be on the same line but with a leading newline
    content = re.sub(r"\n, Platform, StatusBar} from 'react-native';", ",\n  Platform,\n  StatusBar,\n} from 'react-native';", content)
    content = re.sub(r"\n, StatusBar} from 'react-native';", ",\n  StatusBar,\n} from 'react-native';", content)

    # Fix the double comma in styles
    content = content.replace(",,", ",")

    with open(filepath, 'w') as f:
        f.write(content)

for root, _, files in os.walk('mobile/app'):
    for file in files:
        if file.endswith('.tsx'):
            process_file(os.path.join(root, file))
