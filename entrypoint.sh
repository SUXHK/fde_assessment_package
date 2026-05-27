#!/bin/sh
set -e

echo "==> Running prisma db push..."
./node_modules/.bin/prisma db push --skip-generate

if [ "${SEED_ON_EMPTY:-true}" = "true" ]; then
    echo "==> Checking seed data..."
    WORK_ITEM_COUNT=$(node --input-type=module -e 'import { PrismaClient } from "@prisma/client"; const prisma = new PrismaClient(); try { const count = await prisma.workItem.count(); console.log(count); } finally { await prisma.$disconnect(); }')

    if [ "$WORK_ITEM_COUNT" = "0" ]; then
        echo "==> Seeding empty database..."
        ./node_modules/.bin/tsx prisma/seed.ts
    else
        echo "==> Database already contains $WORK_ITEM_COUNT work items; skipping seed."
    fi
else
    echo "==> SEED_ON_EMPTY=false; skipping seed."
fi

echo "==> Starting Next.js server..."
node server.js
