import re

filepath = 'server/src/cron/missedDose.cron.ts'
with open(filepath, 'r') as f:
    content = f.read()

content = content.replace("import prisma from '../models';", "import { prisma } from '../config/prisma';")

with open(filepath, 'w') as f:
    f.write(content)
