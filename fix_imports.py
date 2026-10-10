import os
import re

for root, _, files in os.walk('server/src'):
    for file in files:
        if file.endswith('.ts'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            # Replace "@prisma/client" enum imports
            content = re.sub(
                r"import \{([^}]+)\} from '@prisma/client';",
                lambda m: f"import {{{m.group(1).replace('Platform', 'PlatformType as Platform')}}} from '{'../types' if 'controllers' in filepath or 'repositories' in filepath else './types'}';",
                content
            )
            # Remove any lingering Prisma casts that use as ...
            content = re.sub(r'as import\(\'@prisma/client\'\)\.\w+', '', content)
            
            with open(filepath, 'w') as f:
                f.write(content)
