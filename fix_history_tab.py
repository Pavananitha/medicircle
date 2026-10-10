import re
filepath = 'mobile/app/(patient)/_layout.tsx'
with open(filepath, 'r') as f:
    content = f.read()

content = content.replace("name=\"history\"\n        options={{\n          href: null,\n          title: 'History'", 
                          "name=\"history\"\n        options={{\n          title: 'History'")

with open(filepath, 'w') as f:
    f.write(content)
